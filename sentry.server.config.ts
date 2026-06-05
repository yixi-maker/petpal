import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  environment: process.env.APP_ENV || process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Redact sensitive data
    if (event.request?.data) {
      const data = event.request.data as Record<string, unknown>;
      delete data.phone;
      delete data.symptoms;
    }
    return event;
  },
});
