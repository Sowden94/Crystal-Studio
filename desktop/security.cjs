const APP_CSP = "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; worker-src 'self' blob:; connect-src 'none'; media-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'; frame-ancestors 'none'";
const EXTERNAL_URLS = new Set([
  'https://github.com/Sowden94/Crystal-Studio/blob/main/docs/README.md',
  'https://github.com/Sowden94/Crystal-Studio/issues',
  'https://github.com/Sowden94/Crystal-Studio/releases',
  'https://www.iucr.org/who-we-are/commissions/commission-on-crystallographic-nomenclature/published-reports/adp'
]);
function isAppOrigin(value) {
  try { const u = new URL(value); return u.protocol === 'crystal:' && u.hostname === 'studio' && !u.port && !u.username && !u.password; }
  catch { return false; }
}
function isAppDocument(value) {
  if (!isAppOrigin(value)) return false;
  const u = new URL(value);
  return (u.pathname === '/' || u.pathname === '/index.html') && !u.search;
}
function externalUrl(value) {
  try { const u = new URL(value); return EXTERNAL_URLS.has(u.href) ? u.href : null; }
  catch { return null; }
}
function allowedRequest(value, method = 'GET') {
  if (method !== 'GET') return false;
  if (isAppOrigin(value)) return true;
  // In-memory exports and PDF workers may use local blob URLs.
  if (typeof value !== 'string') return false;
  return value.startsWith('data:') || (value.startsWith('blob:') && isAppOrigin(value.slice(5)));
}
module.exports = {APP_CSP, isAppOrigin, isAppDocument, externalUrl, allowedRequest};
