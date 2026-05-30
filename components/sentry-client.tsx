"use client";
import { useEffect } from 'react';

export default function SentryClient() {
  useEffect(() => {
    const dsn = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_SENTRY_DSN as string | undefined) : undefined;
    if (!dsn) return;
    // dynamic import to avoid breaking when package is not installed
    (async () => {
      try {
        const Sentry = await import('@sentry/react');
        const Tracing = await import('@sentry/tracing');
        if ((Sentry as any).getCurrentHub && !(window as any).__SENTRY_INITIALIZED) {
          (Sentry as any).init({
            dsn,
            integrations: [new (Tracing as any).BrowserTracing({})],
            tracesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '0'),
            environment: process.env.NODE_ENV || 'development',
          });
          (window as any).__SENTRY_INITIALIZED = true;
          // eslint-disable-next-line no-console
          console.info('Sentry (browser) initialized');
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Sentry (browser) not initialized; package missing or error during init.');
      }
    })();
  }, []);
  return null;
}
