"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  MessageSquare,
  UserCheck,
  Send,
  Search,
  ArrowUpDown,
  RefreshCw,
  Database,
  Lock,
  Edit3,
  Save,
  X,
  Plus,
  Target,
  BarChart3,
  LayoutDashboard,
  Building,
  CheckSquare,
  Megaphone,
  Bell,
  User,
  Menu,
  ChevronRight,
  LogOut,
  Users,
  Download,
  Check,
  Eye,
  Award,
  TrendingDown,
  Clock,
  Briefcase,
  Layers,
  SlidersHorizontal,
  Mail,
  Filter,
  Shield,
  Key,
  LogIn,
  Sparkles,
  HelpCircle
} from "lucide-react";

const getSafeEnv = (key: string): string => {
  try {
    if (typeof process !== "undefined" && process && process.env) {
      return process.env[key] || "";
    }
  } catch {
    // Safely fallback in non-Node environments
  }
  return "";
};

const supabaseUrl = getSafeEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = getSafeEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

const createInlineSupabaseClient = (url: string, key: string) => {
  if (!url || !key) return null;
  return {
    from: (table: string) => ({
      select: async (query: string = "*") => {
        try {
          const res = await fetch(
            `${url}/rest/v1/${table}?select=${encodeURIComponent(query)}`,
            {
              headers: {
                apikey: key,
                Authorization: `Bearer ${key}`,
              },
            }
          );
          if (!res.ok) return { data: null, error: await res.json().catch(() => ({ message: "HTTP Error" })) };
          const data = await res.json();
          return { data, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      },
      upsert: async (payload: any[]) => {
        try {
          const res = await fetch(`${url}/rest/v1/${table}`, {
            method: "POST",
            headers: {
              apikey: key,
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
              Prefer: "resolution=merge-duplicates",
            },
            body: JSON.stringify(payload),
          });
          const data = await res.json().catch(() => null);
          return { data, error: res.ok ? null : data };
        } catch (err) {
          return { data: null, error: err };
        }
      },
      insert: async (payload: any[]) => {
        try {
          const res = await fetch(`${url}/rest/v1/${table}`, {
            method: "POST",
            headers: {
              apikey: key,
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          const data = await res.json().catch(() => null);
          return { data, error: res.ok ? null : data };
        } catch (err) {
          return { data: null, error: err };
        }
      },
    }),
  };
};

const supabase = createInlineSupabaseClient(supabaseUrl, supabaseAnonKey);

export type Role = "SUPER_ADMIN" | "AREA_HEAD" | "KEPALA_UNIT";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  unitCode: string;
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

const INITIAL_UNITS: UnitDetail[] = Array.from({ length: 17 }, (_, i) => {
  const code = `KMU-${(i + 1).toString().padStart(2, "0")}`;
  const names = [
    "Sukamaju", "Pasar Anyar", "Batu Tulis", "Cibinong", "Ciawi", 
    "Parung", "Leuwiliang", "Cisarua", "Gunung Putri", "Citeureup",
    "Jasinga", "Ciampea", "Ciseeng", "Klapanunggal", "Dramaga", "Rumpin", "Tanjungsari"
  ];
  const heads = [
    "Ahmad Fauzi, S.E.", "Budi Hermawan", "Citra Lestari, M.M.", "Dedi Mulyadi",
    "Eka Putri, S.E.", "Fajar Nugraha", "Gita Gutawa, M.B.A.", "Hendra Setiawan",
    "Irfan Bachdim", "Joko Widodo", "Kurnia Meiga", "Lukman Sardi",
    "Maya Ahmad", "Nabila Syakieb", "Oki Setiana", "Prabowo Subianto", "Qory Sandioriva"
  ];
  return {
    id: `unit-uuid-${i + 1}`,
    code,
    name: `Kantor Mikro Unit ${names[i % names.length]}`,
    location: `Wilayah Operasional ${names[i % names.length]}`,
    headName: heads[i % heads.length],
    aoCount: 3 + (i % 4),
    staffCount: 5 + (i % 3),
    totalCustomers: 450 + i * 85,
  };
});

const INITIAL_METRICS: PerformanceMetric[] = INITIAL_UNITS.map((unit, index) => {
  const targetKredit = 1200000000 + index * 100000000;
  const multipliers = [1.08, 0.94, 0.76, 1.15, 0.89, 0.79, 1.02, 0.96, 0.68];
  const mult = multipliers[index % multipliers.length];
  const realisasiKredit = targetKredit * mult;

  const targetFunding = 900000000 + index * 60000000;
  const realisasiFunding = targetFunding * (mult > 0.9 ? 1.04 : 0.87);

  const targetCollection = 95;
  const realisasiCollection = Math.min(100, Math.max(75, Number((88 + (index % 5) * 3 - (index % 2) * 5).toFixed(1))));

  return {
    id: `metric-uuid-${index + 1}`,
    unit_id: unit.id,
    unit_name: unit.name,
    unit_code: unit.code,
    period_date: new Date().toISOString().split("T")[0],
    target_kredit: targetKredit,
    realisasi_kredit: realisasiKredit,
    target_funding: targetFunding,
    realisasi_funding: realisasiFunding,
    target_collection: targetCollection,
    realisasi_collection: realisasiCollection,
    npl_percentage: Number((1.2 + (index % 5) * 0.75).toFixed(2)),
    profit: Number(((realisasiKredit * 0.08) - (targetKredit * 0.02)).toFixed(0)),
    last_update: "Hari Ini, 08:30 WIB"
  };
});

const INITIAL_REPORTS: DailyReport[] = [
  {
    id: "rep-1",
    unit_id: INITIAL_UNITS[0].id,
    unit_name: INITIAL_UNITS[0].name,
    unit_code: INITIAL_UNITS[0].code,
    report_type: "HARIAN",
    report_date: new Date().toISOString().split("T")[0],
    operational_summary: "Penyaluran Kredit Mikro sektor UMKM Pasar Anyar berjalan lancar. 5 berkas dicairkan total Rp 350.000.000.",
    obstacles: "Dokumen jaminan nasabah A.N. Suhendar belum disahkan Notaris.",
    status: "APPROVED",
    area_head_notes: "Segera selesaikan legalitas jaminan minggu ini.",
  },
  {
    id: "rep-2",
    unit_id: INITIAL_UNITS[2].id,
    unit_name: INITIAL_UNITS[2].name,
    unit_code: INITIAL_UNITS[2].code,
    report_type: "HARIAN",
    report_date: new Date().toISOString().split("T")[0],
    operational_summary: "Penagihan intensif debitur menunggak NPL H-3. Terkumpul angsuran Rp 45.000.000.",
    obstacles: "Akses jalan menuju lokasi nasabah terkendala banjir lokal.",
    status: "PENDING",
    area_head_notes: "",
  },
];

const INITIAL_BROADCASTS: BroadcastMessage[] = [
  {
    id: "bc-1",
    title: "⚡ Evaluasi Pencapaian Target Akhir Bulan & Mitigasi NPL",
    content: "Diimbau kepada seluruh Kepala Unit untuk mempercepat rekonsiliasi pencairan kredit mikro dan penagihan H-3 sebelum tanggal 28. Rapat koordinasi diadakan esok pukul 09.00 WIB.",
    date: "27 Jul 2026 - 08:00 WIB",
    sender: "Head Area Regional 1",
    readBy: ["KMU-01", "KMU-02"]
  }
];

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif-1",
    title: "Peringatan NPL Tinggi",
    message: "Unit KMU-03 (Batu Tulis) mencatatkan kenaikan NPL sebesar 4.20% (Melebihi batas aman 3.00%).",
    timestamp: "10 menit yang lalu",
    type: "WARNING",
    isRead: false
  },
  {
    id: "notif-2",
    title: "Target Tercapai",
    message: "Selamat! Unit KMU-01 (Sukamaju) telah mencapai 108% Target Kredit bulan ini.",
    timestamp: "1 jam yang lalu",
    type: "SUCCESS",
    isRead: false
  }
];

export default function CommandCenter() {
  // Authentication & Login Portal Gate State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<Role>("AREA_HEAD");
  const [activeUnitScope, setActiveUnitScope] = useState<string>("KMU-01");
  const [activeMenu, setActiveMenu] = useState<string>("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Master Data States
  const [units] = useState<UnitDetail[]>(INITIAL_UNITS);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>(INITIAL_METRICS);
  const [reports, setReports] = useState<DailyReport[]>(INITIAL_REPORTS);
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>(INITIAL_BROADCASTS);
  const [notifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);

  // Connection & Filtering States
  const [isConnectedLive, setIsConnectedLive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedUnitDetail, setSelectedUnitDetail] = useState<UnitDetail | null>(null);

  // Form Modals States
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState<boolean>(false);
  const [newBroadcastTitle, setNewBroadcastTitle] = useState<string>("");
  const [newBroadcastContent, setNewBroadcastContent] = useState<string>("");

  const [newReportType, setNewReportType] = useState<"HARIAN" | "MINGGUAN" | "BULANAN">("HARIAN");
  const [newReportSummary, setNewReportSummary] = useState<string>("");
  const [newReportObstacles, setNewReportObstacles] = useState<string>("");

  const [areaHeadNoteInput, setAreaHeadNoteInput] = useState<string>("");
  const [editingMetric, setEditingMetric] = useState<PerformanceMetric | null>(null);

  const fetchLiveData = async () => {
    if (!supabase) {
      setIsConnectedLive(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await supabase.from("performance_metrics").select(`*, units:unit_id (name, code)`);
      if (res && res.data && res.data.length > 0) {
        const formattedMetrics: PerformanceMetric[] = res.data.map((m: any) => ({
          id: m.id,
          unit_id: m.unit_id,
          unit_name: m.units?.name || "Unit Unknown",
          unit_code: m.units?.code || "KMU-00",
          period_date: m.period_date,
          target_kredit: Number(m.target_kredit),
          realisasi_kredit: Number(m.realisasi_kredit),
          target_funding: Number(m.target_funding),
          realisasi_funding: Number(m.realisasi_funding),
          target_collection: 95,
          realisasi_collection: 90,
          npl_percentage: Number(m.npl_percentage),
          profit: 150000000,
          last_update: "Hari Ini"
        }));
        setMetrics(formattedMetrics);
        setIsConnectedLive(true);
      } else {
        setIsConnectedLive(false);
      }
    } catch (err) {
      console.warn("Menggunakan Local Fallback State:", err);
      setIsConnectedLive(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
  }, []);

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  const getAchievement = (realization: number, target: number) =>
    target > 0 ? (realization / target) * 100 : 0;

  // Active Scoped Data Computation
  const scopedMetrics = useMemo(() => {
    if (currentRole === "KEPALA_UNIT") {
      return metrics.filter((m) => m.unit_code === activeUnitScope);
    }
    return metrics;
  }, [metrics, currentRole, activeUnitScope]);

  const activeUnitInfo = useMemo(() => {
    return units.find((u) => u.code === activeUnitScope) || units[0];
  }, [units, activeUnitScope]);

  // Executive Regional Calculations
  const totalTargetKredit = metrics.reduce((acc, m) => acc + m.target_kredit, 0);
  const totalRealisasiKredit = metrics.reduce((acc, m) => acc + m.realisasi_kredit, 0);
  const regionalKreditAchievement = getAchievement(totalRealisasiKredit, totalTargetKredit);

  const totalTargetFunding = metrics.reduce((acc, m) => acc + m.target_funding, 0);
  const totalRealisasiFunding = metrics.reduce((acc, m) => acc + m.realisasi_funding, 0);

  const avgNPL = metrics.length > 0 ? metrics.reduce((acc, m) => acc + m.npl_percentage, 0) / metrics.length : 0;
  const targetAchievedCount = metrics.filter((m) => getAchievement(m.realisasi_kredit, m.target_kredit) >= 100).length;

  // Top 5 & Bottom 5 Rankings
  const sortedByPerformance = useMemo(() => {
    return [...metrics].sort((a, b) => getAchievement(b.realisasi_kredit, b.target_kredit) - getAchievement(a.realisasi_kredit, a.target_kredit));
  }, [metrics]);

  const top5Units = sortedByPerformance.slice(0, 5);
  const bottom5Units = sortedByPerformance.slice(-5).reverse();

  const menuItems = useMemo(() => {
    if (currentRole === "AREA_HEAD" || currentRole === "SUPER_ADMIN") {
      return [
        { name: "Dashboard", icon: LayoutDashboard },
        { name: "Monitoring Unit", icon: Building2 },
        { name: "Approval", icon: CheckSquare, badge: reports.filter(r => r.status === "PENDING").length },
        { name: "Laporan Area", icon: FileText },
        { name: "Broadcast", icon: Megaphone },
        { name: "Notifikasi", icon: Bell, badge: notifications.filter(n => !n.isRead).length },
        { name: "Profil", icon: User },
      ];
    } else {
      return [
        { name: "Dashboard Unit", icon: LayoutDashboard },
        { name: "Data Unit", icon: Building },
        { name: "Input Laporan", icon: Send },
        { name: "Monitoring Target", icon: Target },
        { name: "Pesan dari Head", icon: Mail, badge: broadcasts.filter(b => !b.readBy.includes(activeUnitScope)).length },
        { name: "Notifikasi Unit", icon: Bell },
        { name: "Profil Unit", icon: User },
      ];
    }
  }, [currentRole, reports, notifications, broadcasts, activeUnitScope]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setLoginError("");

    setTimeout(() => {
      setIsAuthenticating(false);
      setIsAuthenticated(true);
      setActiveMenu(currentRole === "KEPALA_UNIT" ? "Dashboard Unit" : "Dashboard");
    }, 600);
  };

  const handleQuickLogin = (role: Role, unitCode: string = "KMU-01") => {
    setCurrentRole(role);
    setActiveUnitScope(unitCode);
    setLoginEmail(
      role === "AREA_HEAD"
        ? "areahead@bank.co.id"
        : role === "KEPALA_UNIT"
        ? `kepala.${unitCode.toLowerCase()}@bank.co.id`
        : "admin.it@bank.co.id"
    );
    setLoginPassword("••••••••");
    setIsAuthenticated(true);
    setActiveMenu(role === "KEPALA_UNIT" ? "Dashboard Unit" : "Dashboard");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginEmail("");
    setLoginPassword("");
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBroadcastTitle.trim() || !newBroadcastContent.trim()) return;

    const created: BroadcastMessage = {
      id: `bc-${Date.now()}`,
      title: newBroadcastTitle,
      content: newBroadcastContent,
      date: "Baru Saja",
      sender: "Head Area Regional",
      readBy: []
    };

    setBroadcasts([created, ...broadcasts]);
    setNewBroadcastTitle("");
    setNewBroadcastContent("");
    setIsBroadcastModalOpen(false);
  };

  const handleMarkBroadcastRead = (id: string) => {
    setBroadcasts(prev => prev.map(b => {
      if (b.id === id && !b.readBy.includes(activeUnitScope)) {
        return { ...b, readBy: [...b.readBy, activeUnitScope] };
      }
      return b;
    }));
  };

  const handleSaveUnitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportSummary.trim()) return;

    const currentUnitData = units.find(u => u.code === activeUnitScope);
    const newRep: DailyReport = {
      id: `rep-${Date.now()}`,
      unit_id: currentUnitData?.id || "unit-01",
      unit_name: currentUnitData?.name || "Kantor Mikro",
      unit_code: activeUnitScope,
      report_type: newReportType,
      report_date: new Date().toISOString().split("T")[0],
      operational_summary: newReportSummary,
      obstacles: newReportObstacles || "Tidak ada kendala utama.",
      status: "PENDING",
      area_head_notes: ""
    };

    setReports([newRep, ...reports]);
    setNewReportSummary("");
    setNewReportObstacles("");
  };

  const handleApproveReport = (id: string, status: "APPROVED" | "REVISION") => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status, area_head_notes: areaHeadNoteInput || r.area_head_notes } : r));
    setAreaHeadNoteInput("");
  };

  const handleSaveMetricUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMetric) return;

    setMetrics(prev => prev.map(m => m.id === editingMetric.id ? editingMetric : m));
    setEditingMetric(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-emerald-500 selection:text-slate-900">
        
        {/* BACKGROUND GLOW DECORATIONS */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md space-y-6 relative z-10">
          
          {/* HEADER LOGO */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-950 border border-emerald-400/30">
              <Building2 className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-wider uppercase text-white leading-tight">
              MICRO-UNIT PORTAL
            </h1>
            <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">
              Command Center Perbankan Regional
            </p>
          </div>

          {/* MAIN LOGIN CARD */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <LogIn className="w-4 h-4 text-emerald-400" /> Masuk Ke Portal Resmi
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Gunakan kredensial resmi Head Area atau Kepala Unit
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              
              {/* ROLE ACCESS SELECTOR */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" /> Tipe Hak Akses (Role):
                </label>
                <select
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value as Role)}
                  className="w-full bg-[#0F172A] text-white font-bold rounded-xl p-3 border border-slate-700 outline-none focus:border-emerald-500"
                >
                  <option value="AREA_HEAD">Head Area (Supervisor 17 Unit)</option>
                  <option value="KEPALA_UNIT">Kepala Unit (Scoped Branch)</option>
                  <option value="SUPER_ADMIN">Super Admin (IT Master)</option>
                </select>
              </div>

              {/* BRANCH SCOPE SELECTOR FOR KEPALA UNIT */}
              {currentRole === "KEPALA_UNIT" && (
                <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Pilih Cabang Unit Anda:
                  </label>
                  <select
                    value={activeUnitScope}
                    onChange={(e) => setActiveUnitScope(e.target.value)}
                    className="w-full bg-[#0F172A] text-amber-300 font-mono font-bold rounded-lg p-2 border border-amber-500/40 outline-none cursor-pointer"
                  >
                    {units.map((u) => (
                      <option key={u.code} value={u.code}>
                        {u.code} — {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* EMAIL / NIK INPUT */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Email / ID Pengguna</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: headarea@bank.co.id"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#0F172A] border border-slate-700 rounded-xl text-white font-medium outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* PASSWORD INPUT */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Kata Sandi</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#0F172A] border border-slate-700 rounded-xl text-white font-medium outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isAuthenticating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" /> Masuk Ke Dashboard
                  </>
                )}
              </button>
            </form>

            {/* QUICK PRESET BUTTONS FOR FAST TESTING */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                Atau Klik Akses Demo Cepat:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("AREA_HEAD")}
                  className="p-2.5 bg-[#0F172A] hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition-all text-slate-200 cursor-pointer"
                >
                  <span className="block text-[9px] font-bold text-emerald-400 uppercase">Head Area</span>
                  Supervisor 17 Unit
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("KEPALA_UNIT", "KMU-01")}
                  className="p-2.5 bg-[#0F172A] hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition-all text-slate-200 cursor-pointer"
                >
                  <span className="block text-[9px] font-bold text-amber-400 uppercase">Kepala Unit</span>
                  KMU-01 Sukamaju
                </button>
              </div>
            </div>

          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sistem Informasi Micro-Unit Banking v2.0</span>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col md:flex-row selection:bg-slate-900 selection:text-emerald-400">
      
      {/* SIDEBAR NAVIGATION (DYNAMIC ACCORDING TO ROLE) */}
      <aside
        className={`bg-[#0F172A] text-slate-300 w-full md:w-64 flex-shrink-0 transition-all duration-300 z-50 ${
          isSidebarOpen ? "block" : "hidden md:block"
        }`}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-600 rounded-lg text-white font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-wider uppercase text-white leading-tight">
                COMMAND CENTER
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">Micro-Unit Perbankan</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ROLE SIMULATION SELECTOR */}
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" /> Mode Akses User:
          </label>
          <select
            value={currentRole}
            onChange={(e) => {
              const role = e.target.value as Role;
              setCurrentRole(role);
              setActiveMenu(role === "KEPALA_UNIT" ? "Dashboard Unit" : "Dashboard");
            }}
            className="w-full bg-[#0F172A] text-white text-xs font-bold rounded-lg p-2 border border-slate-700 outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="AREA_HEAD">Head Area (Supervisor 17 Unit)</option>
            <option value="KEPALA_UNIT">Kepala Unit (Scoped Branch)</option>
            <option value="SUPER_ADMIN">Super Admin (IT Master)</option>
          </select>

          {currentRole === "KEPALA_UNIT" && (
            <div className="pt-2 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                Pilih Cabang Unit Anda:
              </label>
              <select
                value={activeUnitScope}
                onChange={(e) => setActiveUnitScope(e.target.value)}
                className="w-full bg-[#0F172A] text-amber-300 text-xs font-mono font-bold rounded-lg p-2 border border-amber-500/40 outline-none cursor-pointer"
              >
                {units.map((u) => (
                  <option key={u.code} value={u.code}>
                    {u.code} - {u.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* SIDEBAR MENU LIST */}
        <nav className="p-3 space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-2">
            Menu Utama ({currentRole.replace("_", " ")})
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveMenu(item.name)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge ? (
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-500 text-white">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* USER PROFILE & LOGOUT FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 mt-auto space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold text-xs border border-slate-700">
                {currentRole === "AREA_HEAD" ? "HA" : currentRole === "KEPALA_UNIT" ? "KU" : "SA"}
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-none">
                  {currentRole === "AREA_HEAD" ? "Drs. Bambang H." : currentRole === "KEPALA_UNIT" ? activeUnitInfo.headName : "Admin IT System"}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {currentRole === "KEPALA_UNIT" ? activeUnitScope : "Regional Office"}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 border border-rose-900/30 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER BAR */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Micro-Unit Portal</span>
                <span>/</span>
                <span className="text-emerald-600 font-mono">{activeMenu}</span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight leading-none mt-0.5">
                {activeMenu} {currentRole === "KEPALA_UNIT" ? `— ${activeUnitScope}` : ""}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>Status Data:</span>
              {isConnectedLive ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Supabase
                </span>
              ) : (
                <span className="text-amber-600 font-bold">Local Fallback</span>
              )}
            </div>

            <button
              onClick={fetchLiveData}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
              <span className="hidden sm:inline">Sync Data</span>
            </button>
          </div>
        </header>

        {/* MAIN BODY DYNAMIC VIEWS */}
        <main className="p-4 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* VIEW: EXECUTIVE DASHBOARD */}
          {(activeMenu === "Dashboard" || activeMenu === "Dashboard Unit") && (
            <div className="space-y-8">
              {currentRole === "KEPALA_UNIT" ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-[#0F172A] to-slate-800 text-white p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative z-10">
                      <div>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
                          SCOPED ACCESS: {activeUnitScope}
                        </span>
                        <h2 className="text-xl font-extrabold tracking-tight mt-2">{activeUnitInfo.name}</h2>
                        <p className="text-xs text-slate-300 mt-1">
                          Kepala Unit: <b>{activeUnitInfo.headName}</b> | Total AO: <b>{activeUnitInfo.aoCount} Personil</b> | Total Nasabah: <b>{activeUnitInfo.totalCustomers} Debitur</b>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-semibold">Status Kinerja Unit:</span>
                        <span className="text-xl font-black text-emerald-400">
                          {getAchievement(scopedMetrics[0]?.realisasi_kredit || 0, scopedMetrics[0]?.target_kredit || 1).toFixed(1)}% (ON TARGET)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Target vs Realisasi Kredit</span>
                      <div className="text-xl font-black text-slate-900 mt-2">{formatRupiah(scopedMetrics[0]?.realisasi_kredit || 0)}</div>
                      <div className="text-xs text-slate-500 mt-1">Target: {formatRupiah(scopedMetrics[0]?.target_kredit || 0)}</div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Target vs Realisasi DPK</span>
                      <div className="text-xl font-black text-slate-900 mt-2">{formatRupiah(scopedMetrics[0]?.realisasi_funding || 0)}</div>
                      <div className="text-xs text-slate-500 mt-1">Target: {formatRupiah(scopedMetrics[0]?.target_funding || 0)}</div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Rate NPL Unit</span>
                      <div className={`text-xl font-black mt-2 ${(scopedMetrics[0]?.npl_percentage || 0) <= 3 ? "text-emerald-600" : "text-rose-600"}`}>
                        {scopedMetrics[0]?.npl_percentage.toFixed(2)}%
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Max Toleransi: 3.00%</div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Rate Collection Rate</span>
                      <div className="text-xl font-black text-blue-600 mt-2">{scopedMetrics[0]?.realisasi_collection}%</div>
                      <div className="text-xs text-slate-500 mt-1">Target: 95.0%</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Total Outstanding Kredit
                        </span>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-slate-900 mt-2">
                        {formatRupiah(totalRealisasiKredit)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Target: <span className="font-semibold text-slate-700">{formatRupiah(totalTargetKredit)}</span>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Pencapaian Area:</span>
                        <span className="text-emerald-600">{regionalKreditAchievement.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Total DPK / Funding
                        </span>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <Building2 className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-slate-900 mt-2">
                        {formatRupiah(totalRealisasiFunding)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Target: <span className="font-semibold text-slate-700">{formatRupiah(totalTargetFunding)}</span>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Unit On Target:</span>
                        <span className="text-blue-600">{targetAchievedCount} / 17 Unit</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Rata-Rata NPL Regional
                        </span>
                        <div className={`p-2 rounded-lg ${avgNPL <= 3 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                      </div>
                      <div className={`text-2xl font-black mt-2 ${avgNPL <= 3 ? "text-emerald-600" : "text-rose-600"}`}>
                        {avgNPL.toFixed(2)}%
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Batas Toleransi: <span className="font-semibold text-slate-700">3.00%</span>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Status Kualitas:</span>
                        <span className={avgNPL <= 3 ? "text-emerald-600" : "text-rose-600"}>
                          {avgNPL <= 3 ? "SEHAT" : "PERLU ATENSI"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Total AO & Nasabah Area
                        </span>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                          <Users className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-slate-900 mt-2">
                        {units.reduce((acc, u) => acc + u.aoCount, 0)} AO
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Total Debitur: <span className="font-bold text-slate-800">{units.reduce((acc, u) => acc + u.totalCustomers, 0).toLocaleString()}</span>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Total Kantor Branch:</span>
                        <span className="text-slate-900">17 Unit</span>
                      </div>
                    </div>
                  </div>

                  {/* RANKING PERFORMA UNIT */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-emerald-600" />
                          <h3 className="font-bold text-slate-900 text-sm">Top 5 Unit Performansi Terbaik</h3>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                          Pencapaian Target Tinggi
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        {top5Units.map((item, idx) => (
                          <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                            <div className="flex items-center gap-3">
                              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                                {idx + 1}
                              </span>
                              <div>
                                <span className="font-bold text-slate-900 block">{item.unit_name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{item.unit_code}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-emerald-600 block">
                                {getAchievement(item.realisasi_kredit, item.target_kredit).toFixed(1)}%
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">{formatRupiah(item.realisasi_kredit)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-5 h-5 text-rose-600" />
                          <h3 className="font-bold text-slate-900 text-sm">Bottom 5 Unit Perlu Pembinaan</h3>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700">
                          Di Bawah Target
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        {bottom5Units.map((item, idx) => (
                          <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                            <div className="flex items-center gap-3">
                              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]">
                                {idx + 1}
                              </span>
                              <div>
                                <span className="font-bold text-slate-900 block">{item.unit_name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{item.unit_code}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-rose-600 block">
                                {getAchievement(item.realisasi_kredit, item.target_kredit).toFixed(1)}%
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">{formatRupiah(item.realisasi_kredit)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: MONITORING SELURUH UNIT */}
          {(activeMenu === "Monitoring Unit" || activeMenu === "Monitoring Target") && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
              <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Matriks Kinerja & Monitoring {currentRole === "KEPALA_UNIT" ? activeUnitScope : "17 Kantor Mikro"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rekapitulasi pencapaian target kredit, DPK, Collection Rate, dan NPL
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari nama / kode unit..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-slate-800 w-48 md:w-64"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-[#0F172A] text-white uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Kode & Nama Unit</th>
                      <th className="py-3 px-4 text-right">Target Kredit</th>
                      <th className="py-3 px-4 text-right">Realisasi Kredit</th>
                      <th className="py-3 px-4 text-center">% Pencapaian</th>
                      <th className="py-3 px-4 text-right">Realisasi DPK</th>
                      <th className="py-3 px-4 text-center">Collection %</th>
                      <th className="py-3 px-4 text-center">NPL %</th>
                      <th className="py-3 px-4 text-center">Aksi / Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {scopedMetrics
                      .filter((m) =>
                        (m.unit_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (m.unit_code || "").toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((m, idx) => {
                        const ach = getAchievement(m.realisasi_kredit, m.target_kredit);
                        const matchedUnit = units.find((u) => u.code === m.unit_code);
                        return (
                          <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-mono">
                                  {idx + 1}
                                </span>
                                <div>
                                  <div>{m.unit_name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">{m.unit_code}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-slate-600">{formatRupiah(m.target_kredit)}</td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{formatRupiah(m.realisasi_kredit)}</td>
                            <td className="py-3 px-4 text-center font-bold">
                              <span className={ach >= 100 ? "text-emerald-600" : ach >= 80 ? "text-amber-600" : "text-rose-600"}>
                                {ach.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-slate-600">{formatRupiah(m.realisasi_funding)}</td>
                            <td className="py-3 px-4 text-center font-bold text-blue-600">{m.realisasi_collection}%</td>
                            <td className="py-3 px-4 text-center font-bold">
                              <span className={m.npl_percentage <= 3 ? "text-slate-700" : "text-rose-600"}>
                                {m.npl_percentage.toFixed(2)}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => setSelectedUnitDetail(matchedUnit || units[0])}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-all cursor-pointer"
                                  title="Lihat Detail Cabang"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                {(currentRole === "AREA_HEAD" || currentRole === "SUPER_ADMIN") && (
                                  <button
                                    onClick={() => setEditingMetric({ ...m })}
                                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded transition-all cursor-pointer"
                                    title="Edit Target & Realisasi"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: APPROVAL */}
          {activeMenu === "Approval" && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                    Persetujuan Terpusat (Approval Head Area)
                  </h3>
                  <p className="text-xs text-slate-500">Validasi laporan harian/berkala dan pengajuan revisi target dari Kepala Unit</p>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold">
                  {reports.filter((r) => r.status === "PENDING").length} Menunggu Persetujuan
                </span>
              </div>

              <div className="space-y-3">
                {reports.map((rep) => (
                  <div key={rep.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-mono font-bold text-[10px]">
                          {rep.unit_code}
                        </span>
                        <span className="font-bold text-xs text-slate-900">{rep.unit_name}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        rep.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" :
                        rep.status === "REVISION" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {rep.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700"><b>Ringkasan Laporan:</b> {rep.operational_summary}</p>
                    <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded"><b>Kendala:</b> {rep.obstacles}</p>

                    {rep.status === "PENDING" && (
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => handleApproveReport(rep.id, "APPROVED")}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Disetujui
                        </button>
                        <button
                          onClick={() => handleApproveReport(rep.id, "REVISION")}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Minta Revisi
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: BROADCAST */}
          {(activeMenu === "Broadcast" || activeMenu === "Pesan dari Head") && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Kotak Broadcast & Pengumuman Massal</h3>
                  <p className="text-xs text-slate-500">Pesan resmi dari Head Area ke seluruh 17 Kantor Mikro</p>
                </div>
                {(currentRole === "AREA_HEAD" || currentRole === "SUPER_ADMIN") && (
                  <button
                    onClick={() => setIsBroadcastModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Buat Broadcast Baru
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {broadcasts.map((bc) => {
                  const isReadByCurrentUnit = bc.readBy.includes(activeUnitScope);
                  return (
                    <div key={bc.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="font-extrabold text-sm text-slate-900">{bc.title}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{bc.date}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{bc.content}</p>
                      
                      {currentRole === "KEPALA_UNIT" && (
                        <div className="pt-2 flex justify-end">
                          {!isReadByCurrentUnit ? (
                            <button
                              onClick={() => handleMarkBroadcastRead(bc.id)}
                              className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-[11px] rounded hover:bg-blue-100 cursor-pointer"
                            >
                              Tandai Sudah Dibaca
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Dibaca
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: INPUT LAPORAN */}
          {activeMenu === "Input Laporan" && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base">Form Pengiriman Laporan Unit</h3>
                <p className="text-xs text-slate-500">Kirim laporan harian, mingguan, atau bulanan langsung ke Head Area</p>
              </div>

              <form onSubmit={handleSaveUnitReport} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Laporan</label>
                  <select
                    value={newReportType}
                    onChange={(e) => setNewReportType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none font-medium"
                  >
                    <option value="HARIAN">Laporan Harian Operasional</option>
                    <option value="MINGGUAN">Laporan Rekap Mingguan</option>
                    <option value="BULANAN">Laporan Bulanan Pencapaian</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ringkasan Pencapaian & Prospek</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tuliskan realisasi pencairan, penagihan, dan prospek nasabah..."
                    value={newReportSummary}
                    onChange={(e) => setNewReportSummary(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none font-medium"
                  ></textarea>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hambatan & Kendala Lapangan</label>
                  <textarea
                    rows={2}
                    placeholder="Tuliskan kendala teknis / jaminan..."
                    value={newReportObstacles}
                    onChange={(e) => setNewReportObstacles(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none font-medium"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-3 rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Kirim Laporan Resmi
                </button>
              </form>
            </div>
          )}

          {/* VIEW: NOTIFIKASI */}
          {(activeMenu === "Notifikasi" || activeMenu === "Notifikasi Unit") && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">Pusat Notifikasi Sistem</h3>
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{n.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">{n.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: PROFIL */}
          {(activeMenu === "Profil" || activeMenu === "Profil Unit") && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-xl mx-auto space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div className="w-16 h-16 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-black text-xl">
                  {currentRole === "AREA_HEAD" ? "HA" : "KU"}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {currentRole === "AREA_HEAD" ? "Drs. Bambang Hermawan" : activeUnitInfo.headName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Role: {currentRole} | {currentRole === "KEPALA_UNIT" ? activeUnitScope : "Regional Office"}
                  </p>
                </div>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kata Sandi Lama</label>
                  <input type="password" required className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kata Sandi Baru</label>
                  <input type="password" required className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none" />
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg cursor-pointer">
                  Ubah Kata Sandi
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: DETAIL UNIT */}
      {selectedUnitDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  {selectedUnitDetail.code}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">{selectedUnitDetail.name}</h3>
              </div>
              <button onClick={() => setSelectedUnitDetail(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Kepala Unit</span>
                <span className="font-bold text-slate-900">{selectedUnitDetail.headName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Jumlah AO</span>
                <span className="font-bold text-slate-900">{selectedUnitDetail.aoCount} Personil</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Jumlah Staff</span>
                <span className="font-bold text-slate-900">{selectedUnitDetail.staffCount} Personil</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedUnitDetail(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BROADCAST FORM */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900">Buat Broadcast Baru Ke 17 Unit</h4>
            <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Judul Broadcast..."
                value={newBroadcastTitle}
                onChange={(e) => setNewBroadcastTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none font-bold"
              />
              <textarea
                rows={4}
                required
                placeholder="Isi pesan / pengumuman..."
                value={newBroadcastContent}
                onChange={(e) => setNewBroadcastContent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none"
              ></textarea>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Kirim Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT METRIC */}
      {editingMetric && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900">Update Target & Realisasi: {editingMetric.unit_name}</h4>
            <form onSubmit={handleSaveMetricUpdate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Target Kredit (Rp)</label>
                  <input
                    type="number"
                    value={editingMetric.target_kredit}
                    onChange={(e) => setEditingMetric({ ...editingMetric, target_kredit: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Realisasi Kredit (Rp)</label>
                  <input
                    type="number"
                    value={editingMetric.realisasi_kredit}
                    onChange={(e) => setEditingMetric({ ...editingMetric, realisasi_kredit: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono font-bold"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMetric(null)}
                  className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}