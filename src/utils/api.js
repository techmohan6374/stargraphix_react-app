export const API_BASE = 'https://mrmoney-api.onrender.com/api';

export async function apiFetch(path, options = {}) {
  const storedUser = localStorage.getItem('sg_user');
  let token = null;
  if (storedUser) {
    try {
      token = JSON.parse(storedUser).token;
    } catch { }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${res.status}`);
  }

  // Handle empty responses
  if (res.status === 204) return null;

  return await res.json();
}
