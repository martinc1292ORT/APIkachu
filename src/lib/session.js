// Manejo de sesión local (por ahora solo en localStorage)
const KEY = "apikachu_user";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function getUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function clearUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export function isLoggedIn() {
  const u = getUser();
  return !!(u && u.id);
}

export function useRequireUser() {
  const router = useRouter();
  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("apikachu_user") : null;
    if (!raw) router.replace("/login");
  }, [router]);
}