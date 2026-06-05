// Error monitoring placeholder — ready for Sentry integration
// To enable: set SENTRY_DSN env var and install @sentry/nextjs

let sentryInitialized = false;

export function initMonitoring() {
  if (typeof window !== 'undefined') return; // browser — skip for now
  if (sentryInitialized) return;
  const dsn = process.env.SENTRY_DSN;
  if (dsn) {
    console.log('[Monitoring] Sentry configured. Install @sentry/nextjs to enable.');
    // In production: Sentry.init({ dsn, ... });
    sentryInitialized = true;
  }
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', error.message, context || '');
    return;
  }
  // In production with Sentry: Sentry.captureException(error, { extra: context });
  console.error('[Error]', error.message);
}

export function captureEvent(message: string, data?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') return;
  // In production with Sentry: Sentry.captureMessage(message, { extra: data });
  console.log('[Event]', message, data ? JSON.stringify(data) : '');
}
