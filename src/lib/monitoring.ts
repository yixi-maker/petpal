// Error monitoring placeholder — ready for Sentry integration
// To enable: set SENTRY_DSN env var and install @sentry/nextjs

let sentryInitialized = false;

export function initMonitoring() {
  if (typeof window !== 'undefined') return;
  if (sentryInitialized) return;
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  try {
    // Dynamic import to avoid requiring @sentry/nextjs at build time
    console.log(
      '[Monitoring] Sentry DSN configured. To enable: npm install @sentry/nextjs',
    );
    // In production with @sentry/nextjs installed:
    // import('@sentry/nextjs').then(Sentry =>
    //   Sentry.init({ dsn, environment: process.env.NODE_ENV }),
    // );
    sentryInitialized = true;
  } catch {
    /* optional dep */
  }
}

// ---------------------------------------------------------------------------
// Data sanitization helpers
// ---------------------------------------------------------------------------

/**
 * Sanitize a phone number by masking the middle 4 digits.
 * E.g., 13812345678 becomes 138****5678
 */
function sanitizePhone(text: string): string {
  return text.replace(/(\d{3})\d{4}(\d{4})/g, '$1****$2');
}

/**
 * Sanitize health/symptom details: redact full symptom text, keep only
 * the risk-level category when present.
 */
function sanitizeHealthDetails(data?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!data) return data;
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    // Redact raw symptom text but preserve risk category
    if (key === 'symptoms' || key === 'symptomText' || key === 'description') {
      sanitized[key] = '[redacted]';
    } else if (key === 'riskLevel') {
      sanitized[key] = value;
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizePhone(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Sanitize a context object recursively, applying phone number masking
 * and symptom text redaction.
 */
function sanitizeContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!context) return context;
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (typeof value === 'string') {
      // Redact symptom/health detail fields
      if (
        key === 'symptoms' ||
        key === 'symptomText' ||
        key === 'description' ||
        key === 'content'
      ) {
        sanitized[key] = '[redacted]';
      } else {
        sanitized[key] = sanitizePhone(value);
      }
    } else if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    ) {
      sanitized[key] = sanitizeHealthDetails(
        value as Record<string, unknown>,
      );
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// ---------------------------------------------------------------------------
// Capture functions
// ---------------------------------------------------------------------------

export function captureError(
  error: Error,
  context?: Record<string, unknown>,
) {
  const safeContext = sanitizeContext(context);
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', error.message, safeContext || '');
    return;
  }
  // In production with Sentry: Sentry.captureException(error, { extra: safeContext });
  console.error('[Error]', error.message);
}

export function captureEvent(
  message: string,
  data?: Record<string, unknown>,
) {
  if (process.env.NODE_ENV === 'development') return;
  const safeData = sanitizeContext(data);
  // In production with Sentry: Sentry.captureMessage(message, { extra: safeData });
  console.log('[Event]', message, safeData ? JSON.stringify(safeData) : '');
}
