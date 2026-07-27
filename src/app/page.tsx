"use client";

import React, { useState, useEffect } from "react";
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
  BarChart3
} from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Custom inline client using native REST fetch to avoid bundling external package issues
const createInlineSupabaseClient = (url: string, key: string) => {
  if (!url || !key) return null;
  return {
    from: (table: string) => ({
      select: (query: string = "*") => {
        const fetchSelect = async () => {
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
            if (!res.ok) return { data: null, error: await res.json() };
            const data = await res.json();
            return { data, error: null };
          } catch (err) {
            return { data: null, error: err };
          }
        };

        return {
          order: (column: string, { ascending }: { ascending: boolean }) => {
            return (async () => {
              try {
                const res = await fetch(
                  `${url}/rest/v1/${table}?select=${encodeURIComponent(
                    query
                  )}&order=${column}.${ascending ? "asc" : "desc"}`,
                  {
                    headers: {
                      apikey: key,
                      Authorization: `Bearer ${key}`,
                    },
                  }
                );
                if (!res.ok) return { data: null, error: await res.json() };
                const data = await res.json();
                return { data, error: null };
              } catch (err) {
                return { data: null, error: err };
              }
            })();
          },
          then: (onfulfilled: any) => fetchSelect().then(onfulfilled),
        };
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

type Role = "SUPER_ADMIN" | "AREA_HEAD" | "KEPALA_UNIT";
type TabView = "OVERVIEW" | "PIPELINE_REPORTS" | "EARLY_WARNING";

interface Unit {
  id: string;
  code: string;
  name: string;
  location: string;
}

interface PerformanceMetric {
  id: string;
  unit_id: string;
  unit_name?: string;
  unit_code?: string;
  period_date: string;
  target_kredit: number;
  realisasi_kredit: number;
  target_funding: number;
  realisasi_funding: number;
  npl_percentage: number;
}

interface DailyReport {
  id: string;
  unit_id: string;
  unit_name?: string;
  user_id: string;
  report_date: string;
  operational_summary: string;
  obstacles: string;
  area_head_notes?: string;
}

interface PipelineProspek {
  id: string;
  unit_id: string;
  unit_name: string;
  client_name: string;
  segment: string;
  potential_amount: number;
  status: "PROSPEK" | "ANALISIS" | "PENCARIAN_ACC";
  estimated_date: string;
}

const INITIAL_UNITS: Unit[] = Array.from({ length: 17 }, (_, i) => ({
  id: `unit-uuid-${i + 1}`,
  code: `KMU-${(i + 1).toString().padStart(2, "0")}`,
  name: `Kantor Mikro Unit ${(i + 1).toString().padStart(2, "0")}`,
  location: `Kawasan Wilayah Operasional ${(i + 1).toString().padStart(2, "0")}`,
}));

const INITIAL_METRICS: PerformanceMetric[] = INITIAL_UNITS.map((unit, index) => {
  const targetKredit = 1000000000 + index * 100000000;
  const multipliers = [1.05, 0.92, 0.75, 1.12, 0.88, 0.78, 1.01, 0.95, 0.65];
  const mult = multipliers[index % multipliers.length];
  const realisasiKredit = targetKredit * mult;

  const targetFunding = 800000000 + index * 50000000;
  const realisasiFunding = targetFunding * (mult > 0.9 ? 1.02 : 0.85);

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
    npl_percentage: Number((1.5 + (index % 5) * 0.8).toFixed(2)),
  };
});

const INITIAL_REPORTS: DailyReport[] = [
  {
    id: "rep-1",
    unit_id: INITIAL_UNITS[0].id,
    unit_name: INITIAL_UNITS[0].name,
    user_id: "user-1",
    report_date: new Date().toISOString().split("T")[0],
    operational_summary: "Penyaluran Kredit Mikro sektor UMKM Pasar Anyar berjalan lancar. 5 berkas dicairkan.",
    obstacles: "Keterlambatan konfirmasi kelengkapan dokumen jaminan dari nasabah A.N. Budi.",
    area_head_notes: "Segera lakukan pendampingan untuk penyelesaian jaminan minggu ini.",
  },
  {
    id: "rep-2",
    unit_id: INITIAL_UNITS[2].id,
    unit_name: INITIAL_UNITS[2].name,
    user_id: "user-3",
    report_date: new Date().toISOString().split("T")[0],
    operational_summary: "Penagihan intensif debitur menunggak NPL H-3. Terkumpul Rp 45.000.000.",
    obstacles: "Akses lokasi nasabah terkendala banjir lokal.",
    area_head_notes: "",
  },
];

const INITIAL_PIPELINES: PipelineProspek[] = [
  {
    id: "pip-1",
    unit_id: INITIAL_UNITS[0].id,
    unit_name: INITIAL_UNITS[0].name,
    client_name: "CV Berkah Jaya Abadi (H. Ahmad)",
    segment: "Perdagangan Sembako Grosir",
    potential_amount: 850000000,
    status: "PENCARIAN_ACC",
    estimated_date: "2026-08-10",
  },
  {
    id: "pip-2",
    unit_id: INITIAL_UNITS[3].id,
    unit_name: INITIAL_UNITS[3].name,
    client_name: "Koperasi Unit Desa Makmur",
    segment: "Pertanian & Perkebunan",
    potential_amount: 1200000000,
    status: "ANALISIS",
    estimated_date: "2026-08-15",
  },
  {
    id: "pip-3",
    unit_id: INITIAL_UNITS[5].id,
    unit_name: INITIAL_UNITS[5].name,
    client_name: "PT Kuliner Nusantara",
    segment: "Franchise Restoran",
    potential_amount: 600000000,
    status: "PROSPEK",
    estimated_date: "2026-08-20",
  },
];

export default function CommandCenter() {
  const [activeTab, setActiveTab] = useState<TabView>("OVERVIEW");
  const [currentRole, setCurrentRole] = useState<Role>("AREA_HEAD");
  const [selectedUnitId, setSelectedUnitId] = useState<string>(INITIAL_UNITS[0].id);

  const [metrics, setMetrics] = useState<PerformanceMetric[]>(INITIAL_METRICS);
  const [reports, setReports] = useState<DailyReport[]>(INITIAL_REPORTS);
  const [pipelines, setPipelines] = useState<PipelineProspek[]>(INITIAL_PIPELINES);
  const [isConnectedLive, setIsConnectedLive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<"code" | "achievement">("achievement");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [newSummary, setNewSummary] = useState<string>("");
  const [newObstacles, setNewObstacles] = useState<string>("");
  const [selectedReportForNote, setSelectedReportForNote] = useState<DailyReport | null>(null);
  const [areaHeadNoteText, setAreaHeadNoteText] = useState<string>("");

  const [newClientName, setNewClientName] = useState<string>("");
  const [newSegment, setNewSegment] = useState<string>("");
  const [newPotentialAmount, setNewPotentialAmount] = useState<number>(100000000);
  const [newPipelineStatus, setNewPipelineStatus] = useState<"PROSPEK" | "ANALISIS" | "PENCARIAN_ACC">("PROSPEK");

  const [editingMetric, setEditingMetric] = useState<PerformanceMetric | null>(null);

  const fetchLiveData = async () => {
    if (!supabase) return;
    setIsLoading(true);
    try {
      const { data: metricsData, error: metricsError } = await supabase
        .from("performance_metrics")
        .select(`*, units:unit_id (name, code)`);

      if (!metricsError && metricsData && metricsData.length > 0) {
        const formattedMetrics: PerformanceMetric[] = metricsData.map((m: any) => ({
          id: m.id,
          unit_id: m.unit_id,
          unit_name: m.units?.name || "Unit Unknown",
          unit_code: m.units?.code || "KMU-00",
          period_date: m.period_date,
          target_kredit: Number(m.target_kredit),
          realisasi_kredit: Number(m.realisasi_kredit),
          target_funding: Number(m.target_funding),
          realisasi_funding: Number(m.realisasi_funding),
          npl_percentage: Number(m.npl_percentage),
        }));
        setMetrics(formattedMetrics);
        setIsConnectedLive(true);
      }

      const { data: reportsData, error: reportsError } = await supabase
        .from("daily_reports")
        .select(`*, units:unit_id (name), area_head_notes (notes)`)
        .order("created_at", { ascending: false });

      if (!reportsError && reportsData && reportsData.length > 0) {
        const formattedReports: DailyReport[] = reportsData.map((r: any) => ({
          id: r.id,
          unit_id: r.unit_id,
          unit_name: r.units?.name || "Unit Unknown",
          user_id: r.user_id,
          report_date: r.report_date,
          operational_summary: r.operational_summary,
          obstacles: r.obstacles || "-",
          area_head_notes: r.area_head_notes?.[0]?.notes || "",
        }));
        setReports(formattedReports);
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

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 100) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          🟢 Hijau (&ge;100%)
        </span>
      );
    }
    if (percentage >= 80) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          🟡 Kuning (80-99%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        🔴 Merah (&lt;80%)
      </span>
    );
  };

  const totalTargetKredit = metrics.reduce((acc, m) => acc + m.target_kredit, 0);
  const totalRealisasiKredit = metrics.reduce((acc, m) => acc + m.realisasi_kredit, 0);
  const regionalKreditAchievement = getAchievement(totalRealisasiKredit, totalTargetKredit);

  const totalTargetFunding = metrics.reduce((acc, m) => acc + m.target_funding, 0);
  const totalRealisasiFunding = metrics.reduce((acc, m) => acc + m.realisasi_funding, 0);
  const regionalFundingAchievement = getAchievement(totalRealisasiFunding, totalTargetFunding);

  const avgNPL = metrics.length > 0 ? metrics.reduce((acc, m) => acc + m.npl_percentage, 0) / metrics.length : 0;
  const nplHighRiskUnits = metrics.filter((m) => m.npl_percentage >= 3.0);

  const filteredMetrics = metrics
    .filter(
      (m) =>
        (m.unit_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.unit_code || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === "code") {
        return sortOrder === "asc"
          ? (a.unit_code || "").localeCompare(b.unit_code || "")
          : (b.unit_code || "").localeCompare(a.unit_code || "");
      } else {
        const achA = getAchievement(a.realisasi_kredit, a.target_kredit);
        const achB = getAchievement(b.realisasi_kredit, b.target_kredit);
        return sortOrder === "asc" ? achA - achB : achB - achA;
      }
    });

  const handleSaveMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMetric) return;

    if (supabase) {
      const { error } = await supabase.from("performance_metrics").upsert([
        {
          id: editingMetric.id.startsWith("metric-uuid") ? undefined : editingMetric.id,
          unit_id: editingMetric.unit_id,
          period_date: editingMetric.period_date,
          target_kredit: editingMetric.target_kredit,
          realisasi_kredit: editingMetric.realisasi_kredit,
          target_funding: editingMetric.target_funding,
          realisasi_funding: editingMetric.realisasi_funding,
          npl_percentage: editingMetric.npl_percentage,
          updated_at: new Date().toISOString(),
        },
      ]);

      if (!error) fetchLiveData();
    } else {
      setMetrics((prev) =>
        prev.map((m) => (m.unit_id === editingMetric.unit_id ? editingMetric : m))
      );
    }
    setEditingMetric(null);
  };

  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSummary.trim()) return;

    const targetUnit = INITIAL_UNITS.find((u) => u.id === selectedUnitId);
    const newReport: DailyReport = {
      id: `rep-${Date.now()}`,
      unit_id: selectedUnitId,
      unit_name: targetUnit?.name || "Kantor Mikro",
      user_id: "user-curr",
      report_date: new Date().toISOString().split("T")[0],
      operational_summary: newSummary,
      obstacles: newObstacles || "Tidak ada kendala utama.",
      area_head_notes: "",
    };

    if (supabase) {
      await supabase.from("daily_reports").insert([
        {
          unit_id: selectedUnitId,
          user_id: "00000000-0000-0000-0000-000000000000",
          operational_summary: newSummary,
          obstacles: newObstacles,
        },
      ]);
      fetchLiveData();
    } else {
      setReports([newReport, ...reports]);
    }

    setNewSummary("");
    setNewObstacles("");
  };

  const handleSaveAreaHeadNote = async () => {
    if (!selectedReportForNote || !areaHeadNoteText.trim()) return;

    if (supabase) {
      await supabase.from("area_head_notes").upsert([
        {
          daily_report_id: selectedReportForNote.id,
          area_head_id: "00000000-0000-0000-0000-000000000000",
          notes: areaHeadNoteText,
        },
      ]);
      fetchLiveData();
    } else {
      setReports((prev) =>
        prev.map((r) =>
          r.id === selectedReportForNote.id
            ? { ...r, area_head_notes: areaHeadNoteText }
            : r
        )
      );
    }

    setSelectedReportForNote(null);
    setAreaHeadNoteText("");
  };

  const handleAddPipeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const targetUnit = INITIAL_UNITS.find((u) => u.id === selectedUnitId) || INITIAL_UNITS[0];
    const createdPipeline: PipelineProspek = {
      id: `pip-${Date.now()}`,
      unit_id: targetUnit.id,
      unit_name: targetUnit.name,
      client_name: newClientName,
      segment: newSegment || "Mikro Komersial",
      potential_amount: newPotentialAmount,
      status: newPipelineStatus,
      estimated_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    };

    setPipelines([createdPipeline, ...pipelines]);
    setNewClientName("");
    setNewSegment("");
    setNewPotentialAmount(100000000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans pb-16">
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#0F172A] text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-600 rounded-lg text-white font-bold text-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none text-white">
                Micro-Unit Area Command Center
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring 17 Kantor Mikro Perbankan Regional
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 border border-slate-700">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>Status API:</span>
              {isConnectedLive ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live Supabase
                </span>
              ) : (
                <span className="text-amber-400 font-semibold">Local Fallback</span>
              )}
            </div>

            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400 px-2 font-medium flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-300" /> Role:
              </span>
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as Role)}
                className="bg-[#0F172A] text-white text-xs font-semibold rounded px-2 py-1 outline-none border border-slate-600 focus:border-emerald-500 cursor-pointer"
              >
                <option value="AREA_HEAD">Area Head (Supervisi & Monitoring 17 Unit)</option>
                <option value="KEPALA_UNIT">Kepala Unit (Input Target & Laporan)</option>
                <option value="SUPER_ADMIN">Super Admin (IT Master)</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* MODULAR NAVIGATION TABS */}
      <div className="bg-[#0F172A] border-t border-slate-800 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("OVERVIEW")}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "OVERVIEW"
                ? "border-emerald-400 text-emerald-400 bg-slate-800/50"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            1. Executive Overview & Matriks 17 Unit
          </button>

          <button
            onClick={() => setActiveTab("PIPELINE_REPORTS")}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "PIPELINE_REPORTS"
                ? "border-emerald-400 text-emerald-400 bg-slate-800/50"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Target className="w-4 h-4" />
            2. Digital Pipeline Prospek & Laporan Harian
          </button>

          <button
            onClick={() => setActiveTab("EARLY_WARNING")}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "EARLY_WARNING"
                ? "border-rose-500 text-rose-400 bg-slate-800/50"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            3. Early Warning & NPL Watchlist ({nplHighRiskUnits.length})
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* ========================================================== */}
        {/* TAB 1: EXECUTIVE REGIONAL KPI OVERVIEW & UNIT MATRIX       */}
        {/* ========================================================== */}
        {activeTab === "OVERVIEW" && (
          <>
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Executive Regional Overview
                  </h2>
                  <p className="text-sm text-slate-500">
                    Agregat Performa 17 Kantor Mikro Periode Berjalan
                  </p>
                </div>
                <button
                  onClick={fetchLiveData}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
                  Refresh Data
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* KPI 1: OUTSTANDING KREDIT */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Total Outstanding Kredit
                    </span>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-slate-900">
                      {formatRupiah(totalRealisasiKredit)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Target: <span className="font-semibold text-slate-700">{formatRupiah(totalTargetKredit)}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Pencapaian Regional</span>
                      <span className={regionalKreditAchievement >= 100 ? "text-emerald-600" : "text-amber-600"}>
                        {regionalKreditAchievement.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          regionalKreditAchievement >= 100 ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${Math.min(regionalKreditAchievement, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* KPI 2: TOTAL FUNDING (DPK) */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Total DPK / Funding
                    </span>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-slate-900">
                      {formatRupiah(totalRealisasiFunding)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Target: <span className="font-semibold text-slate-700">{formatRupiah(totalTargetFunding)}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Pencapaian Regional</span>
                      <span className={regionalFundingAchievement >= 100 ? "text-emerald-600" : "text-amber-600"}>
                        {regionalFundingAchievement.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          regionalFundingAchievement >= 100 ? "bg-emerald-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${Math.min(regionalFundingAchievement, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* KPI 3: RATA-RATA NPL REGIONAL */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Rata-Rata NPL Regional
                    </span>
                    <div className={`p-2 rounded-lg ${avgNPL <= 3 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className={`text-2xl font-black ${avgNPL <= 3 ? "text-emerald-600" : "text-rose-600"}`}>
                      {avgNPL.toFixed(2)}%
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Maksimum Toleransi Batas Aman: <span className="font-semibold text-slate-700">3.00%</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Kualitas Kredit Regional:</span>
                    <span className={`font-semibold ${avgNPL <= 3 ? "text-emerald-600" : "text-rose-600"}`}>
                      {avgNPL <= 3 ? "SEHAT / UNDER CONTROL" : "PERLU ATENSI KETAT"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Matriks Kinerja 17 Kantor Mikro
                  </h3>
                  <p className="text-xs text-slate-500">
                    Komparasi realisasi target kredit, DPK, dan persentase NPL per unit
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari Kantor Mikro..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-slate-800 transition-all w-48 md:w-64"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (sortField === "achievement") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("achievement");
                        setSortOrder("desc");
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                    Urutkan ({sortOrder === "desc" ? "Tertinggi" : "Terendah"})
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-[#0F172A] text-white uppercase text-[11px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Kode & Nama Unit</th>
                      <th className="py-3 px-4 text-right">Target Kredit</th>
                      <th className="py-3 px-4 text-right">Realisasi Kredit</th>
                      <th className="py-3 px-4 text-center">% Pencapaian</th>
                      <th className="py-3 px-4 text-right">Realisasi DPK</th>
                      <th className="py-3 px-4 text-center">NPL %</th>
                      <th className="py-3 px-4 text-center">Status Performansi</th>
                      {(currentRole === "AREA_HEAD" || currentRole === "SUPER_ADMIN") && (
                        <th className="py-3 px-4 text-center">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredMetrics.map((m, idx) => {
                      const ach = getAchievement(m.realisasi_kredit, m.target_kredit);
                      return (
                        <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-mono font-bold">
                                {idx + 1}
                              </span>
                              <div>
                                <div className="font-bold">{m.unit_name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{m.unit_code}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-600">
                            {formatRupiah(m.target_kredit)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            {formatRupiah(m.realisasi_kredit)}
                          </td>
                          <td className="py-3 px-4 text-center font-bold">
                            <span className={ach >= 100 ? "text-emerald-600" : ach >= 80 ? "text-amber-600" : "text-rose-600"}>
                              {ach.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-600">
                            {formatRupiah(m.realisasi_funding)}
                          </td>
                          <td className="py-3 px-4 text-center font-bold">
                            <span className={m.npl_percentage <= 3 ? "text-slate-700" : "text-rose-600"}>
                              {m.npl_percentage.toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getStatusBadge(ach)}
                          </td>
                          {(currentRole === "AREA_HEAD" || currentRole === "SUPER_ADMIN") && (
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => setEditingMetric({ ...m })}
                                className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all cursor-pointer"
                                title="Edit Target & Realisasi"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* ========================================================== */}
        {/* TAB 2: DIGITAL TARGET & PIPELINE + DAILY REPORTING SYSTEM  */}
        {/* ========================================================== */}
        {activeTab === "PIPELINE_REPORTS" && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-600" />
                    Digital Pipeline & Prospek Nasabah Besar
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pencatatan calon debitur potensial yang sedang digarap oleh Kepala Unit
                  </p>
                </div>

                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold w-fit">
                  Total Pipeline: {formatRupiah(pipelines.reduce((acc, p) => acc + p.potential_amount, 0))}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                    + Input Prospek Nasabah Baru
                  </h4>

                  <form onSubmit={handleAddPipeline} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Pilih Unit Mikro</label>
                      <select
                        value={selectedUnitId}
                        onChange={(e) => setSelectedUnitId(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
                      >
                        {INITIAL_UNITS.map((u) => (
                          <option key={u.id} value={u.id}>{u.code} - {u.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Nama Calon Debitur / Usaha</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Toko Kelontong H. Samsul"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Sektor / Segmen Usaha</label>
                      <input
                        type="text"
                        placeholder="Contoh: Perdagangan Bahan Bangunan"
                        value={newSegment}
                        onChange={(e) => setNewSegment(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Potensi Plafond Kredit (Rp)</label>
                      <input
                        type="number"
                        required
                        step={50000000}
                        value={newPotentialAmount}
                        onChange={(e) => setNewPotentialAmount(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Tahap Progress Pipeline</label>
                      <select
                        value={newPipelineStatus}
                        onChange={(e) => setNewPipelineStatus(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
                      >
                        <option value="PROSPEK">1. Inisiasi Prospek</option>
                        <option value="ANALISIS">2. Analisis & Survey Lapangan</option>
                        <option value="PENCARIAN_ACC">3. Persetujuan Komite & Pencairan</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Simpan Prospek Pipeline
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-8 overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-[#0F172A] text-white uppercase font-bold text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-3">Unit Mikro</th>
                        <th className="py-3 px-3">Nama Nasabah & Segmen</th>
                        <th className="py-3 px-3">Potensi Plafond</th>
                        <th className="py-3 px-3">Tahap Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {pipelines.map((pip) => (
                        <tr key={pip.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-800">{pip.unit_name}</td>
                          <td className="py-3 px-3">
                            <span className="font-extrabold text-slate-900 block">{pip.client_name}</span>
                            <span className="text-[10px] text-slate-400">{pip.segment}</span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                            {formatRupiah(pip.potential_amount)}
                          </td>
                          <td className="py-3 px-3">
                            {pip.status === "PENCARIAN_ACC" && (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                🟢 ACC & Pencairan
                              </span>
                            )}
                            {pip.status === "ANALISIS" && (
                              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                                🟡 Analisis Komite
                              </span>
                            )}
                            {pip.status === "PROSPEK" && (
                              <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                                🔵 Initial Prospect
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-slate-900">Form Laporan Harian Operasional</h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-semibold">
                    Khusus Kepala Unit
                  </span>
                </div>

                {currentRole === "KEPALA_UNIT" || currentRole === "SUPER_ADMIN" ? (
                  <form onSubmit={handleAddReport} className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pilih Kantor Mikro
                      </label>
                      <select
                        value={selectedUnitId}
                        onChange={(e) => setSelectedUnitId(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-slate-800 font-medium"
                      >
                        {INITIAL_UNITS.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.code} — {u.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Ringkasan Operasional Hari Ini
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Contoh: Penyaluran kredit mikro sektor perdagangan lancar, 3 aplikasi disetujui..."
                        value={newSummary}
                        onChange={(e) => setNewSummary(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-slate-800 font-medium"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Kendala / Hambatan Lapangan (Opsional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Contoh: Terkendala dokumen jaminan belum lengkap..."
                        value={newObstacles}
                        onChange={(e) => setNewObstacles(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-slate-800 font-medium"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Kirim Laporan Harian
                    </button>
                  </form>
                ) : (
                  <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center space-y-2">
                    <Lock className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-600 font-medium">
                      Mode Penginputan Terkunci.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Ubah simulasi role di kanan atas ke <b>Kepala Unit</b> untuk mencoba form input.
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-slate-900">Umpan Balik & Catatan Area Head</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {reports.length} Laporan Masuk
                  </span>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {reports.map((rep) => (
                    <div key={rep.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{rep.unit_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{rep.report_date}</span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        <strong className="text-slate-900">Ringkasan:</strong> {rep.operational_summary}
                      </p>

                      {rep.obstacles && (
                        <p className="text-xs text-amber-800 bg-amber-50/80 p-2 rounded border border-amber-100">
                          <strong>Kendala:</strong> {rep.obstacles}
                        </p>
                      )}

                      {rep.area_head_notes ? (
                        <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-lg text-xs text-blue-900 mt-2">
                          <div className="font-bold flex items-center gap-1 text-[11px] text-blue-700">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" /> Instruksi Direct Area Head:
                          </div>
                          <p className="mt-0.5 italic">"{rep.area_head_notes}"</p>
                        </div>
                      ) : (
                        (currentRole === "AREA_HEAD" || currentRole === "SUPER_ADMIN") && (
                          <button
                            onClick={() => {
                              setSelectedReportForNote(rep);
                              setAreaHeadNoteText("");
                            }}
                            className="mt-2 text-[11px] font-bold text-blue-600 hover:text-blue-800 underline flex items-center gap-1 cursor-pointer"
                          >
                            + Tambah Catatan Supervisi Area Head
                          </button>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 3: EARLY WARNING INDICATOR & NPL WATCHLIST            */}
        {/* ========================================================== */}
        {activeTab === "EARLY_WARNING" && (
          <div className="space-y-6">
            <div className="bg-rose-50 border border-rose-200 p-6 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-600 text-white rounded-xl shadow-md">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    Early Warning System: NPL & Risk Watchlist
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Deteksi otomatis unit mikro dengan rasio NPL melebihi batas aman (&ge; 3.00%)
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-rose-600 block">
                  {nplHighRiskUnits.length} / 17 Unit
                </span>
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                  Membutuhkan Intervensi
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {nplHighRiskUnits.map((unitMetrics) => (
                <div key={unitMetrics.id} className="bg-white p-5 rounded-xl border border-rose-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold block">
                        {unitMetrics.unit_code}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {unitMetrics.unit_name}
                      </h4>
                    </div>

                    <span className="px-3 py-1 bg-rose-100 border border-rose-300 text-rose-800 rounded-full font-black text-xs">
                      NPL {unitMetrics.npl_percentage.toFixed(2)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Realisasi Kredit</span>
                      <span className="font-mono font-bold text-slate-900">{formatRupiah(unitMetrics.realisasi_kredit)}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Target Kredit</span>
                      <span className="font-mono font-bold text-slate-900">{formatRupiah(unitMetrics.target_kredit)}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
                    <strong className="text-amber-900 font-bold block">Action Plan / Langkah Mitigasi:</strong>
                    <p className="text-amber-800">
                      Wajibkan penagihan harian H-3, pending pencairan kredit risiko sedang, serta jadwalkan evaluasi khusus bersama Area Head.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* MODAL EDIT TARGET & REALISASI METRICS */}
      { font-medium}
      {editingMetric && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Update Target & Realisasi Unit
                </h4>
                <p className="text-xs text-slate-500">
                  {editingMetric.unit_code} — {editingMetric.unit_name}
                </p>
              </div>
              <button
                onClick={() => setEditingMetric(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMetric} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Target Kredit (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingMetric.target_kredit}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        target_kredit: Number(e.target.value),
                      })
                    }
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none focus:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Realisasi Kredit (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingMetric.realisasi_kredit}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        realisasi_kredit: Number(e.target.value),
                      })
                    }
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Target DPK / Funding (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingMetric.target_funding}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        target_funding: Number(e.target.value),
                      })
                    }
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none focus:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Realisasi DPK (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingMetric.realisasi_funding}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        realisasi_funding: Number(e.target.value),
                      })
                    }
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  NPL Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editingMetric.npl_percentage}
                  onChange={(e) =>
                    setEditingMetric({
                      ...editingMetric,
                      npl_percentage: Number(e.target.value),
                    })
                  }
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMetric(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Simpan Perubahan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL / DRAWER CATATAN AREA HEAD */}
      {}
      {selectedReportForNote && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900">
              Instruksi Supervisi untuk {selectedReportForNote.unit_name}
            </h4>
            <textarea
              rows={4}
              placeholder="Tuliskan catatan arahan, feedback, atau instruksi perbaikan..."
              value={areaHeadNoteText}
              onChange={(e) => setAreaHeadNoteText(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-slate-800 font-medium"
            ></textarea>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedReportForNote(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveAreaHeadNote}
                className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm cursor-pointer"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}