"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import RequireAuth from "@/components/RequireAuth";
import styles from "./perfil.module.css";

export default function PerfilPage() {
    const { user, logout, updateProfile } = useAuth();

    const team = user ? user.team || [] : [];
    const roster = user ? user.roster || [] : [];

    const [selectedSlot, setSelectedSlot] = useState(null);

    const isInTeam = (id) => {
        return team.some((pokemon) => {
            if (pokemon && pokemon.id === id) {
                return true;
            } else {
                return false;
            }
        });
    };

    const isInRoster = (id) => {
        return roster.some((pokemon) => {
            if (pokemon && pokemon.id === id) {
                return true;
            } else {
                return false;
            }
        });
    };

    const uniqueById = (array) => {
        const idsDetectados = [];

        return (array || []).filter((item) => {
            if (!item || item.id == null) {
                return false;
            }

            if (idsDetectados.includes(item.id)) {
                return false;
            }

            idsDetectados.push(item.id);
            return true;
        });
    };

    const save = (nextTeam, nextRoster) => {
        updateProfile({
            team: uniqueById(nextTeam).slice(0, 6),
            roster: uniqueById(nextRoster),
        });
    };

    const handleAddToTeam = (pokemonSeleccionado) => {
        if (isInTeam(pokemonSeleccionado.id)) {
            return;
        }
        if (team.length >= 6) {
            return;
        }

        const teamActualizado = [];
        for (let i = 0; i < team.length; i++) {
            teamActualizado.push(team[i]);
        }
        teamActualizado.push(pokemonSeleccionado);

        const rosterActualizado = [];
        for (let i = 0; i < roster.length; i++) {
            const pokemonDelRoster = roster[i];
            if (pokemonDelRoster.id !== pokemonSeleccionado.id) {
                rosterActualizado.push(pokemonDelRoster);
            }
        }
        save(teamActualizado, rosterActualizado);
    };

    const handleRemoveFromTeam = (idxDelTeam) => {
        const pokemonRemoved = team[idxDelTeam];

        const teamActualizado = [];
        for (let i = 0; i < team.length; i++) {
            if (i !== idxDelTeam) {
                teamActualizado.push(team[i]);
            }
        }

        const rosterActualizado = [];
        for (let i = 0; i < roster.length; i++) {
            const pokemonDelRoster = roster[i];
            rosterActualizado.push(pokemonDelRoster);
        }
        rosterActualizado.push(pokemonRemoved);

        save(teamActualizado, rosterActualizado);

        if (selectedSlot === idxDelTeam) {
            setSelectedSlot(null);
        }
    };

    const beginReplace = (idx) => {
        setSelectedSlot(idx);
    };

    const handleReplaceWith = (pokeDelRoster) => {
        if (selectedSlot == null) return;

        const pokeSaleDelTeam = team[selectedSlot];
        if (isInTeam(pokeDelRoster.id)) return;

        const teamActualizado = team.slice();
        teamActualizado[selectedSlot] = pokeDelRoster;

        let rosterActualizado = roster.filter((p) => p.id !== pokeDelRoster.id);

        if (pokeSaleDelTeam && !isInRoster(pokeSaleDelTeam.id)) {
            rosterActualizado = [...rosterActualizado, pokeSaleDelTeam];
        }

        save(teamActualizado, rosterActualizado);
        setSelectedSlot(null);
    };

    const cancelReplace = () => setSelectedSlot(null);

    const teamCount = team.length;
    const rosterCount = roster.length;


    const puntosEntrenador =
        user && typeof user.points === "number" ? user.points : 0;

    const emailUsuario = user && user.email ? user.email : "";
    const nombreUsuario = user && user.name ? user.name : "";

    const batallasRealizadas =
        user && typeof user.battles === "number" ? user.battles : 0;

    // const rachaActual =
    //     user && typeof user.winStreak === "number" ? user.winStreak : 0;

    // const mejorRacha =
    //     user && typeof user.bestWinStreak === "number" ? user.bestWinStreak : 0;

    const inicialUsuario =
        (nombreUsuario && nombreUsuario[0]) ||
        (emailUsuario && emailUsuario[0]) ||
        "?";
    const inicialMayus = inicialUsuario.toUpperCase();

    return (
        <RequireAuth>
            <div className={styles.wrap}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <div className={styles.userHeader}>
                            <div className={styles.avatar}>{inicialMayus}</div>
                            <div className={styles.userText}>
                                <h1>{nombreUsuario}</h1>
                            </div>
                        </div>

                        <div className={styles.headerActions}>
                            <div className={styles.pointsBadge} title="Puntos del entrenador">
                                <span className={styles.pointsLabel}>Puntos</span>
                                <span className={styles.pointsValue}>{puntosEntrenador}</span>
                            </div>

                            <button className={styles.logout} onClick={logout}>
                                Cerrar sesión
                            </button>
                        </div>
                    </div>

                    {/* Info del usuario */}
                    <div className={styles.info}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Email</span>
                            <span className={styles.infoValue}>{emailUsuario}</span>
                        </div>

                        <div className={styles.infoRow}>
                            <label className={styles.infoLabel} htmlFor="nombre">
                                Nombre
                            </label>
                            <input
                                id="nombre"
                                className={styles.input}
                                defaultValue={nombreUsuario}
                                onBlur={(evento) => {
                                    const nuevoNombre = evento.target.value;
                                    updateProfile({ name: nuevoNombre });
                                }}
                                placeholder="Tu nombre"
                            />
                        </div>

                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Batallas jugadas</span>
                            <span className={styles.infoValue}>{batallasRealizadas}</span>
                        </div>

                        {/* <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Racha actual</span>
                            <span className={styles.infoValue}>{rachaActual}</span>
                        </div>

                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Mejor racha</span>
                            <span className={styles.infoValue}>{mejorRacha}</span>
                        </div> */}
                    </div>
                   
                    <div className={styles.mainLayout}>
                        {/* Equipo */}
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2>Mi Equipo ({teamCount}/6)</h2>

                                {selectedSlot !== null && (
                                    <div className={styles.replaceBanner}>
                                        Reemplazando el slot #{selectedSlot + 1} - eleg  un pok mon
                                        de tu colecci n o{" "}
                                        <button className={styles.linkBtn} onClick={cancelReplace}>
                                            cancel 
                                        </button>
                                        .
                                    </div>
                                )}
                            </div>

                            <div className={styles.teamGrid}>
                                {Array.from({ length: Math.max(6, teamCount) }).map(
                                    (_, indiceSlot) => {
                                        const pokemonDelTeam = team[indiceSlot];

                                        if (!pokemonDelTeam) {
                                            return (
                                                <div
                                                    key={"slot-vacio-" + indiceSlot}
                                                    className={`${styles.poke} ${styles.emptySlot}`}
                                                >
                                                    <div className={styles.emptyMsg}>Slot vac o</div>
                                                </div>
                                            );
                                        }

                                        const slotEstaSeleccionado = selectedSlot === indiceSlot;

                                        return (
                                            <div
                                                key={pokemonDelTeam.id}
                                                className={`${styles.poke} ${
                                                    slotEstaSeleccionado ? styles.activeSlot : ""
                                                }`}
                                            >
                                                <img
                                                    src={pokemonDelTeam.sprite}
                                                    alt={pokemonDelTeam.name}
                                                    width={72}
                                                    height={72}
                                                />

                                                <div className={styles.pname}>
                                                    {pokemonDelTeam.name}
                                                </div>

                                                <div className={styles.ptypes}>
                                                    {(pokemonDelTeam.types || []).map((tipo) => {
                                                        return (
                                                            <span key={tipo} className={styles.type}>
                                                                {tipo}
                                                            </span>
                                                        );
                                                    })}
                                                </div>

                                                <div className={styles.pokeActions}>
                                                    <button
                                                        className={styles.btnGhost}
                                                        onClick={() => beginReplace(indiceSlot)}
                                                        title="Reemplazar este slot con un pok mon de tu colecci n"
                                                    >
                                                        Cambiar
                                                    </button>

                                                    {/* <button
                                                        className={styles.btnDanger}
                                                        onClick={() => handleRemoveFromTeam(indiceSlot)}
                                                        title="Sacar del equipo (vuelve a tu colecci n)"
                                                    >
                                                        Quitar
                                                    </button> */}
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </section>

                        {/* Coleccion */}
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2>Mi Colección ({rosterCount})</h2>
                            </div>

                            <div className={styles.collectionGrid}>
                                {rosterCount === 0 && (
                                    <div className={styles.emptyCollection}>
                                        No tenés pokémon en tu colección.
                                    </div>
                                )}

                                {roster.map((pokemonDelRoster) => {
                                    const yaEstaEnElTeam = isInTeam(pokemonDelRoster.id);
                                    const equipoLleno = teamCount >= 6;
                                    const noSePuedeAgregar = yaEstaEnElTeam || equipoLleno;

                                    let textoBotonAgregar = "Agregar al equipo";
                                    if (yaEstaEnElTeam) {
                                        textoBotonAgregar = "Ya est  en el equipo";
                                    } else if (equipoLleno) {
                                        textoBotonAgregar = "Equipo completo";
                                    }

                                    const estaReemplazando = selectedSlot !== null;

                                    let contenidoAccion;

                                    if (!estaReemplazando) {
                                        contenidoAccion = (
                                            <button
                                                className={styles.btnPrimary}
                                                disabled={noSePuedeAgregar}
                                                onClick={() => handleAddToTeam(pokemonDelRoster)}
                                                title={textoBotonAgregar}
                                            >
                                                {textoBotonAgregar}
                                            </button>
                                        );
                                    } else {
                                        const textoReemplazo =
                                            "Enviar a slot #" + (selectedSlot + 1);

                                        contenidoAccion = (
                                            <button
                                                className={styles.btnPrimary}
                                                onClick={() => handleReplaceWith(pokemonDelRoster)}
                                                title={textoReemplazo}
                                            >
                                                {textoReemplazo}
                                            </button>
                                        );
                                    }

                                    return (
                                        <div className={styles.poke} key={pokemonDelRoster.id}>
                                            <img
                                                src={pokemonDelRoster.sprite}
                                                alt={pokemonDelRoster.name}
                                                width={64}
                                                height={64}
                                            />

                                            <div className={styles.pname}>
                                                {pokemonDelRoster.name}
                                            </div>

                                            <div className={styles.ptypes}>
                                                {(pokemonDelRoster.types || []).map((tipo) => {
                                                    return (
                                                        <span key={tipo} className={styles.type}>
                                                            {tipo}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                            <div className={styles.pokeActions}>
                                                {contenidoAccion}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                    <div className={styles.actions}>
                        <a className={styles.btn} href="/tienda">
                            Ir a la tienda</a>
                    </div>
                </div>
            </div>
        </RequireAuth>
    );
}

