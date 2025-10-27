// Simple localStorage-backed tickets API (ported from React utils/tickets.js)
const KEY = "ticketapp_tickets";
function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object") return [parsed];
    return [];
  } catch (e) {
    return [];
  }
}
function writeAll(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}
// Migration: remove legacy `priority` field from stored tickets
function migrateRemovePriority() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    let changed = false;
    const cleaned = parsed.map((t) => {
      if (t && Object.prototype.hasOwnProperty.call(t, "priority")) {
        const { priority, ...rest } = t;
        changed = true;
        return rest;
      }
      return t;
    });
    if (changed) writeAll(cleaned);
  } catch (e) {
    // swallow migration errors; do not block app
    console.warn("tickets migration failed", e);
  }
}

// run migration once on module load
migrateRemovePriority();
export async function fetchTickets() {
  await new Promise((r) => setTimeout(r, 200));
  return readAll();
}
export async function createTicket(payload) {
  const list = readAll();
  const id = Date.now().toString(36);
  const ticket = { id, ...payload };
  list.unshift(ticket);
  writeAll(list);
  return ticket;
}
export async function updateTicket(payload) {
  const list = readAll();
  const idx = list.findIndex((t) => t.id === payload.id);
  if (idx === -1) throw new Error("Not found");
  list[idx] = { ...list[idx], ...payload };
  writeAll(list);
  return list[idx];
}
export async function deleteTicket(payload) {
  const list = readAll();
  const next = list.filter((t) => t.id !== payload.id);
  writeAll(next);
  return payload;
}
