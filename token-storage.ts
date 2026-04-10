const TOKEN_KEY = "smart_gov_access_token";
let memoryToken: string | null = null;

function getAsyncStorage() {
  try {
    // Optional runtime dependency for persistence in React Native.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("@react-native-async-storage/async-storage").default;
  } catch {
    return null;
  }
}

export async function setStoredToken(token: string | null): Promise<void> {
  memoryToken = token;
  const storage = getAsyncStorage();
  if (!storage) return;
  if (!token) {
    await storage.removeItem(TOKEN_KEY);
    return;
  }
  await storage.setItem(TOKEN_KEY, token);
}

export async function getStoredToken(): Promise<string | null> {
  if (memoryToken) return memoryToken;
  const storage = getAsyncStorage();
  if (!storage) return null;
  const token = await storage.getItem(TOKEN_KEY);
  memoryToken = token;
  return token;
}

