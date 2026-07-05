// One-shot Supabase provisioning via the Management API.
// Reads token from env SBP_TOKEN (never printed). Applies the migration and
// enables the Kakao auth provider + redirect allow-list.
//
// Usage: SBP_TOKEN=sbp_... bun scripts/setup-supabase.ts
const TOKEN = process.env.SBP_TOKEN;
if (!TOKEN) throw new Error('SBP_TOKEN env required');
const REF = process.env.SUPABASE_REF ?? 'giilijttitajvygdosbe';
const API = `https://api.supabase.com/v1/projects/${REF}`;
const H = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

async function query(sql: string) {
  const r = await fetch(`${API}/database/query`, {
    method: 'POST',
    headers: H,
    body: JSON.stringify({ query: sql }),
  });
  const text = await r.text();
  return { ok: r.ok, status: r.status, text };
}

// 1) apply migration
const migration = await Bun.file('supabase/migrations/0001_init.sql').text();
console.info('→ applying 0001_init.sql …');
const m = await query(migration);
console.info(`   status ${m.status} ${m.ok ? 'OK' : 'FAIL'}`);
if (!m.ok) console.info('   ' + m.text.slice(0, 500));

// 2) verify tables
console.info('→ verifying tables …');
const v = await query(
  `select table_schema, table_name from information_schema.tables
   where table_schema in ('public','test') and table_name in ('profiles','couples')
   order by 1,2;`,
);
console.info('   ' + v.text);

// 3) enable Kakao provider + redirect allow-list
console.info('→ configuring auth (Kakao provider + redirect URLs) …');
const authBody = {
  external_kakao_enabled: true,
  external_kakao_client_id: process.env.KAKAO_CLIENT_ID,
  external_kakao_secret: process.env.KAKAO_CLIENT_SECRET,
  site_url: 'http://localhost:3000',
  uri_allow_list: 'http://localhost:3000/**,https://*.vercel.app/**',
};
const a = await fetch(`${API}/config/auth`, {
  method: 'PATCH',
  headers: H,
  body: JSON.stringify(authBody),
});
console.info(`   status ${a.status} ${a.ok ? 'OK' : 'FAIL'}`);
if (!a.ok) console.info('   ' + (await a.text()).slice(0, 500));
else {
  const cfg = (await a.json()) as Record<string, unknown>;
  console.info(`   external_kakao_enabled = ${cfg.external_kakao_enabled}`);
}
console.info('done.');
