export type UserRole = 'SUPER_ADMIN' | 'AREA_HEAD' | 'KEPALA_UNIT';

export type PerformanceStatus = 'GREEN' | 'YELLOW' | 'RED';

export type ReportStatus = 'SUBMITTED' | 'REVIEWED' | 'NEEDS_ACTION';

export interface Unit {
id: string;
code: string;
name: string;
region: string;
created_at?: string;
}

export interface UserProfile {
id: string;
email: string;
full_name: string;
role: UserRole;
unit_id?: string | null;
unit?: Unit | null;
created_at?: string;
}

export interface PerformanceMetric {
id: string;
unit_id: string;
unit?: Unit;
period_date: string;
target_kredit: number;
realisasi_kredit: number;
target_dpk: number;
realisasi_dpk: number;
npl_ratio: number;
updated_at?: string;
// Computed fields for UI
ach_kredit_percent?: number;
ach_dpk_percent?: number;
status?: PerformanceStatus;
}

export interface DailyReport {
id: string;
unit_id: string;
unit?: Unit;
user_id: string;
user?: UserProfile;
report_date: string;
summary_activities: string;
operational_issues?: string;
area_head_notes?: string;
status: ReportStatus;
created_at: string;
}

export interface ProspectPipeline {
id: string;
unit_id: string;
prospect_name: string;
sector: string;
potential_amount: number;
stage: 'PROSPECT' | 'VERIFICATION' | 'APPROVED' | 'REJECTED';
notes?: string;
created_at: string;
}

export interface ExecutiveSummary {
total_units: number;
total_kredit_target: number;
total_kredit_realisasi: number;
total_dpk_target: number;
total_dpk_realisasi: number;
avg_npl_ratio: number;
units_at_risk_count: number;
}