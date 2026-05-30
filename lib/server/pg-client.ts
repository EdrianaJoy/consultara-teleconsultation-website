import { Pool } from 'pg';

let pool: Pool | null = null;

function parseIntEnv(name: string, fallback: number) {
  const v = process.env[name];
  if (!v) return fallback;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function getPgPool(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const max = parseIntEnv('PG_MAX_POOL_SIZE', 10);
  const idleTimeoutMillis = parseIntEnv('PG_IDLE_TIMEOUT', 30000);
  const sslMode = process.env.PGSSLMODE || process.env.PG_SSL_MODE || '';
  const ssl = sslMode === 'require' || sslMode === 'verify-full' ? { rejectUnauthorized: false } : undefined;

  pool = new Pool({
    connectionString,
    max,
    idleTimeoutMillis,
    ssl,
  });

  pool.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('pg pool error', err?.message || err);
  });

  return pool;
}

export async function closePgPool() {
  if (!pool) return;
  try {
    await pool.end();
  } finally {
    pool = null;
  }
}
