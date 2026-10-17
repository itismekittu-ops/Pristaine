import { createClient } from "npm:@supabase/supabase-js@2.45.4";

/**
 * Pristaine -> HubSpot contact sync worker.
 *
 * Processes crm_sync_log rows where record_type='lead' and action='upsert_contact'.
 * Only syncs contact identity fields (email, first/last name, phone, company).
 * Does NOT send form message text, chat transcripts, or booking details to HubSpot.
 *
 * Required Edge Function secrets:
 *   HUBSPOT_PRIVATE_APP_TOKEN
 *   HUBSPOT_SYNC_CRON_SECRET
 *   HUBSPOT_SYNC_ENABLED (must be exactly "true" to perform writes)
 *
 * Uses a custom X-Cron-Secret header because Supabase JWT verification is disabled
 * for this scheduled server-to-server function. Never expose that secret in a browser.
 */

const MAX_BATCH_SIZE = 10;
const HUBSPOT_BASE = "https://api.hubapi.com";
const HUBSPOT_API = "/crm/objects/2026-03/contacts";

type JsonObject = Record<string, unknown>;

interface SyncJob {
  id: string;
  record_id: string;
  attempts: number;
  max_attempts: number;
  hubspot_id: string | null;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  email_normalized: string;
  phone: string | null;
  company: string | null;
  hubspot_contact_id: string | null;
}

class HubSpotApiError extends Error {
  constructor(
    readonly status: number,
    readonly safeCode: string,
  ) {
    super(safeCode);
    this.name = "HubSpotApiError";
  }
}

function jsonResponse(status: number, body: JsonObject): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

function retryAt(attempts: number, retryAfterSeconds?: number): string {
  const fallbackSeconds = Math.min(3600, 60 * (2 ** Math.max(0, attempts - 1)));
  const seconds = Math.max(1, Math.min(3600, retryAfterSeconds ?? fallbackSeconds));
  return new Date(Date.now() + seconds * 1000).toISOString();
}

