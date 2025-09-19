// Centralized API utilities for the EcoMall frontend
// With Vite proxy configured in vite.config.js, we can use a relative base URL
export const API_BASE_URL = '';

export async function postJson(path, data) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  let payload = null;
  try {
    payload = await res.json();
  } catch (e) {
    // ignore json parse error and keep payload as null
  }

  if (!res.ok) {
    const message = payload?.error || payload?.message || 'Request failed';
    const error = new Error(message);
    error.status = res.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

export async function getJson(path) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  let payload = null;
  try {
    payload = await res.json();
  } catch (e) {
    // ignore
  }

  if (!res.ok) {
    const message = payload?.error || payload?.message || 'Request failed';
    const error = new Error(message);
    error.status = res.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

export async function deleteJson(path) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, { method: 'DELETE' });
  if (res.status === 204) {
    return { ok: true };
  }
  const hasJson = (res.headers.get('content-type') || '').includes('application/json');
  let payload = null;
  if (hasJson) {
    try { payload = await res.json(); } catch {}
  } else {
    // Try to read text to drain the body, but ignore content
    try { await res.text(); } catch {}
  }
  if (!res.ok) {
    const message = payload?.error || payload?.message || 'Request failed';
    const error = new Error(message);
    error.status = res.status; error.payload = payload; throw error;
  }
  return payload;
}

export async function patchJson(path, data) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  let payload = null;
  try { payload = await res.json(); } catch {}
  if (!res.ok) {
    const message = payload?.error || payload?.message || 'Request failed';
    const error = new Error(message);
    error.status = res.status; error.payload = payload; throw error;
  }
  return payload;
}
