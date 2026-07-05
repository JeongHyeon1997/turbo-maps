// Apply a SQL migration file to the live Supabase Postgres using Bun's client.
// Usage: bun scripts/apply-migration.ts supabase/migrations/0001_init.sql
// Reads DB connection from env: SUPABASE_DB_HOST/PORT/USER/PASSWORD/NAME.
import { SQL } from 'bun';

const file = process.argv[2];
if (!file) throw new Error('usage: bun scripts/apply-migration.ts <file.sql>');

const sql = new SQL({
  hostname: process.env.SUPABASE_DB_HOST!,
  port: Number(process.env.SUPABASE_DB_PORT ?? 5432),
  username: process.env.SUPABASE_DB_USER!,
  password: process.env.SUPABASE_DB_PASSWORD!,
  database: process.env.SUPABASE_DB_NAME ?? 'postgres',
  tls: true,
  max: 1,
});

const text = await Bun.file(file).text();
console.info(`Applying ${file} (${text.length} bytes)…`);
await sql.unsafe(text).simple();
console.info('✓ applied');
await sql.end();
