const API_BASE = import.meta.env.VITE_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const urlService = {
  create: async (originalUrl, customAlias, expiresAt) => {
    const res = await fetch(`${API_BASE}/urls`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ originalUrl, customAlias, expiresAt })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to shorten URL');
    return data;
  },

  getAll: async (search = '') => {
    const queryParams = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${API_BASE}/urls${queryParams}`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load URLs');
    return data;
  },

  getDetails: async (id) => {
    const res = await fetch(`${API_BASE}/urls/${id}`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load URL details');
    return data;
  },

  update: async (id, updateFields) => {
    const res = await fetch(`${API_BASE}/urls/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updateFields)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update URL');
    return data;
  },

  delete: async (id) => {
    const res = await fetch(`${API_BASE}/urls/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete URL');
    return data;
  },

  getAnalytics: async (id) => {
    const res = await fetch(`${API_BASE}/analytics/${id}`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load analytics');
    return data;
  },

  getPublicStats: async (shortCode) => {
    const res = await fetch(`${API_BASE}/analytics/public/${shortCode}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load public stats');
    return data;
  }
};

export default urlService;
