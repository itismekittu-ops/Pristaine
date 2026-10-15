import { createClient } from "npm:@supabase/supabase-js@2.45.4";

// ---------------------------------------------------------------------------
// CORS headers (mandatory on all responses)
// ---------------------------------------------------------------------------
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ---------------------------------------------------------------------------
// Configuration constants
// ---------------------------------------------------------------------------

/** Look-back window: sync events that started up to N days ago. */
const LOOK_BACK_DAYS = 30;
/** Look-ahead window: sync events starting up to N days from now. */
const LOOK_AHEAD_DAYS = 90;
/** Maximum pages to fetch per status (active / canceled) to stay within limits. */
const MAX_PAGES = 20;
/** Page size for Calendly API requests. */
const PAGE_SIZE = 50;
/** Timeout for Calendly API calls in milliseconds. */
const API_TIMEOUT_MS = 15_000;

const CALENDLY_API_BASE = "https://api.calendly.com";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------------------------------------------------------------------
// Timing-safe secret comparison
// ---------------------------------------------------------------------------

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(
  status: number,
  body: Record<string, unknown>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function log(message: string, data?: Record<string, unknown>) {
  // Log only non-sensitive status info: counts, timestamps, error codes.
  // Never log emails, names, tokens, or raw API payloads.
  if (data) {
    console.log(message, data);
  } else {
    console.log(message);
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// ---------------------------------------------------------------------------
// Calendly API client
// ---------------------------------------------------------------------------

async function calendlyFetch(
  path: string,
  params: Record<string, string>,
  token: string,
): Promise<Response> {
  const url = new URL(`${CALENDLY_API_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

interface CalendlyUser {
  resource: {
    uri: string;
    scheduling_url: string;
    current_organization: string;
  };
}

interface CalendlyEvent {
  uri: string;
  name: string;
  status: string; // "active" or "canceled"
  start_time: string;
  end_time: string;
  event_type: string;
  location: unknown;
  invitees_counter: {
    total: number;
    active: number;
    limit: number;
  };
}

interface CalendlyInvitee {
  uri: string;
  email: string;
  name: string;
  status: string;
  canceled: boolean;
}

interface CalendlyEventResponse {
  collection: {
    data: CalendlyEvent[];
    pagination: {
      next_page: string | null;
    };
  };
}

interface CalendlyInviteeResponse {
  collection: {
    data: CalendlyInvitee[];
    pagination: {
      next_page: string | null;
    };
  };
}

async function getUserUri(token: string): Promise<string> {
  const response = await calendlyFetch("/users/me", {}, token);

  if (response.status === 401 || response.status === 403) {
    throw new Error(`calendly_auth_error:${response.status}`);
  }
  if (response.status === 429) {
    throw new Error("calendly_rate_limited");
  }
  if (!response.ok) {
    throw new Error(`calendly_api_error:${response.status}`);
  }

  const body = (await response.json()) as CalendlyUser;
  return body.resource.uri;
}

async function fetchEvents(
  token: string,
  userUri: string,
  status: "active" | "canceled",
  minStartTime: string,
  maxStartTime: string,
): Promise<CalendlyEvent[]> {
  const allEvents: CalendlyEvent[] = [];
  let pageToken: string | null = null;
  let pageCount = 0;

  while (pageCount < MAX_PAGES) {
    const params: Record<string, string> = {
      user: userUri,
      status,
      min_start_time: minStartTime,
      max_start_time: maxStartTime,
      count: String(PAGE_SIZE),
    };
    if (pageToken) {
      params.page_token = pageToken;
    }

    const response = await calendlyFetch("/scheduled_events", params, token);

    if (response.status === 401 || response.status === 403) {
      throw new Error(`calendly_auth_error:${response.status}`);
    }
    if (response.status === 429) {
      throw new Error("calendly_rate_limited");
    }
    if (!response.ok) {
      throw new Error(`calendly_api_error:${response.status}`);
    }

    const body = (await response.json()) as CalendlyEventResponse;
    allEvents.push(...body.collection.data);

    pageToken = body.collection.pagination?.next_page ?? null;
    if (!pageToken) break;
    pageCount++;
  }

  return allEvents;
}

async function fetchInvitees(
  token: string,
  eventUri: string,
): Promise<CalendlyInvitee[]> {
  const allInvitees: CalendlyInvitee[] = [];
  let nextPage: string | null = null;
  let pageCount = 0;

  while (pageCount < MAX_PAGES) {
    let response: Response;
    if (nextPage) {
      response = await fetch(nextPage, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
      });
    } else {
      response = await calendlyFetch(
        "//scheduled_events/invitees",
        { event: eventUri },
        token,
      );
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error(`calendly_auth_error:${response.status}`);
    }
    if (response.status === 429) {
      throw new Error("calendly_rate_limited");
    }
    if (!response.ok) {
      throw new Error(`calendly_api_error:${response.status}`);
    }

    const body = (await response.json()) as CalendlyInviteeResponse;
    allInvitees.push(...body.collection.data);

    nextPage = body.collection.pagination?.next_page ?? null;
    if (!nextPage) break;
    pageCount++;
  }

  return allInvitees;
}

// ---------------------------------------------------------------------------
// Booking sync logic
// ---------------------------------------------------------------------------

interface SyncResult {
  active_created: number;
  active_updated: number;
  cancelled_updated: number;
  leads_created: number;
  leads_linked: number;
  crm_queued: number;
  errors: number;
}

async function syncBooking(
  supabase: ReturnType<typeof createClient>,
  event: CalendlyEvent,
  invitees: CalendlyInvitee[],
  result: SyncResult,
): Promise<void> {
  const eventId = event.uri;
  const startTime = event.start_time;
  const endTime = event.end_time;
  const status = event.status === "canceled" ? "cancelled" : "scheduled";

  // Check for existing booking by calendly_event_id
  const { data: existingBooking, error: bookingErr } = await supabase
    .from("bookings")
    .select("id, lead_id, status")
    .eq("calendly_event_id", eventId)
    .maybeSingle();

  if (bookingErr) {
    log("Booking lookup failed", { error_code: bookingErr.code });
    result.errors++;
    return;
  }

  let leadId: string | null = existingBooking?.lead_id ?? null;

  // Only fetch invitee data for active events or new bookings
  if (event.status === "active" || !existingBooking) {
    const activeInvitees = invitees.filter(
      (inv) => !inv.canceled && inv.status === "active",
    );

    if (activeInvitees.length > 0) {
      const invitee = activeInvitees[0];
      const normalizedEmail = normalizeEmail(invitee.email);

      if (EMAIL_PATTERN.test(normalizedEmail)) {
        // Look for an existing lead by normalized email
        const { data: existingLead, error: leadErr } = await supabase
          .from("leads")
          .select("id, phone, company, source, campaign")
          .eq("email_normalized", normalizedEmail)
          .maybeSingle();

        if (leadErr) {
          log("Lead lookup failed", { error_code: leadErr.code });
          result.errors++;
          return;
        }

        if (existingLead) {
          leadId = existingLead.id as string;
          result.leads_linked++;
        } else if (invitee.name && invitee.email) {
          // Create a new lead with source identifying the Calendly booking.
          // Do NOT mark as marketing contact (no marketing flag in schema;
          // source is set to "calendly" to distinguish from form submissions).
          const { data: newLead, error: createErr } = await supabase
            .from("leads")
            .insert({
              name: invitee.name,
              email: invitee.email,
              email_normalized: normalizedEmail,
              source: "calendly",
            })
            .select("id")
            .single();

          if (createErr) {
            // If it's a unique constraint violation, the lead was created
            // concurrently — re-fetch it
            if (createErr.code === "23505") {
              const { data: retryLead } = await supabase
                .from("leads")
                .select("id")
                .eq("email_normalized", normalizedEmail)
                .maybeSingle();
              if (retryLead) {
                leadId = retryLead.id as string;
                result.leads_linked++;
              } else {
                result.errors++;
                return;
              }
            } else {
              log("Lead creation failed", { error_code: createErr.code });
              result.errors++;
              return;
            }
          } else {
            leadId = newLead.id as string;
            result.leads_created++;
          }
        }
      }
    }
  }

  if (existingBooking) {
    // Update existing booking — only if status changed
    if (existingBooking.status !== status) {
      const { error: updateErr } = await supabase
        .from("bookings")
        .update({
          status,
          start_time: startTime,
          end_time: endTime,
          lead_id: leadId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingBooking.id);

      if (updateErr) {
        log("Booking update failed", { error_code: updateErr.code });
        result.errors++;
      } else {
        if (status === "cancelled") {
          result.cancelled_updated++;
        } else {
          result.active_updated++;
        }
      }
    }
  } else {
    // Create new booking
    const { error: insertErr } = await supabase
      .from("bookings")
      .insert({
        calendly_event_id: eventId,
        lead_id: leadId,
        start_time: startTime,
        end_time: endTime,
        status,
      });

    if (insertErr) {
      // If unique constraint on calendly_event_id, it was created concurrently
      if (insertErr.code === "23505") {
        log("Booking already exists (concurrent)", { event_id: "redacted" });
      } else {
        log("Booking insert failed", { error_code: insertErr.code });
        result.errors++;
      }
    } else {
      result.active_created++;
    }
  }

  // Queue CRM sync for the booking (without calling HubSpot)
  if (leadId) {
    const { data: existingSync } = await supabase
      .from("crm_sync_log")
      .select("id")
      .eq("record_type", "booking")
      .eq("record_id", existingBooking?.id ?? "")
      .eq("status", "pending")
      .maybeSingle();

    if (!existingSync || !existingBooking) {
      // Queue a lead sync if the lead was newly created or linked
      const { data: existingLeadSync } = await supabase
        .from("crm_sync_log")
        .select("id")
        .eq("record_type", "lead")
        .eq("record_id", leadId)
        .eq("status", "pending")
        .maybeSingle();

      if (!existingLeadSync) {
        await supabase
          .from("crm_sync_log")
          .insert({
            record_type: "lead",
            record_id: leadId,
            action: "upsert_contact",
            status: "pending",
            next_retry_at: new Date().toISOString(),
          });
        result.crm_queued++;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // --- Validate scheduler secret ---
  const cronSecret = Deno.env.get("CALENDLY_SYNC_CRON_SECRET") ?? "";
  const providedSecret =
    req.headers.get("X-Cron-Secret") ??
    new URL(req.url).searchParams.get("secret") ??
    "";

  if (!cronSecret || !providedSecret || !timingSafeCompare(providedSecret, cronSecret)) {
    log("Unauthorized scheduler invocation rejected");
    return jsonResponse(403, {
      error: "unauthorized",
      message: "Invalid or missing scheduler secret.",
    });
  }

  // --- Check required environment ---
  const calendlyToken = Deno.env.get("CALENDLY_API_TOKEN") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!calendlyToken) {
    log("Missing CALENDLY_API_TOKEN secret");
    return jsonResponse(500, {
      error: "config_error",
      message: "Required configuration is missing.",
    });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    log("Missing Supabase credentials");
    return jsonResponse(500, {
      error: "config_error",
      message: "Required configuration is missing.",
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    // --- Step 1: Get user URI ---
    log("Fetching Calendly user URI");
    const userUri = await getUserUri(calendlyToken);
    log("User URI fetched", { status: "ok" });

    // --- Step 2: Calculate time window ---
    const now = new Date();
    const minStart = new Date(now.getTime() - LOOK_BACK_DAYS * 24 * 60 * 60 * 1000);
    const maxStart = new Date(now.getTime() + LOOK_AHEAD_DAYS * 24 * 60 * 60 * 1000);
    const minStartTime = minStart.toISOString();
    const maxStartTime = maxStart.toISOString();

    log("Sync window", {
      look_back_days: LOOK_BACK_DAYS,
      look_ahead_days: LOOK_AHEAD_DAYS,
      min_start: minStartTime,
      max_start: maxStartTime,
    });

    // --- Step 3: Fetch active and canceled events ---
    const [activeEvents, canceledEvents] = await Promise.all([
      fetchEvents(calendlyToken, userUri, "active", minStartTime, maxStartTime),
      fetchEvents(calendlyToken, userUri, "canceled", minStartTime, maxStartTime),
    ]);

    log("Events fetched", {
      active_count: activeEvents.length,
      canceled_count: canceledEvents.length,
    });

    // --- Step 4: Sync each event ---
    const result: SyncResult = {
      active_created: 0,
      active_updated: 0,
      cancelled_updated: 0,
      leads_created: 0,
      leads_linked: 0,
      crm_queued: 0,
      errors: 0,
    };

    // Process active events first, then canceled
    for (const event of activeEvents) {
      let invitees: CalendlyInvitee[] = [];
      if (event.invitees_counter?.total > 0) {
        try {
          invitees = await fetchInvitees(calendlyToken, event.uri);
        } catch (err) {
          log("Failed to fetch invitees", {
            error: err instanceof Error ? err.message : "unknown",
          });
        }
      }
      await syncBooking(supabase, event, invitees, result);
    }

    for (const event of canceledEvents) {
      // For canceled events, we only need to update the booking status.
      // No need to fetch invitees unless the booking doesn't exist yet.
      const { data: existingBooking } = await supabase
        .from("bookings")
        .select("id")
        .eq("calendly_event_id", event.uri)
        .maybeSingle();

      if (!existingBooking) {
        // Canceled event without a booking record — fetch invitees to
        // create a complete record for auditability.
        let invitees: CalendlyInvitee[] = [];
        if (event.invitees_counter?.total > 0) {
          try {
            invitees = await fetchInvitees(calendlyToken, event.uri);
          } catch (err) {
            log("Failed to fetch invitees for canceled event", {
              error: err instanceof Error ? err.message : "unknown",
            });
          }
        }
        await syncBooking(supabase, event, invitees, result);
      } else {
        await syncBooking(supabase, event, [], result);
      }
    }

    log("Sync completed", {
      active_created: result.active_created,
      active_updated: result.active_updated,
      cancelled_updated: result.cancelled_updated,
      leads_created: result.leads_created,
      leads_linked: result.leads_linked,
      crm_queued: result.crm_queued,
      errors: result.errors,
    });

    // If there were errors, return a non-200 so the checkpoint is not advanced
    if (result.errors > 0) {
      return jsonResponse(207, {
        status: "partial_success",
        ...result,
      });
    }

    return jsonResponse(200, {
      status: "success",
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";

    if (message.startsWith("calendly_auth_error:")) {
      const status = message.split(":")[1];
      log("Calendly auth error", { http_status: status });
      return jsonResponse(502, {
        error: "calendly_auth_error",
        message: "Calendly API rejected the configured token.",
      });
    }

    if (message === "calendly_rate_limited") {
      log("Calendly rate limited");
      return jsonResponse(429, {
        error: "rate_limited",
        message: "Calendly API rate limit reached. Will retry on next schedule.",
      });
    }

    if (message.includes("aborted") || message.includes("timeout")) {
      log("Calendly API timeout");
      return jsonResponse(504, {
        error: "timeout",
        message: "Calendly API request timed out.",
      });
    }

    log("Sync failed", { error: message });
    return jsonResponse(500, {
      error: "sync_failed",
      message: "Synchronization encountered an unexpected error.",
    });
  }
});
