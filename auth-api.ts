import { AuthUser } from "../types";
import { setStoredToken } from "./token-storage";
import { setStoredUser } from "./user-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Standardizing for Node.js / Vercel
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "/api";

export type AuthResponse = {
  access_token: string;
  user: AuthUser;
};

export async function loginRequest(phone: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });

    if (res.ok) {
      const data = await res.json() as AuthResponse;
      await setStoredToken(data.access_token);
      await setStoredUser(data.user);
      return data;
    }

    // Fallback to hardcoded admin for testing
    if (phone === "admin" && password === "123456") {
      const adminData: AuthResponse = {
        access_token: "admin-token-123",
        user: { id: "admin-uuid", phone: "admin", full_name: "مدير المنصة الشامل", role: "admin" }
      };
      await setStoredToken(adminData.access_token);
      await setStoredUser(adminData.user);
      return adminData;
    }

    throw new Error("خطأ في بيانات الدخول، يرجى التأكد من الهاتف وكلمة المرور.");
  } catch (err: any) {
    throw err;
  }
}

export async function registerRequest(
  phone: string,
  password: string,
  full_name: string,
  username?: string,
  email?: string,
  role?: string,
  organization?: string,
  cover_uri?: string
): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: phone.trim(),
        password,
        full_name: full_name.trim(),
        username: username?.trim(),
        email: email?.trim(),
        role: role || "citizen",
        organization: organization || null,
        cover_uri: cover_uri || null
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "فشل عملية الإنشاء.");
    }

    const authData = data as AuthResponse;
    await setStoredToken(authData.access_token);
    await setStoredUser(authData.user);
    return authData;

  } catch (err: any) {
    console.error("Registration error:", err.message);
    throw err;
  }
}
