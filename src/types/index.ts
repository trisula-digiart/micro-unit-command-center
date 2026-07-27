export type Role = "SUPER_ADMIN" | "AREA_HEAD" | "KEPALA_UNIT";
export type UserRole = Role;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  unitCode?: string;
}

export interface UnitDetail {
  id: string;
  code: string;
  name: string;
  location: string;
  headName: string;
  aoCount: number;
  staffCount: number;
  totalCustomers: number;
}

export interface PerformanceMetric {
  id: string;
  unit_id: string;
  unit_name?: string;
  unit_code?: string;
  period_date: string;
  target_kredit: number;
  realisasi_kredit: number;
  target_funding: number;
  realisasi_funding: number;
  target_collection: number;
  realisasi_collection: number;
  npl_percentage: number;
  profit: number;
  last_update: string;
}

export interface DailyReport {
  id: string;
  unit_id: string;
  unit_name?: string;
  unit_code?: string;
  report_type: "HARIAN" | "MINGGUAN" | "BULANAN";
  report_date: string;
  operational_summary: string;
  obstacles: string;
  status: "PENDING" | "APPROVED" | "REVISION";
  area_head_notes?: string;
}

export interface BroadcastMessage {
  id: string;
  title: string;
  content: string;
  date: string;
  sender: string;
  readBy: string[];
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "WARNING" | "INFO" | "SUCCESS";
  isRead: boolean;
}