import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { apiClient } from "@/services/apiClient";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({ user: null, loading: true, login: async () => {}, register: async () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("stadiumsense_user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { localStorage.removeItem("stadiumsense_user"); }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient<{ access_token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("stadiumsense_user", JSON.stringify(res.user));
    setUser(res.user);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const res = await apiClient<{ access_token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
    localStorage.setItem("stadiumsense_user", JSON.stringify(res.user));
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    try { await apiClient("/auth/logout", { method: "POST" }); } catch { /* ignore */ }
    localStorage.removeItem("stadiumsense_user");
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
