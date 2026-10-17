import { createClient } from "npm:@supabase/supabase-js@2.45.4";

// ---------------------------------------------------------------------------
// CORS: explicit allowlist — no wildcard in production
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS: ReadonlySet<string> = new Set([
  "https://itismekittu-ops-pris-6wt7.bolt.host",
  "https://pristaine.com",
  "https://www.pristaine.com",
]);

function isAllowedOrigin(origin: string | null): boolean {
  return origin !== null && ALLOWED_ORIGINS.has(origin);
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = isAllowedOrigin(origin);
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
    "Vary": "Origin",
  };
  if (allowed) {
    headers["Access-Control-Allow-Origin"] = origin!;
  }
  return headers;
}

// ---------------------------------------------------------------------------
// Validation constants
// ---------------------------------------------------------------------------
const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 2000;
const MAX_COMPANY = 200;
const MAX_PHONE = 30;
const MAX_BODY_BYTES = 16_000;
const MIN_FORM_TIME_MS = 1500;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s\-()]{7,30}$/;

// Chat email follow-up mode (F2-US8)
const MAX_VISITOR_ID = 128;
const VISITOR_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const CONSENT_LINE_VERSION_PATTERN = /^v\d+$/;
const FOLLOWUP_MAX_ATTEMPTS = 5;
const FOLLOWUP_WINDOW_MINUTES = 60;
const FOLLOWUP_CONSENT_VERSION = "v1";


const ALLOWED_SOURCES = [
  "website",
  "organic",
  "referral",
  "social",
  "direct",
  "paid",
] as const;

// Sensitive-data patterns checked before persistence (BR-73).
// Applied to free-text fields (name, message, company, email) only — NOT
// the dedicated phone field, since a valid phone number can contain 13–16
// digits and would false-positive the card-number pattern.
const SENSITIVE_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: "card_number", pattern: /\b(?:\d[ -]?){13,16}\b/ },
  { name: "ssn", pattern: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/ },
  { name: "sin", pattern: /\b\d{3}[-\s]?\d{3}[-\s]?\d{3}\b/ },
  { name: "password_keyword", pattern: /\bpassword\b\s*[:=]\s*\S+/i },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonError(
  status: number,
  code: string,
  message: string,
  origin: string | null,
): Response {
  return new Response(
    JSON.stringify({ error: code, message }),
    {
      status,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    },
  );
}

function truncateHash(ip: string): string {
  // BR-75: store only shortened/hashed IP for abuse protection
  const parts = ip.split(".");
  if (parts.length === 4) {
    return parts.slice(0, 3).join(".") + ".x";
  }
  const segments = ip.split(":");
  return segments.slice(0, 2).join(":") + "::x";
}

// ---------------------------------------------------------------------------
// Chat email follow-up (F2-US8): server-side validation, rate limit, then the
// atomic lead upsert + session link + CRM queue via submit_chat_followup RPC.
// ---------------------------------------------------------------------------

