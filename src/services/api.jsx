const API = import.meta.env.VITE_API_URL || "https://aidocumentassistance-1.onrender.com/api";

const api = {
  register: (data) =>
    fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  login: (data) =>
    fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  upload: (file, token) => {
    const fd = new FormData();
    fd.append("file", file);
    return fetch(`${API}/api/document/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
  },

  ask: (question, token) =>
    fetch(`${API}/api/chat/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ question }),
    }),

  history: (token) =>
    fetch(`${API}/api/chat/history`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export default api;