async function hubspotRequest(
  token: string,
  path: string,
  method: string,
  body?: JsonObject,
): Promise<JsonObject> {
  let response: Response;
  try {
    response = await fetch(`${HUBSPOT_BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new HubSpotApiError(503, "hubspot_network_error");
  }

  if (!response.ok) {
    const retryAfterHeader = response.headers.get("Retry-After");
    const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : undefined;
    const safeCode = Number.isFinite(retryAfter)
      ? `hubspot_http_${response.status}_retry_after_${Math.max(1, Math.min(3600, retryAfter!))}`
      : `hubspot_http_${response.status}`;
    // Do not log/return the raw response body: it can contain CRM data.
    throw new HubSpotApiError(response.status, safeCode);
  }

  if (response.status === 204) return {};
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as JsonObject;
  } catch {
    throw new HubSpotApiError(502, "hubspot_invalid_json_response");
  }
}

function contactProperties(lead: Lead): Record<string, string> {
  const properties: Record<string, string> = {
    email: lead.email_normalized || lead.email.trim().toLowerCase(),
  };
  if (typeof lead.name === "string" && lead.name.trim()) {
    const nameParts = lead.name.trim().split(/\s+/).filter(Boolean);
    if (nameParts.length > 0) properties.firstname = nameParts[0];
    if (nameParts.length > 1) properties.lastname = nameParts.slice(1).join(" ");
  }
  if (lead.phone?.trim()) properties.phone = lead.phone.trim();
  if (lead.company?.trim()) properties.company = lead.company.trim();
  return properties;
}

async function findContactByEmail(token: string, email: string): Promise<string | null> {
  const result = await hubspotRequest(token, `${HUBSPOT_API}/search`, "POST", {
    filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: email }] }],
    properties: ["email"],
    limit: 2,
  });
  const results = Array.isArray(result.results) ? result.results as JsonObject[] : [];
  if (results.length > 1) throw new HubSpotApiError(409, "hubspot_ambiguous_email_match");
  const id = results[0]?.id;
  return typeof id === "string" ? id : null;
}

async function upsertHubSpotContact(token: string, lead: Lead, queuedHubSpotId: string | null): Promise<string> {
  const properties = contactProperties(lead);
  const email = properties.email;
  let contactId = queuedHubSpotId || lead.hubspot_contact_id;

  // Prefer a previously stored HubSpot ID. If it is stale (404), look up by email.
  if (contactId) {
    try {
      await hubspotRequest(token, `${HUBSPOT_API}/${encodeURIComponent(contactId)}`, "PATCH", { properties });
      return contactId;
    } catch (error) {
      if (!(error instanceof HubSpotApiError) || error.status !== 404) throw error;
      contactId = null;
    }
  }

  contactId = await findContactByEmail(token, email);
  if (contactId) {
    await hubspotRequest(token, `${HUBSPOT_API}/${encodeURIComponent(contactId)}`, "PATCH", { properties });
    return contactId;
  }

  try {
    const created = await hubspotRequest(token, HUBSPOT_API, "POST", { properties });
    if (typeof created.id !== "string" || !created.id) {
      throw new HubSpotApiError(502, "hubspot_create_missing_id");
    }
    return created.id;
  } catch (error) {
    // A concurrent submission may create the contact after our search. Recover by email.
    if (error instanceof HubSpotApiError && (error.status === 409 || error.status === 400)) {
      const afterCreate = await findContactByEmail(token, email);
      if (afterCreate) {
        await hubspotRequest(token, `${HUBSPOT_API}/${encodeURIComponent(afterCreate)}`, "PATCH", { properties });
        return afterCreate;
      }
    }
    throw error;
  }
}

async function finishJob(
  supabase: ReturnType<typeof createClient>,
  job: SyncJob,
  result: { status: "succeeded" | "failed" | "exhausted"; hubspotId?: string; errorCode?: string; retryAt?: string },
): Promise<boolean> {
  const patch: Record<string, unknown> = {
    status: result.status,
    updated_at: new Date().toISOString(),
    next_retry_at: result.retryAt ?? null,
    error_code: result.errorCode ?? null,
  };
  if (result.hubspotId) patch.hubspot_id = result.hubspotId;

  // Save the HubSpot ID to the lead before marking the queue item successful.
  // If this write fails, the job remains in_progress and can be reclaimed after
  // the stale-job timeout; email search keeps the HubSpot operation idempotent.
  if (result.status === "succeeded" && result.hubspotId) {
    const { error: leadError } = await supabase
      .from("leads")
      .update({ hubspot_contact_id: result.hubspotId, updated_at: new Date().toISOString() })
      .eq("id", job.record_id);
    if (leadError) return false;
  }

  const { error } = await supabase.from("crm_sync_log").update(patch).eq("id", job.id);
  return !error;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });
  if (req.method !== "POST") return jsonResponse(405, { error: "method_not_allowed" });

  const cronSecret = Deno.env.get("HUBSPOT_SYNC_CRON_SECRET") ?? "";
  const providedSecret = req.headers.get("X-Cron-Secret") ?? "";
  if (!timingSafeEqual(cronSecret, providedSecret)) {
    return jsonResponse(403, { error: "forbidden" });
  }

  if (Deno.env.get("HUBSPOT_SYNC_ENABLED") !== "true") {
    return jsonResponse(200, { status: "disabled", processed: 0, message: "HubSpot sync is disabled." });
  }

  const hubspotToken = Deno.env.get("HUBSPOT_PRIVATE_APP_TOKEN") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!hubspotToken || !supabaseUrl || !serviceRoleKey) {
    console.error("hubspot_sync_configuration_error");
    return jsonResponse(503, { error: "integration_not_configured" });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  let batchSize = 10;
  try {
    const contentLength = Number(req.headers.get("content-length") ?? "0");
    if (contentLength > 2000) return jsonResponse(413, { error: "payload_too_large" });
    const raw = await req.text();
    if (raw.length > 2000) return jsonResponse(413, { error: "payload_too_large" });
    if (raw) {
      const body = JSON.parse(raw) as JsonObject;
      if (typeof body.batch_size === "number" && Number.isFinite(body.batch_size)) {
        batchSize = Math.max(1, Math.min(MAX_BATCH_SIZE, Math.floor(body.batch_size)));
      }
    }
  } catch {
    return jsonResponse(400, { error: "invalid_json" });
  }

  // Only validate the HubSpot token/scopes when there is queued work. This
  // avoids marking every queue row exhausted because a token/scope is wrong.
  const { count: pendingCount, error: countError } = await supabase
    .from("crm_sync_log")
    .select("id", { count: "exact", head: true })
    .eq("record_type", "lead")
    .eq("action", "upsert_contact")
    .in("status", ["pending", "failed"]);
  if (countError) {
    console.error("hubspot_sync_queue_check_failed", countError.code || "unknown");
    return jsonResponse(500, { error: "queue_check_failed" });
  }

  if ((pendingCount ?? 0) > 0) {
    try {
      await hubspotRequest(hubspotToken, `${HUBSPOT_API}?limit=1&properties=email`, "GET");
    } catch (error) {
      const code = error instanceof HubSpotApiError ? error.safeCode : "hubspot_preflight_failed";
      console.error("hubspot_sync_preflight_failed", code);
      return jsonResponse(502, { error: "hubspot_preflight_failed", code });
    }
  }

  const { data: jobs, error: claimError } = await supabase.rpc("claim_hubspot_sync_jobs", {
    p_batch_size: batchSize,
  });
  if (claimError) {
    console.error("hubspot_sync_claim_failed", claimError.code || "unknown");
    return jsonResponse(500, { error: "queue_claim_failed" });
  }

  const claimed = Array.isArray(jobs) ? jobs as SyncJob[] : [];
  const totals = { claimed: claimed.length, succeeded: 0, retried: 0, exhausted: 0, internal_errors: 0 };

  for (const job of claimed) {
    try {
      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .select("id,name,email,email_normalized,phone,company,hubspot_contact_id")
        .eq("id", job.record_id)
        .maybeSingle();

      if (leadError || !lead || typeof lead.email !== "string" || !lead.email.trim()) {
        const ok = await finishJob(supabase, job, { status: "exhausted", errorCode: "lead_record_missing_or_invalid" });
        if (ok) totals.exhausted++; else totals.internal_errors++;
        continue;
      }

      const hubspotId = await upsertHubSpotContact(hubspotToken, lead as Lead, job.hubspot_id);
      const ok = await finishJob(supabase, job, { status: "succeeded", hubspotId });
      if (ok) totals.succeeded++; else totals.internal_errors++;
    } catch (error) {
      const status = error instanceof HubSpotApiError ? error.status : 503;
      const code = error instanceof HubSpotApiError ? error.safeCode : "hubspot_unexpected_error";
      const retryable = isRetryableStatus(status);
      const attempts = Number(job.attempts) || 1;
      const maxAttempts = Number(job.max_attempts) || 5;

      if (!retryable) {
        const ok = await finishJob(supabase, job, { status: "exhausted", errorCode: code });
        if (ok) totals.exhausted++; else totals.internal_errors++;
        console.error("hubspot_sync_permanent_error", code);
      } else if (attempts >= maxAttempts) {
        const ok = await finishJob(supabase, job, { status: "exhausted", errorCode: code });
        if (ok) totals.exhausted++; else totals.internal_errors++;
        console.error("hubspot_sync_retries_exhausted", code);
      } else {
        let retryAfter: number | undefined;
        const match = code.match(/retry_after_(\d+)/);
        if (match) retryAfter = Number(match[1]);
        const ok = await finishJob(supabase, job, {
          status: "failed",
          errorCode: code,
          retryAt: retryAt(attempts, retryAfter),
        });
        if (ok) totals.retried++; else totals.internal_errors++;
        console.error("hubspot_sync_retry_scheduled", code);
      }
    }
  }

  console.log("hubspot_sync_batch_completed", totals);
  return jsonResponse(200, { status: "completed", ...totals });
});
