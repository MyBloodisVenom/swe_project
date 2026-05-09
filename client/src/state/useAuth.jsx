import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api.js";

const AuthCtx = createContext(null);

const TOKEN_KEY = "tbc_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function run() {
      setIsLoading(true);
      try {
        if (!token) {
          if (alive) setUser(null);
          return;
        }
        const data = await apiFetch("/api/me", { token });
        if (alive) setUser(data.user);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        if (alive) {
          setToken("");
          setUser(null);
        }
      } finally {
        if (alive) setIsLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      isLoading,
      setSession(nextToken, nextUser) {
        localStorage.setItem(TOKEN_KEY, nextToken);
        setToken(nextToken);
        setUser(nextUser);
      },
      logout() {
        localStorage.removeItem(TOKEN_KEY);
        setToken("");
        setUser(null);
      },
    }),
    [token, user, isLoading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

