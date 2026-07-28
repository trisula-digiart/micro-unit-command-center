export type Role = "SUPER_ADMIN" | "AREA_HEAD" | "KEPALA_UNIT";
export type UserRole = Role;

export type PerformanceStatus = "GREEN" | "YELLOW" | "RED" | "EXCELLENT" | "GOOD" | "WARNING" | "CRITICAL" | string;

export type ReportStatus = "PENDING" | "APPROVED" | "REVISION" | "SUBMITTED" | "REVIEWED" | "NEEDS_ACTION";

export type NotificationType = "WARNING" | "INFO" | "SUCCESS";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  unitCode?: string;
  unit_id?: string;
  created_at?: string;
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
  region?: string;
  created_at?: string;
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
  dkp_percentage: number;
  profit: number;
  last_update: string;
  updated_at?: string;
  submitted_today?: boolean;
  status?: PerformanceStatus;
}

export interface DailyReport {
  id: string;
  unit_id: string;
  user_id?: string;
  unit_name?: string;
  unit_code?: string;
  report_type: "HARIAN" | "MINGGUAN" | "BULANAN" | string;
  report_date: string;
  operational_summary: string;
  obstacles: string;
  status: ReportStatus;
  area_head_notes?: string;
  created_at?: string;
}

export interface ProspectPipeline {
  id: string;
  unit_id: string;
  unit_code?: string;
  prospect_name: string;
  sector: string;
  potential_amount: number;
  stage: "PROSPECT" | "VERIFICATION" | "APPROVED" | "REJECTED" | string;
  notes?: string;
  created_at?: string;
}

export interface BroadcastMessage {
  id: string;
  title: string;
  content: string;
  date: string;
  sender: string;
  created_by?: string;
  readBy: string[];
  created_at?: string;
}

export interface SystemNotification {
  id: string;
  unit_id?: string;
  title: string;
  message: string;
  timestamp: string;
  type: NotificationType;
  isRead: boolean;
  created_at?: string;
}