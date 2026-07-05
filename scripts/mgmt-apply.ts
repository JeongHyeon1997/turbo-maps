// Apply a SQL migration file via the Supabase Management API query endpoint.
// Usage: SBP_TOKEN=sbp_... bun scripts/mgmt-apply.ts supabase/migrations/0002_date_logs.sql
const TOKEN = process.env.SBP_TOKEN;
if (!TOKEN) throw new Error('SBP_TOKEN env required');
const REF = process.env.SUPABASE_REF ?? 'giilijttitajvygdosbe';
const file = process.argv[2];
if (!file) throw new Error('usage: bun scripts/mgmt-apply.ts <file.sql>');

const sql = await Bun.file(file).text();
const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sql }),
});
console.info(`${file}: ${r.status} ${r.ok ? 'OK' : 'FAIL'}`);
if (!r.ok) {
  console.info((await r.text()).slice(0, 800));
  process.exit(1);
}
