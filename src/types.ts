/**
 * National Digital Platform Types (Official)
 * Includes role definitions, tracking schemas, and administrative structures.
 */

export type UserRole = "citizen" | "department" | "admin";

export type AuthUser = {
  id: string;
  phone: string;
  full_name: string;
  username?: string;
  email?: string;
  role: UserRole;
  organization?: string; // For 'department' role (e.g., "Water Department")
  coverUri?: string; // App dashboard background specific to department
};

export type ComplaintStatus =
  | "submitted"     // تم الاستلام
  | "under_review"  // قيد المراجعة
  | "in_progress"   // جاري التنفيذ
  | "resolved"      // مُكتمل / تم الحل
  | "rejected";     // مرفوض

export type Message = {
  id: string;
  text: string;
  sender_role: UserRole | "officer"; // Support legacy roles
  sender_name: string;
  created_at: string;
  image_url?: string;
  video_url?: string;
};

export type TimelineStep = {
  id: string;
  status: ComplaintStatus;
  at: string;
  note: string;
  actor: string;
};

export type Complaint = {
  id: string;
  citizen_id?: string; // Optional for anonymous
  reporter_name?: string;
  reporter_phone?: string;
  reporter_email?: string;
  title: string;
  description: string;
  category: string; 
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  assigned_dept: string; 
  status: ComplaintStatus;
  created_at: string;
  media_urls?: string[];
  history: TimelineStep[]; 
  messages: Message[]; 
};

export type TimelineEvent = {
  from_status: ComplaintStatus | null;
  to_status: ComplaintStatus;
  at: string;
  public_note: string;
  actor_name: string;
};

export type ServiceDept = {
  id: string;
  name: string;
  sector: string;
  logo?: string;
};
