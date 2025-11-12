"use client";

import { useState } from "react";
import styles from "./login.module.css";
import { useAuth } from "@/contexts/AuthProvider";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, register } = useAuth();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ email, password, name: fullName });
      }
    } catch (err) {
      setError(err.message || "Ocurrió un error");
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.switcher}>
          <button
            className={`${styles.switcherBtn} ${isLogin ? styles.active : ""}`}
            onClick={() => setIsLogin(true)}
            type="button"
          >
            Login
          </button>
          <button
            className={`${styles.switcherBtn} ${!isLogin ? styles.active : ""}`}
            onClick={() => setIsLogin(false)}
            type="button"
          >
            Register
          </button>
          <div className={`${styles.switcherIndicator} ${!isLogin ? styles.right : ""}`} />
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>{isLogin ? "Welcome back" : "Create account"}</h1>
          <p className={styles.subtitle}>
            {isLogin
              ? "Enter your credentials to access your account"
              : "Sign up to get started with your account"}
          </p>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.group}>
              <label htmlFor="name" className={styles.label}>Full Name</label>
              <input
                id="name"
                type="text"
                className={styles.input}
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className={styles.group}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required />
          </div>

          <div className={styles.group}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required />
          </div>

          <button type="submit" className={styles.submit}>
            {isLogin ? "Sign in" : "Create account"}
          </button>

          <p className={styles.signup}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" className={styles.link} onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
