// Error monitoring — integrates with Sentry when available
// To enable: set SENTRY_DSN or NEXT_PUBLIC_SENTRY_DSN env var and install @sentry/nextjs

let sentryInitialized = false;
let SentryModule: typeof import('@sentry/nextjs') | null = null;

export async function initMonitoring(): Promise<void> {
  if (typeof window !== 'undefined') return;
  if (sentryInitialized) return;
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  try {
    // Dynamic import to avoid requiring @sentry/nextjs at build time
    SentryModule = await import('@sentry/nextjs');
    SentryModule.init({
      dsn,
      environment: process.env.APP_ENV || process.env.NODE_ENV || 'development',
      tracesSampleRate: 0.1,
    });
    console.log('[Monitoring] Sentry initialized');
    sentryInitialized = true;
  } catch (err) {
    console.warn('[Monitoring] Sentry not available:', err instanceof Error ? err.message : err);
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
  if (SentryModule) {
    SentryModule.captureException(error, { extra: safeContext });
    return;
  }
  console.error('[Error]', error.message);
}

export function captureEvent(
  message: string,
  data?: Record<string, unknown>,
) {
  if (process.env.NODE_ENV === 'development') return;
  const safeData = sanitizeContext(data);
  if (SentryModule) {
    SentryModule.captureMessage(message, { extra: safeData });
    return;
  }
  console.log('[Event]', message, safeData ? JSON.stringify(safeData) : '');
}
