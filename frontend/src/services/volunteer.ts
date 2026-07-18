import { apiClient } from "./apiClient";

export interface Volunteer {
  id: string;
  user_id: string;
  name: string;
  role: string;
  status: string;
  zone: string | null;
  languages: string;
  phone: string | null;
  created_at: string;
}

export interface VolunteerTask {
  id: string;
  volunteer_id: string | null;
  task_type: string;
  description: string;
  zone: string | null;
  priority: string;
  status: string;
  assigned_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface VolunteerDashboard {
  total: number;
  on_shift: number;
  available: number;
  active_tasks: number;
  volunteers: Volunteer[];
  tasks: VolunteerTask[];
}

export const fetchVolunteerDashboard = () =>
  apiClient<VolunteerDashboard>("/volunteer/dashboard");

export const fetchVolunteers = (role?: string) =>
  apiClient<Volunteer[]>(`/volunteer/volunteers${role ? `?role=${role}` : ""}`);

export const createVolunteer = (data: { name: string; role: string; zone?: string; languages?: string; phone?: string }) =>
  apiClient<Volunteer>("/volunteer/volunteers", { method: "POST", body: JSON.stringify(data) });

export const updateVolunteerStatus = (id: string, data: { status: string; zone?: string }) =>
  apiClient<Volunteer>(`/volunteer/volunteers/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const fetchTasks = (status?: string) =>
  apiClient<VolunteerTask[]>(`/volunteer/tasks${status ? `?status=${status}` : ""}`);

export const updateTask = (id: string, data: { status: string; volunteer_id?: string }) =>
  apiClient<VolunteerTask>(`/volunteer/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) });
