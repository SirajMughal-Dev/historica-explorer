// Resolves API paths against a configurable backend base URL.
//
// - Local dev / monolith deploy (frontend + backend served from the same
//   origin): leave VITE_API_URL unset. apiUrl('/api/x') just returns '/api/x',
//   which works with Vite's dev proxy (see vite.config.js) or Express serving
//   the built frontend directly.
// - Split deployment (e.g. frontend on Vercel, backend on a separate Vercel
//   project / Render / Railway): set VITE_API_URL to the backend's full URL,
//   e.g. https://historica-explorer-api.vercel.app (no trailing slash).
export function apiUrl(path) {
  const base = import.meta.env.VITE_API_URL || '';
  return `${base}${path}`;
}
