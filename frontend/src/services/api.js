const API_BASE_URL = 'http://localhost:5000/api/mygarb';

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('mygarb_token');

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'x-auth-token': token }),
        ...options.headers,
      },
    };

    let response;
    try {
      response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    } catch (networkError) {
      //  catch network-level failures (server offline, CORS, etc.)
      throw new Error('Network error: Could not reach the server. Is your backend running?');
    }

    // safely parse response — server may return plain text errors, not JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Server returned plain text (e.g. "Invalid token." or "Unauthorized")
      const text = await response.text();
      // Wrap it so the rest of the code can still read data.message
      data = { message: text, error: text };
    }

    if (!response.ok) {
      //  401 specifically means token is bad/expired — give a clear message
      if (response.status === 401) {
        // Optionally clear bad token and redirect to login
        localStorage.removeItem('mygarb_token');
        localStorage.removeItem('mygarb_user');
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }

      throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
    }

    return { data };
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};

export default api;
