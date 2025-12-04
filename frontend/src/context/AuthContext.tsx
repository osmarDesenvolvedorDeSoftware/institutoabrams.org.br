import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { Navigate } from "react-router-dom";

import { api } from "../services/api";

type User = {
  id: number;
  email: string;
  name: string;
  role?: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("abrams_auth");
    if (saved) {
      const parsed = JSON.parse(saved);
      setToken(parsed.token);
      setUser(parsed.user);
      api
        .get("/auth/me")
        .then(({ data }) => setUser(data))
        .catch(() => {
          localStorage.removeItem("abrams_auth");
          setUser(null);
          setToken(null);
        });
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data.user);
    setToken(data.access_token);
    localStorage.setItem(
      "abrams_auth",
      JSON.stringify({ user: data.user, token: data.access_token }),
    );
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("abrams_auth");
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
    }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const ProtectedRoute = ({
  children,
  redirectTo = "/admin/login",
}: {
  children: ReactNode;
  redirectTo?: string;
}) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
};
