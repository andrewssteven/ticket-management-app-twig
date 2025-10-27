// Simple auth helpers (client-side, localStorage)
export function isAuthenticated() {
  return !!localStorage.getItem("ticketapp_user");
}

export function login(user = { id: "demo", name: "Demo" }) {
  localStorage.setItem("ticketapp_user", JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem("ticketapp_user");
}

export function getUser() {
  const v = localStorage.getItem("ticketapp_user");
  return v ? JSON.parse(v) : null;
}
