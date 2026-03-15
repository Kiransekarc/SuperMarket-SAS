const AUTH_KEYS = ["token", "name", "role", "id"];

export function getAuthItem(key) {
  return localStorage.getItem(key);
}

export function clearAuthSession() {
  AUTH_KEYS.forEach((k) => {
    localStorage.removeItem(k);
  });
}

export function setAuthSession({ token, name, role, id }) {
  clearAuthSession();

  if (token) localStorage.setItem("token", token);
  if (name) localStorage.setItem("name", name);
  if (role) localStorage.setItem("role", role);
  if (id) localStorage.setItem("id", id);
}

