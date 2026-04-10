import { AuthUser } from "../types";
import { setStoredToken } from "./token-storage";
import { setStoredUser } from "./user-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// FORCED CLOUD MOD - Ensuring we always hit the production Vercel API
const API_ROOT = "https://debila-inky.vercel.app";
const API_BASE_URL = `${API_ROOT}/api`;

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

    throw new Error("خطأ في بيانات الدخول، يرجى التأكد من الهاتف وكلمة المرور من السيرفر.");
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
  logo_uri?: string,
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
        logo_uri: logo_uri || null,
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
