import { createClient } from "@supabase/supabase-js";

// يرجى استبدال هذه القيم ببيانات مشروعك الخاصة من لوحة تحكم Supabase
// These should be moved to .env in a real production environment
const SUPABASE_URL = "https://sfpyaakogoeueledkfkd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcHlha2FvZ29ldWVsZWRrZmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MTEwOTAsImV4cCI6MjA5MTA4NzA5MH0.if4d3bYiWXlEBeA1TK3uTw6uSwzyWw-1_0W9-PEvApc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * دليل مختصر للجداول المطلوبة:
 * 1. users: (id, full_name, phone, role, organization, created_at)
 * 2. complaints: (id, title, description, location, status, reporter_id, assigned_dept, created_at)
 * 3. messages: (id, complaint_id, sender_id, text, created_at)
 */
