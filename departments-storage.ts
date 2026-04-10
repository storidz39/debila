import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Department {
  id: string;
  name: string;
  username: string;
  password?: string;
  logoUri: string;
  coverUri?: string;
}

const DEPARTMENTS_KEY = "CITIZEN_APP_DEPARTMENTS";

export async function getDepartments(): Promise<Department[]> {
  try {
    const data = await AsyncStorage.getItem(DEPARTMENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function addDepartment(dept: Department): Promise<void> {
  const list = await getDepartments();
  list.push(dept);
  await AsyncStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(list));
}

export async function updateDepartment(id: string, updatedDept: Partial<Department>): Promise<void> {
  const list = await getDepartments();
  const index = list.findIndex(d => d.id === id);
  if (index > -1) {
    list[index] = { ...list[index], ...updatedDept };
    await AsyncStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(list));
  }
}

export async function deleteDepartment(id: string): Promise<void> {
  const list = await getDepartments();
  const filtered = list.filter(d => d.id !== id);
  await AsyncStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(filtered));
}
