const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
const PREFIX = import.meta.env.VITE_API_PREFIX || '';

async function request(path, { method = 'GET', body, headers = {}, credentials } = {}) {
  const url = `${BASE}${PREFIX}${path}`;
  const opts = {
    method,
    headers: {
      'Accept': 'application/json',
      ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    ...(credentials ? { credentials } : {}),
    ...(body ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
  };

  const res = await fetch(url, opts);
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = new Error((data && (data.detail || data.message)) || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const getJson = (path, opts) => request(path, { ...opts, method: 'GET' });
export const postJson = (path, body, opts) => request(path, { ...opts, method: 'POST', body });
export const putJson = (path, body, opts) => request(path, { ...opts, method: 'PUT', body });
export const delJson = (path, opts) => request(path, { ...opts, method: 'DELETE' });

export default { getJson, postJson, putJson, delJson };
