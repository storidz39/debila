import { createContext, ReactNode, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { loginRequest, registerRequest } from "../services/auth-api";
import { getStoredToken, setStoredToken } from "../services/token-storage";
import { getStoredUser, setStoredUser } from "../services/user-storage";
import { AuthUser } from "../types";

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (
    phone: string, 
    password: string, 
    fullName: string, 
    username?: string, 
    email?: string,
    role?: string,
    organization?: string,
    logo_uri?: string,
    cover_uri?: string
  ) => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const hydrate = async () => {
      try {
        const t = await getStoredToken();
        const u = await getStoredUser();
        if (mounted) {
          setToken(t);
          setUser(u);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const data = await loginRequest(phone, password);
    // تحديث الحالة أولاً لضمان استجابة الواجهة فوراً
    setToken(data.access_token);
    setUser(data.user);
    // التخزين في الخلفية
    await setStoredToken(data.access_token);
    await setStoredUser(data.user);
  }, []);

  const register = useCallback(async (
    phone: string, 
    password: string, 
    fullName: string, 
    username?: string, 
    email?: string,
    role?: string,
    organization?: string,
    logo_uri?: string,
    cover_uri?: string
  ) => {
    const data = await registerRequest(phone, password, fullName, username, email, role, organization, logo_uri, cover_uri);
    setToken(data.access_token);
    setUser(data.user);
    await setStoredToken(data.access_token);
    await setStoredUser(data.user);
  }, []);

  const updateUser = useCallback(async (updates: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      setStoredUser(updated);
      
      // Update local storage mock db so changes persist simulating a backend
      import("@react-native-async-storage/async-storage").then(({ default: AsyncStorage }) => {
        AsyncStorage.getItem("mock_citizens").then(data => {
            if (data) {
                const citizens = JSON.parse(data);
                const newData = citizens.map((c: any) => c.phone === prev.phone ? { ...c, ...updates } : c);
                AsyncStorage.setItem("mock_citizens", JSON.stringify(newData));
            }
        });
      });

      return updated;
    });
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    await setStoredToken(null);
    await setStoredUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      updateUser,
      logout,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
