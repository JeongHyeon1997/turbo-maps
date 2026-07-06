// Set the hosted project's Auth URL configuration via the Management API.
// Fixes prod OAuth (Kakao/Google) redirecting back to localhost: Supabase falls
// back to Site URL when the requested redirectTo isn't in the allow-list.
// Usage: SBP_TOKEN=sbp_... bun scripts/set-auth-urls.ts
const TOKEN = process.env.SBP_TOKEN;
if (!TOKEN) throw new Error('SBP_TOKEN env required');
const REF = process.env.SUPABASE_REF ?? 'giilijttitajvygdosbe';

const SITE_URL = 'https://maps.weourus.xyz';
// Comma-separated allow-list. `**` wildcard matches any path/query.
const ALLOW_LIST = [
  'https://maps.weourus.xyz/**',
  'http://localhost:3000/**',
  'maps://**',
].join(',');

const url = `https://api.supabase.com/v1/projects/${REF}/config/auth`;
const auth = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

// Show current values first (nothing else is touched — PATCH is partial).
const before = await fetch(url, { headers: auth }).then((r) => r.json());
console.info('before:', {
  site_url: before.site_url,
  uri_allow_list: before.uri_allow_list,
});

const r = await fetch(url, {
  method: 'PATCH',
  headers: auth,
  body: JSON.stringify({ site_url: SITE_URL, uri_allow_list: ALLOW_LIST }),
});
console.info(`PATCH: ${r.status} ${r.ok ? 'OK' : 'FAIL'}`);
if (!r.ok) {
  console.info((await r.text()).slice(0, 800));
  process.exit(1);
}
const after = await r.json();
console.info('after:', {
  site_url: after.site_url,
  uri_allow_list: after.uri_allow_list,
});
