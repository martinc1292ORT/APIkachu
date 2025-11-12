"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthProvider";
import styles from "./NavBar.module.css";

export default function NavBar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <Link href="/" className={styles.brand}>
          APIkachu
        </Link>
        <Link href="/pokedex" className={styles.link}>
          Pokédex
        </Link>
        <Link href="/batalla" className={styles.link}>
          Batalla
        </Link>
      </div>

      <div className={styles.right}>
        {isAuthenticated ? (
          <>
            <Link href="/perfil" className={styles.link}>
              Perfil
            </Link>
            <button onClick={logout} className={styles.logoutBtn}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link href="/login" className={styles.loginBtn}>
            Iniciar sesión
          </Link>
        )}
      </div>
    </nav>
  );
}