async function handleChatFollowup(
  body: Record<string, unknown>,
  req: Request,
  origin: string | null,
): Promise<Response> {
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const visitorId = typeof body.visitor_id === "string" ? body.visitor_id.trim() : "";
  const sourcePage = typeof body.source_page === "string" ? body.source_page.trim().slice(0, 300) : "/";
  const consentVersion = typeof body.consent_line_version === "string"
    ? body.consent_line_version.trim()
    : "";
  const consentGiven = body.consent_given === true;

  if (email.length > MAX_EMAIL || !EMAIL_PATTERN.test(email)) {
    return jsonError(422, "validation_failed", "Enter a valid email address.", origin);
  }

  if (!consentGiven) {
    return jsonError(422, "consent_required", "Consent is required to request a follow-up.", origin);
  }

  if (!visitorId || visitorId.length > MAX_VISITOR_ID || !VISITOR_ID_PATTERN.test(visitorId)) {
    return jsonError(422, "invalid_visitor_id", "A valid chat session identifier is required.", origin);
  }

  if (consentVersion !== FOLLOWUP_CONSENT_VERSION) {
    return jsonError(422, "invalid_consent_version", "The follow-up consent terms have changed. Please try again.", origin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return jsonError(500, "server_error", "The service is temporarily unavailable.", origin);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Abuse limits, keyed on the privacy-preserving shortened IP (BR-75).
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimitKey = truncateHash(`chat_followup:${truncateHash(clientIp)}`);

  const { data: rlData, error: rlError } = await supabase.rpc(
    "check_and_record_rate_limit",
    { p_identifier: rateLimitKey, p_max_attempts: FOLLOWUP_MAX_ATTEMPTS, p_window_minutes: FOLLOWUP_WINDOW_MINUTES },
  );

  if (rlError) {
    console.error("Follow-up rate limit check failed:", rlError.code || "unknown");
    return jsonError(500, "server_error", "The service is temporarily unavailable.", origin);
  }

  const allowed = (rlData as Record<string, unknown>)?.allowed;
  if (allowed !== true) {
    return jsonError(429, "rate_limited", "Too many follow-up requests. Please try again later.", origin);
  }

  const { data, error: rpcError } = await supabase.rpc("submit_chat_followup", {
    p_email: email,
    p_visitor_id: visitorId,
    p_source_page: sourcePage,
    p_consent_line_version: consentVersion,
  });

  if (rpcError) {
    if (rpcError.message?.includes("no_matching_chat_session") || rpcError.code === "P0002") {
      return jsonError(422, "no_matching_chat_session", "We could not find this conversation. Please try again.", origin);
    }
    console.error("Chat follow-up RPC failed:", rpcError.code || "unknown");
    return jsonError(500, "server_error", "We could not save your request. Please try again.", origin);
  }

  console.log("Chat follow-up succeeded:", {
    lead_id: (data as Record<string, unknown>)?.lead_id,
    chat_session_id: (data as Record<string, unknown>)?.chat_session_id,
  });

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } },
  );
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return jsonError(405, "method_not_allowed", "Use POST to submit a contact form.", origin);
  }

  try {
    // --- Body size check ---
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return jsonError(413, "payload_too_large", "The submission is too large.", origin);
    }

    const rawText = await req.text();
    if (rawText.length > MAX_BODY_BYTES) {
      return jsonError(413, "payload_too_large", "The submission is too large.", origin);
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawText);
    } catch {
      return jsonError(400, "invalid_json", "The request body must be valid JSON.", origin);
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return jsonError(400, "invalid_body", "The request body must be a JSON object.", origin);
    }

    // =====================================================================
    // Chat email follow-up mode (F2-US8): email-only lead linked to the
    // visitor's existing chat session. Independently validated here.
    // =====================================================================
    if (body.mode === "chat_followup") {
      return handleChatFollowup(body, req, origin);
    }

    // --- Extract fields ---
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const company = typeof body.company === "string" ? body.company.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const honeypot = typeof body.company_website === "string" ? body.company_website.trim() : "";
    const formStartTime = typeof body._form_start === "number" ? body._form_start : null;
    const sourcePage = typeof body.source_page === "string" ? body.source_page.trim() : "/";
    const source = typeof body.source === "string" ? body.source.trim() : "";
    const campaign = typeof body.campaign === "string" ? body.campaign.trim() : "";
    const consentLineVersion = typeof body.consent_line_version === "string"
      ? body.consent_line_version.trim()
      : "v1";

    // --- Honeypot check ---
    if (honeypot) {
      // Silently accept but don't save — bots get a 200 but nothing is stored
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } },
      );
    }

    // --- Timing check: too-fast submissions are likely bots ---
    if (formStartTime !== null) {
      const elapsed = Date.now() - formStartTime;
      if (elapsed < MIN_FORM_TIME_MS) {
        return jsonError(422, "too_fast", "Please take a moment to fill out the form.", origin);
      }
    }

    // --- Server-side validation: required fields ---
    const errors: Record<string, string> = {};

    if (!name) {
      errors.name = "Name is required.";
    } else if (name.length > MAX_NAME) {
      errors.name = `Name must be ${MAX_NAME} characters or fewer.`;
    }

    if (!email) {
      errors.email = "Email is required.";
    } else if (email.length > MAX_EMAIL) {
      errors.email = `Email must be ${MAX_EMAIL} characters or fewer.`;
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.email = "Enter a valid email address.";
    }

    if (!message) {
      errors.message = "Message is required.";
    } else if (message.length > MAX_MESSAGE) {
      errors.message = `Message must be ${MAX_MESSAGE} characters or fewer.`;
    }

    // --- Optional field validation ---
    if (company && company.length > MAX_COMPANY) {
      errors.company = `Company must be ${MAX_COMPANY} characters or fewer.`;
    }

    if (phone) {
      if (phone.length > MAX_PHONE) {
        errors.phone = `Phone must be ${MAX_PHONE} characters or fewer.`;
      } else if (!PHONE_PATTERN.test(phone)) {
        errors.phone = "Enter a valid phone number.";
      }
    }

    if (Object.keys(errors).length > 0) {
      return new Response(
        JSON.stringify({ error: "validation_failed", field_errors: errors }),
        { status: 422, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } },
      );
    }

    // --- Source/campaign allowlist ---
    const safeSource = ALLOWED_SOURCES.includes(source as typeof ALLOWED_SOURCES[number])
      ? source
      : "";
    const safeCampaign = campaign.length <= 100 ? campaign : "";

    // --- Sensitive-data check before persistence (BR-73) ---
    // Check free-text fields ONLY — not the phone field, which is validated
    // separately and can legitimately contain 13–16 digits.
    const freeText = `${name} ${email} ${message} ${company}`;
    for (const { pattern } of SENSITIVE_PATTERNS) {
      if (pattern.test(freeText)) {
        return jsonError(
          422,
          "sensitive_data",
          "Your message appears to contain sensitive information (such as a card number or ID). Please remove it and try again.",
          origin,
        );
      }
    }

    // --- Supabase client with service role key ---
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return jsonError(500, "server_error", "The service is temporarily unavailable.", origin);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // --- Rate limiting: atomic count-and-record via SECURITY DEFINER RPC ---
    // Fail closed: if the rate-limit function errors, reject the submission.
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rateLimitKey = truncateHash(clientIp);

    const { data: rlData, error: rlError } = await supabase.rpc(
      "check_and_record_rate_limit",
      { p_identifier: rateLimitKey },
    );

    if (rlError) {
      console.error("Rate limit check failed:", rlError.code || "unknown");
      return jsonError(500, "server_error", "The service is temporarily unavailable.", origin);
    }

    const allowed = (rlData as Record<string, unknown>)?.allowed;
    if (allowed !== true) {
      return jsonError(429, "rate_limited", "Too many submissions. Please try again later.", origin);
    }

    // --- Atomic contact submission via SECURITY DEFINER RPC ---
    const { data, error: rpcError } = await supabase.rpc("submit_contact", {
      p_name: name,
      p_email: email,
      p_message: message,
      p_company: company || null,
      p_phone: phone || null,
      p_source_page: sourcePage,
      p_source: safeSource || null,
      p_campaign: safeCampaign || null,
      p_consent_line_version: consentLineVersion,
    });

    if (rpcError) {
      console.error("Contact submission RPC failed:", rpcError.code || "unknown");
      return jsonError(500, "server_error", "We could not save your message. Please try again.", origin);
    }

    // Log only non-sensitive status info (ARC-FRM-02)
    console.log("Contact submission succeeded:", {
      lead_id: (data as Record<string, unknown>)?.lead_id,
      submission_id: (data as Record<string, unknown>)?.submission_id,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Unhandled error in contact-submit:", err instanceof Error ? err.message : "unknown");
    return jsonError(500, "server_error", "Something went wrong. Please try again.", origin);
  }
});
