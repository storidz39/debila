import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createComplaint, getMyComplaints, updateComplaintStatus, getAdminComplaints } from "../services/api";
import { useAuth } from "./auth-store";
import { Complaint, ComplaintStatus, TimelineStep, Message } from "../types";

type CreateInput = {
  title: string;
  description: string;
  category: string;
  location: string;
  assigned_dept: string;
  media_urls?: string[];
};

type ComplaintsContextValue = {
  complaints: Complaint[];
  filteredComplaints: Complaint[];
  loading: boolean;
  submitComplaint: (input: CreateInput) => Promise<void>;
  updateStatus: (complaintId: string, status: ComplaintStatus, note: string) => Promise<void>;
  sendMessage: (complaintId: string, text: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const ComplaintsContext = createContext<ComplaintsContextValue | null>(null);

export function ComplaintsProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!token || !user) {
      setComplaints([]);
      return;
    }
    setLoading(true);
    try {
      // In a real app, the API would handle the filtering server-side.
      let items: Complaint[] = [];
      if (user.role === "admin" || user.role === "department") {
        items = await getAdminComplaints();
      } else {
        items = await getMyComplaints();
      }

      // Merge with custom saved data from AsyncStorage
      const localData = await AsyncStorage.getItem("CITIZEN_APP_CUSTOM_COMPLAINTS");
      if (localData) {
        const customComplaints = JSON.parse(localData) as Complaint[];
        // Filter out any custom complaints that are already in items (just in case)
        const newCustom = customComplaints.filter(c => !items.find(i => i.id === c.id));
        items = [...newCustom, ...items];
      }

      setComplaints(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [token, user]);

  // SAFE DATA PARTITIONING (UI LEVEL)
  const filteredComplaints = useMemo(() => {
    if (!user) return [];
    if (user.role === "admin") return complaints;
    if (user.role === "department") {
      return complaints.filter(c => c.assigned_dept === user.organization);
    }
    // Citizen role
    return complaints.filter(c => c.citizen_id === user.id);
  }, [complaints, user]);

  const submitComplaint = async (input: CreateInput) => {
    const created = await createComplaint({
      description: input.title + "\n" + input.description,
      category: input.category,
      is_anonymous: false,
      location: { lat: 0, lng: 0, address_text: input.location },
      media_urls: input.media_urls,
    } as any);
    
    // Supplement missing local properties for the mock store
    const fullCreated: Complaint = {
      ...created,
      citizen_id: user?.id || "anonymous",
      reporter_name: user?.full_name,
      reporter_phone: user?.phone,
      reporter_email: user?.email,
      assigned_dept: input.assigned_dept,
      created_at: new Date().toISOString(),
      history: [
        {
          id: Math.random().toString(),
          status: "submitted",
          at: new Date().toISOString(),
          note: "تم استلام البلاغ عبر البوابة الوطنية",
          actor: user?.full_name || "النظام"
        }
      ],
      messages: []
    };
    
    setComplaints((prev) => {
      const updated = [fullCreated, ...prev];
      // Save custom complaints to AsyncStorage
      const customOnly = updated.filter(c => c.id.startsWith("#RPT-")); // from api simulation or new
      AsyncStorage.getItem("CITIZEN_APP_CUSTOM_COMPLAINTS").then(data => {
         const existing = data ? JSON.parse(data) : [];
         AsyncStorage.setItem("CITIZEN_APP_CUSTOM_COMPLAINTS", JSON.stringify([fullCreated, ...existing]));
      });
      return updated;
    });
  };

  const updateStatus = async (complaintId: string, status: ComplaintStatus, note: string) => {
    try {
      const res = await updateComplaintStatus(complaintId, { status } as any);
      if (!res.success) return;
      
      const newStep: TimelineStep = {
        id: Math.random().toString(),
        status,
        at: new Date().toISOString(),
        note,
        actor: user?.full_name || "مسؤول النظام"
      };

      setComplaints((prev) => {
        const updated = prev.map((item) => (item.id === complaintId ? { 
          ...item, 
          status,
          history: item.history ? [...item.history, newStep] : [newStep]
        } : item));
        
        // Update local storage if it's a custom complaint
        AsyncStorage.getItem("CITIZEN_APP_CUSTOM_COMPLAINTS").then(data => {
            if (data) {
                const existing = JSON.parse(data) as Complaint[];
                const localUpdated = existing.map(item => item.id === complaintId ? {
                    ...item, status, history: item.history ? [...item.history, newStep] : [newStep]
                } : item);
                AsyncStorage.setItem("CITIZEN_APP_CUSTOM_COMPLAINTS", JSON.stringify(localUpdated));
            }
        });
        
        return updated;
      });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const sendMessage = async (complaintId: string, text: string) => {
    if (!text.trim()) return;
    const newMsg: Message = {
      id: Math.random().toString(),
      text: text.trim(),
      sender_role: user?.role || "citizen",
      sender_name: user?.full_name || "مستخدم",
      created_at: new Date().toISOString()
    };
    
    setComplaints((prev) => {
      const updated = prev.map((item) => (item.id === complaintId ? { 
        ...item, 
        messages: [...(item.messages || []), newMsg]
      } : item));
      
      // Update local storage if it's a custom complaint
      AsyncStorage.getItem("CITIZEN_APP_CUSTOM_COMPLAINTS").then(data => {
          if (data) {
              const existing = JSON.parse(data) as Complaint[];
              const localUpdated = existing.map(item => item.id === complaintId ? {
                  ...item, messages: [...(item.messages || []), newMsg]
              } : item);
              AsyncStorage.setItem("CITIZEN_APP_CUSTOM_COMPLAINTS", JSON.stringify(localUpdated));
          }
      });
      
      return updated;
    });
  };

  const value = useMemo(
    () => ({ complaints, filteredComplaints, loading, submitComplaint, updateStatus, sendMessage, refresh }),
    [complaints, filteredComplaints, loading]
  );

  return <ComplaintsContext.Provider value={value}>{children}</ComplaintsContext.Provider>;
}

export function useComplaints() {
  const ctx = useContext(ComplaintsContext);
  if (!ctx) {
    throw new Error("useComplaints must be used within ComplaintsProvider");
  }
  return ctx;
}
