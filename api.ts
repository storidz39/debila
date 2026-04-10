import { complaints as mockComplaints } from "../data/mock";
import { CreateComplaintRequest, UpdateComplaintStatusRequest } from "../models/api";
import { Complaint, Message, TimelineEvent } from "../types";
import { getStoredToken } from "./token-storage";
import { getStoredUser } from "./user-storage";

// Standardizing for Node.js / Vercel
// Standardizing for Node.js / Vercel - Ensuring the /api prefix is handled correctly
const API_ROOT = process.env.EXPO_PUBLIC_API_BASE_URL || "";
const API_BASE_URL = API_ROOT.endsWith("/api") ? API_ROOT : `${API_ROOT}/api`;

function generateId() {
  const n = Math.floor(Math.random() * 9000) + 1000;
  return `RPT-${n}`;
}

export function mapComplaintWithCoords(c: Complaint, index: number): Complaint {
  if (c.coordinates) return c;
  return {
    ...c,
    coordinates: {
      lat: 24.7136 + (index % 6) * 0.012,
      lng: 46.6753 + (index % 6) * 0.012,
    },
  };
}

export async function getMyComplaints(): Promise<Complaint[]> {
  const user = await getStoredUser();
  if (!user) return [];
  
  try {
    const res = await fetch(`${API_BASE_URL}/complaints?reporter_id=${user.id}`);
    if (!res.ok) throw new Error("API error");
    const json = await res.json();
    const items = (json?.data?.items ?? []) as Complaint[];
    return items.map((item, i) => mapComplaintWithCoords(item, i));
  } catch (err) {
    console.log("Backend error (using mock):", err);
    return mockComplaints.filter(c => c.status !== 'resolved' || true).map((c, i) => mapComplaintWithCoords(c, i));
  }
}

export async function getAdminComplaints(): Promise<Complaint[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/complaints`);
    if (!res.ok) throw new Error("API error");
    const json = await res.json();
    const items = (json?.data?.items ?? []) as Complaint[];
    return items.map((item, i) => mapComplaintWithCoords(item, i));
  } catch {
    return [];
  }
}

export async function createComplaint(payload: CreateComplaintRequest): Promise<Complaint> {
  const user = await getStoredUser();
  const id = generateId();
  const body = {
    id,
    title: payload.description ? payload.description.slice(0, 50) : "بلاغ جديد",
    description: payload.description,
    location_text: payload.location.address_text,
    lat: payload.location.lat,
    lng: payload.location.lng,
    category: payload.category || "خدمات عامة",
    reporter_id: user?.id,
    assigned_dept: "المصلحة التقنية",
    media_urls: payload.media_urls || []
  };

  try {
    const res = await fetch(`${API_BASE_URL}/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("failed");
    return mapComplaintWithCoords({ ...body, status: "submitted", created_at: new Date().toISOString(), messages: [], history: [] } as any, 0);
  } catch {
    return mapComplaintWithCoords({ ...body, status: "submitted", created_at: new Date().toISOString(), messages: [], history: [] } as any, 0);
  }
}

export async function getComplaintMessages(complaintId: string): Promise<Message[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/complaints/${encodeURIComponent(complaintId)}/messages`);
    if (!res.ok) throw new Error("failed");
    const json = await res.json();
    return (json?.data?.items ?? []) as Message[];
  } catch {
    return [];
  }
}

export async function sendMessage(complaintId: string, text: string): Promise<void> {
  const user = await getStoredUser();
  try {
    await fetch(`${API_BASE_URL}/complaints/${encodeURIComponent(complaintId)}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_id: user?.id,
        sender_name: user?.full_name,
        sender_role: user?.role,
        text
      }),
    });
  } catch (err) {
    console.error(err);
  }
}

export async function updateComplaintStatus(
  complaintId: string,
  payload: UpdateComplaintStatusRequest
): Promise<{ success: boolean }> {
  try {
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function uploadComplaintImage(localUri: string): Promise<string | null> {
  return localUri;
}

export async function getDepartmentsFromApi(): Promise<any[]> {
  try {
    const token = await getStoredToken();
    const res = await fetch(`${API_BASE_URL}/admin/departments`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("API error");
    const json = await res.json();
    return (json?.data?.items ?? []) as any[];
  } catch {
    return [];
  }
}

export async function createDepartmentApi(payload: any): Promise<void> {
  const token = await getStoredToken();
  const res = await fetch(`${API_BASE_URL}/admin/departments`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(`Cloud Error (${res.status}): ${json.message || "Unknown error"}`);
  }
}

export async function updateDepartmentApi(id: string, payload: any): Promise<void> {
  const token = await getStoredToken();
  await fetch(`${API_BASE_URL}/admin/departments/${id}`, {
    method: "PATCH",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      name: payload.name,
      username: payload.username,
      password: payload.password,
      organization: payload.organization,
      logo_uri: payload.logo_uri,
      cover_uri: payload.cover_uri
    }),
  });
}

export async function deleteDepartmentApi(id: string): Promise<void> {
  await fetch(`${API_BASE_URL}/admin/departments/${id}`, {
    method: "DELETE",
  });
}

export async function getComplaintById(complaintId: string): Promise<Complaint | null> {
    const all = await getAdminComplaints();
    return all.find(c => c.id === complaintId) || null;
}

export async function getComplaintTimeline(complaintId: string): Promise<TimelineEvent[]> {
    return [
      { from_status: null, to_status: "submitted", at: new Date().toISOString(), public_note: "تم استلام البلاغ في النظام بنجاح", actor_name: "النظام الآلي" },
    ];
}
