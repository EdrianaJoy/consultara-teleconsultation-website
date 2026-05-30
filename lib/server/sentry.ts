// Safe Sentry initializer for server-side. Initializes only if SENTRY_DSN is set.
// Falls back to no-op if @sentry/node isn't installed.
const dsn = process.env.SENTRY_DSN;
let Sentry: any = null;
if (dsn) {
  try {
    // dynamic require so missing dependency doesn't crash the app
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Sentry = require('@sentry/node');
    Sentry.init({
      dsn,
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
      environment: process.env.NODE_ENV || 'development',
    });
    // eslint-disable-next-line no-console
    console.info('Sentry initialized');
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.warn('Sentry not initialized (missing @sentry/node). Install @sentry/node to enable error reporting.');
    Sentry = null;
  }
}

export function captureException(err: any) {
  if (Sentry && Sentry.captureException) return Sentry.captureException(err);
  // fallback
  // eslint-disable-next-line no-console
  console.error('Error:', err?.message || err, err?.stack || '');
}

export function captureMessage(msg: string) {
  if (Sentry && Sentry.captureMessage) return Sentry.captureMessage(msg);
  // eslint-disable-next-line no-console
  console.info('Message:', msg);
}

export default Sentry;
