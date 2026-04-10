import { AuthUser } from "../types";

const USER_KEY = "smart_gov_user";

function getAsyncStorage() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("@react-native-async-storage/async-storage").default;
  } catch {
    return null;
  }
}

let memoryUser: AuthUser | null = null;

export async function setStoredUser(user: AuthUser | null): Promise<void> {
  memoryUser = user;
  const storage = getAsyncStorage();
  if (!storage) return;
  if (!user) {
    await storage.removeItem(USER_KEY);
    return;
  }
  await storage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getStoredUser(): Promise<AuthUser | null> {
  if (memoryUser) return memoryUser;
  const storage = getAsyncStorage();
  if (!storage) return null;
  const raw = await storage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthUser;
    memoryUser = parsed;
    return parsed;
  } catch {
    return null;
  }
}
