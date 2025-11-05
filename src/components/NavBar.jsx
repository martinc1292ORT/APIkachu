"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./NavBar.module.css";

const links = [
  { href: "/", label: "Home" },
  { href: "/pokedex", label: "Pokedex" },
  { href: "/sobre", label: "Sobres" },
  { href: "/batalla", label: "Batalla" },
  { href: "/perfil", label: "Perfil" },
  { href: "/login", label: "Login" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>APIkachu</Link>
        <nav className={styles.nav}>
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`${styles.link} ${active ? styles.active : ""}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
