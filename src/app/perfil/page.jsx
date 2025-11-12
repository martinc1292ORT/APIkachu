"use client";

import { useAuth } from "@/contexts/AuthProvider";
import RequireAuth from "@/components/RequireAuth";
import styles from "./perfil.module.css";

export default function PerfilPage() {
  const { user, logout, updateProfile } = useAuth();

  return (
    <RequireAuth>
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1>Mi Perfil</h1>

            {/* Puntaje del ENTRENADOR */}
            <div className={styles.pointsBadge} title="Puntos del entrenador">
              <span className={styles.pointsLabel}>Puntos</span>
              <span className={styles.pointsValue}>{user?.points ?? 0}</span>
            </div>

            <button className={styles.logout} onClick={logout}>Cerrar sesión</button>
          </div>

          <div className={styles.info}>
            <div><strong>Email:</strong> {user?.email}</div>
            <div className={styles.row}>
              <label htmlFor="nombre">Nombre:</label>
              <input
                id="nombre"
                className={styles.input}
                defaultValue={user?.name || ""}
                onBlur={(e) => updateProfile({ name: e.target.value })}
                placeholder="Tu nombre"
              />
            </div>
          </div>

          <h2>Mi Equipo (6)</h2>
          <div className={styles.team}>
            {user?.team?.map((p) => (
              <div className={styles.poke} key={p.id}>
                <img src={p.sprite} alt={p.name} width={72} height={72} />
                <div className={styles.pname}>{p.name}</div>

                {/* TIPOS (sin puntos aquí) */}
                <div className={styles.ptypes}>
                  {p.types.map((t) => (
                    <span key={t} className={styles.type}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Opcional: link a tienda para comprar con puntos */}
          {/* <div className={styles.actions}>
            <a className={styles.btn} href="/tienda">Ir a la tienda</a>
          </div> */}
        </div>
      </div>
    </RequireAuth>
  );
}
