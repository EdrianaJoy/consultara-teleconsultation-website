/*
  Delegator: choose runtime adapter based on DATABASE_URL.
  - If `process.env.DATABASE_URL` is set, try to load the Postgres adapter at
    `lib/server/consultara-db-pg.ts`.
  - Otherwise, use the SQLite implementation in `lib/server/consultara-db-sqlite.ts`.

  The Postgres adapter is purposely optional; if it fails to load the delegator
  will fall back to SQLite so the app remains runnable during incremental work.
*/

// eslint-disable-next-line @typescript-eslint/no-var-requires
let adapterModule: any;
// Only enable the Postgres adapter when both DATABASE_URL is set and
// ENABLE_PG_ADAPTER is truthy. This prevents accidental runtime switches
// in environments where DATABASE_URL may be present but the adapter isn't
// ready yet. To enable: set `ENABLE_PG_ADAPTER=true` in your environment.
if (process.env.DATABASE_URL && process.env.ENABLE_PG_ADAPTER === 'true') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    adapterModule = require('./consultara-db-pg');
    // eslint-disable-next-line no-console
    console.info('consultara-db: attempting to use Postgres adapter (lib/server/consultara-db-pg.ts)');
    if (!adapterModule || !adapterModule.consultaraDb) {
      throw new Error('Postgres adapter did not export consultaraDb');
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('consultara-db: failed to load Postgres adapter, falling back to SQLite adapter', err?.message || err);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    adapterModule = require('./consultara-db-sqlite');
  }
} else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  adapterModule = require('./consultara-db-sqlite');
}

export const consultaraDb = adapterModule?.consultaraDb || adapterModule;
export const mergeSessionUser = adapterModule?.mergeSessionUser || ((session: any) => session?.user ?? null);

// Initialize monitoring early (safe no-op if not configured)
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('./sentry');
} catch (err) {
  // ignore
}
