"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { useRouter } from "next/navigation";

export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;
  return children;
}
