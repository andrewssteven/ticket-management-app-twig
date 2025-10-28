// Simple auth helpers (client-side, localStorage)
// Use a session token key compatible with the other implementations.
const SESSION_KEY = "ticketapp_session";

export function isAuthenticated() {
  return !!localStorage.getItem(SESSION_KEY);
}

export function login(user = { id: "demo", name: "Demo" }) {
  // store a mock session token plus a minimal user object for compatibility
  const token = `mock-token:${btoa(user.id || user.name || "demo")}`;
  localStorage.setItem(SESSION_KEY, token);
  localStorage.setItem("ticketapp_user", JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("ticketapp_user");
}

export function getUser() {
  const v = localStorage.getItem("ticketapp_user");
  return v ? JSON.parse(v) : null;
}
