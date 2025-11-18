"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthProvider";
import styles from "./NavBar.module.css";

export default function NavBar() {
  const { user, isAuthenticated, logout } = useAuth();

  let puntosDelUsuario = 0;
  if (user && typeof user.points === "number") {
    puntosDelUsuario = user.points;
  }

  // Autenticado
  let contenidoDerecha = null;

  if (isAuthenticated) {
    contenidoDerecha = (
      <>
        <div className={styles.points}>
          🪙 {puntosDelUsuario}
        </div>

        <Link href="/perfil" className={styles.profileLink}>
          Perfil
        </Link>

        <button onClick={logout} className={styles.logoutBtn}>
          Cerrar sesión
        </button>
      </>
    );
  }

  // No autenticado
  if (!isAuthenticated) {
    contenidoDerecha = (
      <Link href="/login" className={styles.loginBtn}>
        Iniciar sesión
      </Link>
    );
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <Link href="/" className={styles.brand}>
          <span className={styles.logo}>⚡</span> APIkachu
        </Link>

        <div className={styles.menu}>
          <Link href="/pokedex" className={styles.link}>Pokédex</Link>
          <Link href="/batalla" className={styles.link}>Batalla</Link>
          <Link href="/tienda" className={styles.link}>Tienda</Link>
        </div>
      </div>

      <div className={styles.right}>
        {contenidoDerecha}
      </div>
    </nav>
  );
}
