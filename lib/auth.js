// ─────────────────────────────────────────────────────────────────────────────
// lib/auth.js  –  Admin authentication utilities (client-side)
// ─────────────────────────────────────────────────────────────────────────────

const KEY_AUTH = "isAdminAuthenticated";
const KEY_USER = "adminUser";

/**
 * Call this after a successful /api/admin/login response.
 * Persists the session flag + basic user info to localStorage.
 */
export function login(adminData = {}) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_AUTH, "true");
  localStorage.setItem(
    KEY_USER,
    JSON.stringify({
      username: adminData.username || "Admin",
      role: adminData.role || "Super Admin",
      loginAt: Date.now(),
    })
  );
}

/**
 * Clears the admin session from localStorage.
 * Optionally hits the /api/admin/logout endpoint (fire-and-forget).
 */
export async function logout() {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/admin/logout", { method: "POST" });
  } catch {
    // network error – still clear client state
  }
  localStorage.removeItem(KEY_AUTH);
  localStorage.removeItem(KEY_USER);
}

/**
 * Returns true when the admin is logged in.
 * Safe to call during SSR (returns false).
 */
export function isAuthenticated() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY_AUTH) === "true";
}

/**
 * Returns the stored admin user object, or sensible defaults.
 */
export function getAdminUser() {
  if (typeof window === "undefined") return { username: "Admin", role: "Super Admin" };
  try {
    const raw = localStorage.getItem(KEY_USER);
    return raw ? JSON.parse(raw) : { username: "Admin", role: "Super Admin" };
  } catch {
    return { username: "Admin", role: "Super Admin" };
  }
}
