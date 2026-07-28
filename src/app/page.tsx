"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
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
  HelpCircle,
  Calculator,
  Percent,
  FileSpreadsheet,
  Trash2
} from "lucide-react";

export type Role = "SUPER_ADMIN" | "AREA_HEAD" | "KEPALA_UNIT";
export type PerformanceStatus = "GREEN" | "YELLOW" | "RED" | "EXCELLENT" | "ON TARGET" | "WARNING" | "CRITICAL" | string;
export type ReportStatus = "PENDING" | "APPROVED" | "REVISION" | "SUBMITTED" | "REVIEWED";
export type NotificationType = "WARNING" | "INFO" | "SUCCESS";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  unitCode?: string;
  unit_id?: string;
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
  unit_id?: string;
  title: string;
  message: string;
  timestamp: string;
  type: NotificationType;
  isRead: boolean;
}

export interface EditableGridRow {
  id: string;
  unit_code: string;
  unit_name: string;
  target_kredit: number;
  realisasi_kredit: number;
  target_funding: number;
  realisasi_funding: number;
  realisasi_collection: number;
  npl_percentage: number;
  dkp_percentage: number;
  ao_count: number;
  total_customers: number;
  last_update: string;
  isModified?: boolean;
}

const DEFAULT_UNITS: UnitDetail[] = [
  { id: "u-1", code: "KMU-01", name: "Kantor Mikro Unit Sukamaju", location: "Sukamaju", headName: "Ahmad Fauzi, S.E.", aoCount: 4, staffCount: 6, totalCustomers: 520, region: "Regional 1" },
  { id: "u-2", code: "KMU-02", name: "Kantor Mikro Unit Pasar Anyar", location: "Pasar Anyar", headName: "Budi Hermawan", aoCount: 5, staffCount: 7, totalCustomers: 610, region: "Regional 1" },
  { id: "u-3", code: "KMU-03", name: "Kantor Mikro Unit Batu Tulis", location: "Batu Tulis", headName: "Citra Lestari, M.M.", aoCount: 3, staffCount: 5, totalCustomers: 480, region: "Regional 1" },
  { id: "u-4", code: "KMU-04", name: "Kantor Mikro Unit Cibinong", location: "Cibinong", headName: "Dedi Mulyadi", aoCount: 6, staffCount: 8, totalCustomers: 750, region: "Regional 1" },
  { id: "u-5", code: "KMU-05", name: "Kantor Mikro Unit Ciawi", location: "Ciawi", headName: "Eka Putri, S.E.", aoCount: 4, staffCount: 6, totalCustomers: 540, region: "Regional 1" },
  { id: "u-6", code: "KMU-06", name: "Kantor Mikro Unit Parung", location: "Parung", headName: "Fajar Nugraha", aoCount: 4, staffCount: 5, totalCustomers: 490, region: "Regional 1" },
  { id: "u-7", code: "KMU-07", name: "Kantor Mikro Unit Leuwiliang", location: "Leuwiliang", headName: "Gita Gutawa, M.B.A.", aoCount: 3, staffCount: 6, totalCustomers: 510, region: "Regional 1" },
  { id: "u-8", code: "KMU-08", name: "Kantor Mikro Unit Cisarua", location: "Cisarua", headName: "Hendra Setiawan", aoCount: 4, staffCount: 6, totalCustomers: 530, region: "Regional 1" },
  { id: "u-9", code: "KMU-09", name: "Kantor Mikro Unit Gunung Putri", location: "Gunung Putri", headName: "Irfan Bachdim", aoCount: 5, staffCount: 7, totalCustomers: 680, region: "Regional 1" },
  { id: "u-10", code: "KMU-10", name: "Kantor Mikro Unit Citeureup", location: "Citeureup", headName: "Joko Widodo", aoCount: 4, staffCount: 6, totalCustomers: 560, region: "Regional 1" },
  { id: "u-11", code: "KMU-11", name: "Kantor Mikro Unit Jasinga", location: "Jasinga", headName: "Kurnia Meiga", aoCount: 3, staffCount: 5, totalCustomers: 420, region: "Regional 1" },
  { id: "u-12", code: "KMU-12", name: "Kantor Mikro Unit Ciampea", location: "Ciampea", headName: "Lukman Sardi", aoCount: 4, staffCount: 6, totalCustomers: 500, region: "Regional 1" },
  { id: "u-13", code: "KMU-13", name: "Kantor Mikro Unit Ciseeng", location: "Ciseeng", headName: "Maya Ahmad", aoCount: 4, staffCount: 5, totalCustomers: 470, region: "Regional 1" },
  { id: "u-14", code: "KMU-14", name: "Kantor Mikro Unit Klapanunggal", location: "Klapanunggal", headName: "Nabila Syakieb", aoCount: 4, staffCount: 6, totalCustomers: 550, region: "Regional 1" },
  { id: "u-15", code: "KMU-15", name: "Kantor Mikro Unit Dramaga", location: "Dramaga", headName: "Oki Setiana", aoCount: 5, staffCount: 7, totalCustomers: 630, region: "Regional 1" },
  { id: "u-16", code: "KMU-16", name: "Kantor Mikro Unit Rumpin", location: "Rumpin", headName: "Prabowo Subianto", aoCount: 3, staffCount: 5, totalCustomers: 410, region: "Regional 1" },
  { id: "u-17", code: "KMU-17", name: "Kantor Mikro Unit Tanjungsari", location: "Tanjungsari", headName: "Qory Sandioriva", aoCount: 4, staffCount: 6, totalCustomers: 490, region: "Regional 1" },
];

const DEFAULT_METRICS: PerformanceMetric[] = DEFAULT_UNITS.map((unit, index) => {
  const baseTarget = 1500000000 + (index % 5) * 250000000;
  const baseRealisasi = baseTarget * (0.75 + ((index * 7) % 35) / 100);
  const baseFundingTarget = 1000000000 + (index % 4) * 200000000;
  const baseFundingReal = baseFundingTarget * (0.8 + ((index * 3) % 25) / 100);
  const npl = Number((1.2 + ((index * 13) % 35) / 10).toFixed(2));
  const dkp = Number((1.8 + ((index * 17) % 40) / 10).toFixed(2));

  return {
    id: `m-${unit.code}`,
    unit_id: unit.id,
    unit_code: unit.code,
    unit_name: unit.name,
    period_date: new Date().toISOString().split("T")[0],
    target_kredit: baseTarget,
    realisasi_kredit: Math.round(baseRealisasi),
    target_funding: baseFundingTarget,
    realisasi_funding: Math.round(baseFundingReal),
    target_collection: 95.0,
    realisasi_collection: 92.5 + (index % 5),
    npl_percentage: npl,
    dkp_percentage: dkp,
    profit: Math.round(baseRealisasi * 0.06 - baseTarget * 0.01),
    last_update: "Hari ini, 09:30 WIB",
    submitted_today: index % 2 === 0,
    status: npl > 3.0 ? "RED" : npl > 2.0 ? "YELLOW" : "GREEN"
  };
});

const DEFAULT_REPORTS: DailyReport[] = [
  {
    id: "rep-01",
    unit_id: "u-1",
    unit_code: "KMU-01",
    unit_name: "Kantor Mikro Unit Sukamaju",
    report_type: "HARIAN",
    report_date: new Date().toISOString().split("T")[0],
    operational_summary: "Penagihan angsuran Kol 2 berhasil terealisasi Rp 45.000.000 dari 3 debitur pasar.",
    obstacles: "Cuaca hujan deras sore hari sedikit menghambat kunker AO ke lokasi agunan.",
    status: "PENDING"
  },
  {
    id: "rep-02",
    unit_id: "u-4",
    unit_code: "KMU-04",
    unit_name: "Kantor Mikro Unit Cibinong",
    report_type: "HARIAN",
    report_date: new Date().toISOString().split("T")[0],
    operational_summary: "Pencairan kredit mikro sektor perdagangan sembako sebesar Rp 120.000.000 (2 berkas).",
    obstacles: "Persyaratan kelengkapan SIUP pedagang pasar membutuhkan pendampingan.",
    status: "APPROVED",
    area_head_notes: "Bagus, pertahankan kecepatan verifikasi agunan."
  }
];

const DEFAULT_BROADCASTS: BroadcastMessage[] = [
  {
    id: "bc-1",
    title: "📢 INSTRUKSI PERCEPATAN PENAGIHAN AKHIR BULAN",
    content: "Kepada seluruh Kepala Unit (KMU-01 s.d KMU-17), tingkatkan intensitas penagihan kredit Kol 2 (DKP) sebelum penutupan pembukuan. Target Collection Rate Area Regional min 95%.",
    date: "28 Juli 2026",
    sender: "Drs. Bambang Hermawan (Area Head)",
    readBy: ["KMU-01", "KMU-04"]
  }
];

const DEFAULT_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif-1",
    title: "Peringatan NPL Tinggi",
    message: "KMU-09 Gunung Putri mencatatkan NPL sebesar 4.20% (Melebihi ambang batas 3.00%).",
    timestamp: "10 menit yang lalu",
    type: "WARNING",
    isRead: false
  },
  {
    id: "notif-2",
    title: "Pengajuan Worksheet Baru",
    message: "KMU-01 Sukamaju telah memperbarui data pencairan kredit harian.",
    timestamp: "25 menit yang lalu",
    type: "INFO",
    isRead: false
  }
];

interface WorksheetGridProps {
  initialMetrics: PerformanceMetric[];
  units: UnitDetail[];
  activeUnitScope: string;
  isHeadArea: boolean;
  onSaveWorksheet: (updatedMetrics: PerformanceMetric[]) => Promise<void> | void;
  isConnectedLive?: boolean;
}

function WorksheetGrid({
  initialMetrics,
  units,
  activeUnitScope,
  isHeadArea,
  onSaveWorksheet,
  isConnectedLive = false
}: WorksheetGridProps) {
  const [gridData, setGridRowData] = useState<EditableGridRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  useEffect(() => {
    const formattedRows: EditableGridRow[] = initialMetrics.map((m) => {
      const matchedUnit = units.find((u) => u.code === m.unit_code || u.id === m.unit_id);
      return {
        id: m.id || `grid-row-${Math.random()}`,
        unit_code: m.unit_code || matchedUnit?.code || "KMU-00",
        unit_name: m.unit_name || matchedUnit?.name || "Kantor Mikro Unit",
        target_kredit: m.target_kredit || 0,
        realisasi_kredit: m.realisasi_kredit || 0,
        target_funding: m.target_funding || 0,
        realisasi_funding: m.realisasi_funding || 0,
        realisasi_collection: m.realisasi_collection || 95,
        npl_percentage: m.npl_percentage || 0,
        dkp_percentage: m.dkp_percentage || 0,
        ao_count: matchedUnit?.aoCount || 4,
        total_customers: matchedUnit?.totalCustomers || 500,
        last_update: m.last_update || "Hari ini",
        isModified: false
      };
    });
    setGridRowData(formattedRows);
  }, [initialMetrics, units]);

  const handleCellChange = (
    id: string,
    field: keyof EditableGridRow,
    value: string | number
  ) => {
    setGridRowData((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          const numValue = typeof value === "number" ? value : parseFloat(value) || 0;
          return {
            ...row,
            [field]: typeof row[field] === "number" ? numValue : value,
            isModified: true
          };
        }
        return row;
      })
    );
  };

  const handleAddRow = () => {
    const newIndex = gridData.length + 1;
    const newCode = `KMU-${newIndex.toString().padStart(2, "0")}`;
    const newRow: EditableGridRow = {
      id: `new-row-${Date.now()}`,
      unit_code: newCode,
      unit_name: `Kantor Mikro Unit Baru ${newIndex}`,
      target_kredit: 1000000000,
      realisasi_kredit: 0,
      target_funding: 800000000,
      realisasi_funding: 0,
      realisasi_collection: 95.0,
      npl_percentage: 1.5,
      dkp_percentage: 2.0,
      ao_count: 4,
      total_customers: 300,
      last_update: "Baru ditambahkan",
      isModified: true
    };
    setGridRowData([...gridData, newRow]);
  };

  const handleDeleteRow = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus baris unit ini dari worksheet?")) {
      setGridRowData((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const calculateAch = (realization: number, target: number) => {
    if (!target || target === 0) return 0;
    return (realization / target) * 100;
  };

  const getKpiBadge = (achKredit: number, npl: number) => {
    if (achKredit >= 100 && npl <= 3.0) {
      return { label: "EXCELLENT", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    } else if (achKredit >= 80 && npl <= 4.5) {
      return { label: "ON TARGET", bg: "bg-blue-100 text-blue-800 border-blue-300" };
    } else if (achKredit >= 60 || npl <= 5.0) {
      return { label: "WARNING", bg: "bg-amber-100 text-amber-800 border-amber-300" };
    } else {
      return { label: "CRITICAL", bg: "bg-rose-100 text-rose-800 border-rose-300" };
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);

  const displayedRows = useMemo(() => {
    return gridData.filter((row) => {
      const matchSearch =
        row.unit_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        row.unit_code.toLowerCase().includes(searchFilter.toLowerCase());

      if (!isHeadArea) {
        return matchSearch && row.unit_code === activeUnitScope;
      }
      return matchSearch;
    });
  }, [gridData, searchFilter, isHeadArea, activeUnitScope]);

  const totals = useMemo(() => {
    const sumTargetKredit = displayedRows.reduce((a, b) => a + b.target_kredit, 0);
    const sumRealisasiKredit = displayedRows.reduce((a, b) => a + b.realisasi_kredit, 0);
    const sumTargetFunding = displayedRows.reduce((a, b) => a + b.target_funding, 0);
    const sumRealisasiFunding = displayedRows.reduce((a, b) => a + b.realisasi_funding, 0);
    const avgNpl =
      displayedRows.length > 0
        ? displayedRows.reduce((a, b) => a + b.npl_percentage, 0) / displayedRows.length
        : 0;
    const avgDkp =
      displayedRows.length > 0
        ? displayedRows.reduce((a, b) => a + b.dkp_percentage, 0) / displayedRows.length
        : 0;
    const avgCollection =
      displayedRows.length > 0
        ? displayedRows.reduce((a, b) => a + b.realisasi_collection, 0) / displayedRows.length
        : 0;

    return {
      sumTargetKredit,
      sumRealisasiKredit,
      achKredit: calculateAch(sumRealisasiKredit, sumTargetKredit),
      sumTargetFunding,
      sumRealisasiFunding,
      achFunding: calculateAch(sumRealisasiFunding, sumTargetFunding),
      avgNpl,
      avgDkp,
      avgCollection
    };
  }, [displayedRows]);

  const handleBatchSave = async () => {
    setIsSaving(true);
    setSaveSuccessMsg("");

    try {
      const updatedMetrics: PerformanceMetric[] = gridData.map((row) => ({
        id: row.id,
        unit_id: row.id,
        unit_code: row.unit_code,
        unit_name: row.unit_name,
        period_date: new Date().toISOString().split("T")[0],
        target_kredit: row.target_kredit,
        realisasi_kredit: row.realisasi_kredit,
        target_funding: row.target_funding,
        realisasi_funding: row.realisasi_funding,
        target_collection: 95,
        realisasi_collection: row.realisasi_collection,
        npl_percentage: row.npl_percentage,
        dkp_percentage: row.dkp_percentage,
        profit: row.realisasi_kredit * 0.08 - row.target_kredit * 0.02,
        last_update: "Baru saja disimpan",
        submitted_today: true
      }));

      await onSaveWorksheet(updatedMetrics);

      setGridRowData((prev) => prev.map((r) => ({ ...r, isModified: false })));
      setSaveSuccessMsg("✓ Seluruh data worksheet berhasil disimpan dan disinkronkan!");
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Kode Unit",
      "Nama Unit",
      "Target Kredit (Rp)",
      "Realisasi Kredit (Rp)",
      "% Ach Kredit",
      "Target DPK (Rp)",
      "Realisasi DPK (Rp)",
      "% Ach DPK",
      "Collection Rate (%)",
      "NPL (%)",
      "DKP / Kol 2 (%)",
      "Jumlah AO",
      "Total Debitur"
    ];

    const rows = displayedRows.map((r) => [
      r.unit_code,
      `"${r.unit_name}"`,
      r.target_kredit,
      r.realisasi_kredit,
      calculateAch(r.realisasi_kredit, r.target_kredit).toFixed(2),
      r.target_funding,
      r.realisasi_funding,
      calculateAch(r.realisasi_funding, r.target_funding).toFixed(2),
      r.realisasi_collection,
      r.npl_percentage,
      r.dkp_percentage,
      r.ao_count,
      r.total_customers
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Worksheet_Target_Mikro_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden space-y-0">
      {/* Worksheet Header */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-600 rounded-xl text-white font-bold shadow-lg shadow-emerald-950">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EXCEL INTERACTIVE WORKSHEET GRID</span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-white mt-0.5">
              Lembar Kerja Pencapaian Target {isHeadArea ? "(17 Unit Mikro Regional)" : `— ${activeUnitScope}`}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Ketik langsung nilai target & realisasi pada sel tabel. Data otomatis terkalkulasi.
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {isHeadArea && (
            <button
              onClick={handleAddRow}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Tambah Baris Unit</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleBatchSave}
            disabled={isSaving}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40 disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Simpan & Sync Sheet</span>
          </button>
        </div>
      </div>

      {/* Table Filter & Success Toast */}
      <div className="bg-slate-100 p-3 px-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari kode / nama unit..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>
          <span className="text-[11px] font-mono text-slate-500 font-bold shrink-0">
            {displayedRows.length} Baris Tampil
          </span>
        </div>

        {saveSuccessMsg && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold rounded-lg animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Main Interactive Excel Table Grid */}
      <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead className="bg-[#0F172A] text-slate-200 uppercase text-[10px] font-mono tracking-wider sticky top-0 z-20 shadow-md">
            <tr>
              <th className="p-3 border-r border-slate-700 w-10 text-center">#</th>
              <th className="p-3 border-r border-slate-700 min-w-[90px]">Kode</th>
              <th className="p-3 border-r border-slate-700 min-w-[180px]">Nama Kantor Unit</th>
              <th className="p-3 border-r border-slate-700 min-w-[150px] text-right bg-emerald-950/60 text-emerald-300">
                Target Kredit (Rp)
              </th>
              <th className="p-3 border-r border-slate-700 min-w-[150px] text-right bg-emerald-950/60 text-emerald-300">
                Realisasi Kredit (Rp)
              </th>
              <th className="p-3 border-r border-slate-700 min-w-[90px] text-center bg-emerald-900/80 text-white font-bold">
                % Ach
              </th>
              <th className="p-3 border-r border-slate-700 min-w-[140px] text-right bg-blue-950/60 text-blue-300">
                Target DPK (Rp)
              </th>
              <th className="p-3 border-r border-slate-700 min-w-[140px] text-right bg-blue-950/60 text-blue-300">
                Realisasi DPK (Rp)
              </th>
              <th className="p-3 border-r border-slate-700 min-w-[80px] text-center bg-blue-900/80 text-white font-bold">
                % Ach
              </th>
              <th className="p-3 border-r border-slate-700 min-w-[100px] text-center bg-amber-950/60 text-amber-300">
                Collection %
              </th>
              <th className="p-3 border-r border-slate-700 min-w-[90px] text-center bg-rose-950/60 text-rose-300">
                NPL %
              </th>
              <th className="p-3 border-r border-slate-700 min-w-[90px] text-center bg-purple-950/60 text-purple-300">
                DKP %
              </th>
              <th className="p-3 border-r border-slate-700 min-w-[110px] text-center">Status KPI</th>
              <th className="p-3 border-r border-slate-700 min-w-[70px] text-center">AO</th>
              <th className="p-3 border-r border-slate-700 min-w-[80px] text-center">Debitur</th>
              {isHeadArea && <th className="p-3 text-center w-12">Aksi</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white font-medium text-slate-800">
            {displayedRows.map((row, idx) => {
              const achKredit = calculateAch(row.realisasi_kredit, row.target_kredit);
              const achFunding = calculateAch(row.realisasi_funding, row.target_funding);
              const kpiBadge = getKpiBadge(achKredit, row.npl_percentage);

              return (
                <tr
                  key={row.id}
                  className={`hover:bg-amber-50/60 transition-colors ${
                    row.isModified ? "bg-amber-50/40" : idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                  }`}
                >
                  <td className="p-2 border-r border-slate-200 text-center font-mono text-[10px] text-slate-400 font-bold bg-slate-100/50">
                    {idx + 1}
                  </td>

                  <td className="p-1 border-r border-slate-200 font-mono font-bold text-slate-900">
                    {isHeadArea ? (
                      <input
                        type="text"
                        value={row.unit_code}
                        onChange={(e) => handleCellChange(row.id, "unit_code", e.target.value)}
                        className="w-full bg-transparent px-2 py-1 font-mono font-bold outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded"
                      />
                    ) : (
                      <span className="px-2">{row.unit_code}</span>
                    )}
                  </td>

                  <td className="p-1 border-r border-slate-200 font-bold text-slate-900">
                    {isHeadArea ? (
                      <input
                        type="text"
                        value={row.unit_name}
                        onChange={(e) => handleCellChange(row.id, "unit_name", e.target.value)}
                        className="w-full bg-transparent px-2 py-1 font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded"
                      />
                    ) : (
                      <span className="px-2 truncate block">{row.unit_name}</span>
                    )}
                  </td>

                  <td className="p-1 border-r border-slate-200 bg-emerald-50/20">
                    <input
                      type="number"
                      value={row.target_kredit}
                      onChange={(e) => handleCellChange(row.id, "target_kredit", e.target.value)}
                      className="w-full text-right font-mono font-bold px-2 py-1 bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 rounded text-slate-900"
                    />
                  </td>

                  <td className="p-1 border-r border-slate-200 bg-emerald-50/30">
                    <input
                      type="number"
                      value={row.realisasi_kredit}
                      onChange={(e) => handleCellChange(row.id, "realisasi_kredit", e.target.value)}
                      className="w-full text-right font-mono font-black px-2 py-1 bg-transparent text-emerald-700 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 rounded"
                    />
                  </td>

                  <td className="p-2 border-r border-slate-200 text-center font-mono font-black bg-emerald-100/60">
                    <span className={achKredit >= 100 ? "text-emerald-700" : achKredit >= 80 ? "text-amber-700" : "text-rose-600"}>
                      {achKredit.toFixed(1)}%
                    </span>
                  </td>

                  <td className="p-1 border-r border-slate-200 bg-blue-50/20">
                    <input
                      type="number"
                      value={row.target_funding}
                      onChange={(e) => handleCellChange(row.id, "target_funding", e.target.value)}
                      className="w-full text-right font-mono font-bold px-2 py-1 bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded text-slate-900"
                    />
                  </td>

                  <td className="p-1 border-r border-slate-200 bg-blue-50/30">
                    <input
                      type="number"
                      value={row.realisasi_funding}
                      onChange={(e) => handleCellChange(row.id, "realisasi_funding", e.target.value)}
                      className="w-full text-right font-mono font-black px-2 py-1 bg-transparent text-blue-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded"
                    />
                  </td>

                  <td className="p-2 border-r border-slate-200 text-center font-mono font-black bg-blue-100/60 text-blue-800">
                    {achFunding.toFixed(1)}%
                  </td>

                  <td className="p-1 border-r border-slate-200 bg-amber-50/20">
                    <input
                      type="number"
                      step="0.1"
                      value={row.realisasi_collection}
                      onChange={(e) => handleCellChange(row.id, "realisasi_collection", e.target.value)}
                      className="w-full text-center font-mono font-bold px-1 py-1 bg-transparent text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 rounded"
                    />
                  </td>

                  <td className={`p-1 border-r border-slate-200 ${row.npl_percentage > 3.0 ? "bg-rose-100/70" : "bg-emerald-50/20"}`}>
                    <input
                      type="number"
                      step="0.01"
                      value={row.npl_percentage}
                      onChange={(e) => handleCellChange(row.id, "npl_percentage", e.target.value)}
                      className={`w-full text-center font-mono font-black px-1 py-1 bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-rose-500 rounded ${
                        row.npl_percentage > 3.0 ? "text-rose-700" : "text-emerald-700"
                      }`}
                    />
                  </td>

                  <td className="p-1 border-r border-slate-200 bg-purple-50/20">
                    <input
                      type="number"
                      step="0.01"
                      value={row.dkp_percentage}
                      onChange={(e) => handleCellChange(row.id, "dkp_percentage", e.target.value)}
                      className="w-full text-center font-mono font-bold px-1 py-1 bg-transparent text-purple-800 outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 rounded"
                    />
                  </td>

                  <td className="p-2 border-r border-slate-200 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black border font-mono ${kpiBadge.bg}`}>
                      {kpiBadge.label}
                    </span>
                  </td>

                  <td className="p-1 border-r border-slate-200">
                    <input
                      type="number"
                      value={row.ao_count}
                      onChange={(e) => handleCellChange(row.id, "ao_count", e.target.value)}
                      className="w-full text-center font-mono text-slate-700 px-1 py-1 bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-slate-400 rounded"
                    />
                  </td>

                  <td className="p-1 border-r border-slate-200">
                    <input
                      type="number"
                      value={row.total_customers}
                      onChange={(e) => handleCellChange(row.id, "total_customers", e.target.value)}
                      className="w-full text-center font-mono text-slate-700 px-1 py-1 bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-slate-400 rounded"
                    />
                  </td>

                  {isHeadArea && (
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Hapus Baris Unit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>

          <tfoot className="bg-[#0F172A] text-white font-mono text-xs uppercase font-bold sticky bottom-0 z-20 shadow-inner">
            <tr>
              <td className="p-3 border-r border-slate-700 text-center" colSpan={3}>
                TOTAL & RATA-RATA AREA REGIONAL
              </td>
              <td className="p-3 border-r border-slate-700 text-right text-emerald-300 font-extrabold">
                {formatCurrency(totals.sumTargetKredit)}
              </td>
              <td className="p-3 border-r border-slate-700 text-right text-emerald-400 font-black">
                {formatCurrency(totals.sumRealisasiKredit)}
              </td>
              <td className="p-3 border-r border-slate-700 text-center font-black bg-emerald-900 text-white">
                {totals.achKredit.toFixed(1)}%
              </td>
              <td className="p-3 border-r border-slate-700 text-right text-blue-300 font-extrabold">
                {formatCurrency(totals.sumTargetFunding)}
              </td>
              <td className="p-3 border-r border-slate-700 text-right text-blue-400 font-black">
                {formatCurrency(totals.sumRealisasiFunding)}
              </td>
              <td className="p-3 border-r border-slate-700 text-center font-black bg-blue-900 text-white">
                {totals.achFunding.toFixed(1)}%
              </td>
              <td className="p-3 border-r border-slate-700 text-center text-amber-300">
                {totals.avgCollection.toFixed(1)}%
              </td>
              <td className={`p-3 border-r border-slate-700 text-center ${totals.avgNpl <= 3.0 ? "text-emerald-400" : "text-rose-400"}`}>
                {totals.avgNpl.toFixed(2)}%
              </td>
              <td className="p-3 border-r border-slate-700 text-center text-purple-300">
                {totals.avgDkp.toFixed(2)}%
              </td>
              <td className="p-3 border-r border-slate-700 text-center text-[10px] text-slate-300">
                {totals.achKredit >= 100 ? "EXCELLENT" : "ON GOING"}
              </td>
              <td className="p-3 border-r border-slate-700 text-center text-slate-300">
                {displayedRows.reduce((a, b) => a + b.ao_count, 0)}
              </td>
              <td className="p-3 border-r border-slate-700 text-center text-slate-300">
                {displayedRows.reduce((a, b) => a + b.total_customers, 0).toLocaleString()}
              </td>
              {isHeadArea && <td className="p-3"></td>}
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 font-mono">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-emerald-600" />
          <span>Formulasi otomatis aktif. Sel yang diubah akan disorot warna kuning lembut.</span>
        </div>
        <div>
          <span>Status Engine: </span>
          <strong className="text-emerald-600">● Live Canvas Single-File Ready</strong>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentRole, setCurrentRole] = useState<Role>("AREA_HEAD");
  const [activeUnitScope, setActiveUnitScope] = useState<string>("KMU-01");
  const [activeMenu, setActiveMenu] = useState<string>("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const [units, setUnits] = useState<UnitDetail[]>(DEFAULT_UNITS);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>(DEFAULT_METRICS);
  const [reports, setReports] = useState<DailyReport[]>(DEFAULT_REPORTS);
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>(DEFAULT_BROADCASTS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(DEFAULT_NOTIFICATIONS);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedUnitDetail, setSelectedUnitDetail] = useState<UnitDetail | null>(null);
  const [editingMetric, setEditingMetric] = useState<PerformanceMetric | null>(null);

  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState<boolean>(false);
  const [newBroadcastTitle, setNewBroadcastTitle] = useState<string>("");
  const [newBroadcastContent, setNewBroadcastContent] = useState<string>("");

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);

  const getAchievement = (realization: number, target: number) => {
    if (!target || target === 0) return 0;
    return (realization / target) * 100;
  };

  const scopedMetrics = useMemo(() => {
    if (currentRole === "KEPALA_UNIT") {
      return metrics.filter((m) => m.unit_code === activeUnitScope);
    }
    return metrics;
  }, [metrics, currentRole, activeUnitScope]);

  const aggregateTotals = useMemo(() => {
    const totalTargetKredit = scopedMetrics.reduce((acc, curr) => acc + curr.target_kredit, 0);
    const totalRealisasiKredit = scopedMetrics.reduce((acc, curr) => acc + curr.realisasi_kredit, 0);
    const totalTargetFunding = scopedMetrics.reduce((acc, curr) => acc + curr.target_funding, 0);
    const totalRealisasiFunding = scopedMetrics.reduce((acc, curr) => acc + curr.realisasi_funding, 0);

    const avgNpl =
      scopedMetrics.length > 0
        ? scopedMetrics.reduce((acc, curr) => acc + curr.npl_percentage, 0) / scopedMetrics.length
        : 0;

    const avgCollection =
      scopedMetrics.length > 0
        ? scopedMetrics.reduce((acc, curr) => acc + curr.realisasi_collection, 0) / scopedMetrics.length
        : 0;

    return {
      totalTargetKredit,
      totalRealisasiKredit,
      achKredit: getAchievement(totalRealisasiKredit, totalTargetKredit),
      totalTargetFunding,
      totalRealisasiFunding,
      achFunding: getAchievement(totalRealisasiFunding, totalTargetFunding),
      avgNpl,
      avgCollection
    };
  }, [scopedMetrics]);

  const handleSaveWorksheetBatch = (updatedMetrics: PerformanceMetric[]) => {
    setMetrics(updatedMetrics);
  };

  const handleApproveReport = (reportId: string, newStatus: "APPROVED" | "REVISION") => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
    );
  };

  const handleMarkBroadcastRead = (broadcastId: string) => {
    setBroadcasts((prev) =>
      prev.map((bc) => {
        if (bc.id === broadcastId && !bc.readBy.includes(activeUnitScope)) {
          return { ...bc, readBy: [...bc.readBy, activeUnitScope] };
        }
        return bc;
      })
    );
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBroadcastTitle.trim() || !newBroadcastContent.trim()) return;

    const newMsg: BroadcastMessage = {
      id: `bc-${Date.now()}`,
      title: newBroadcastTitle,
      content: newBroadcastContent,
      date: "Hari ini",
      sender: currentRole === "SUPER_ADMIN" ? "Super Admin" : "Drs. Bambang Hermawan (Area Head)",
      readBy: []
    };

    setBroadcasts([newMsg, ...broadcasts]);
    setNewBroadcastTitle("");
    setNewBroadcastContent("");
    setIsBroadcastModalOpen(false);
  };

  const handleSaveMetricUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMetric) return;

    setMetrics((prev) =>
      prev.map((m) => (m.id === editingMetric.id ? { ...editingMetric } : m))
    );
    setEditingMetric(null);
  };

  const activeUnitInfo = useMemo(() => {
    return units.find((u) => u.code === activeUnitScope) || units[0];
  }, [units, activeUnitScope]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col antialiased">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0F172A] text-white shadow-xl border-b border-slate-800">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-950">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-none">
                  MICRO-UNIT AREA COMMAND CENTER
                </h1>
                <p className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5">
                  Monitoring Regional 17 Kantor Mikro Perbankan
                </p>
              </div>
            </div>
          </div>

          {/* Role Switcher Toolbar */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-400">Live Preview Ready</span>
            </div>

            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setCurrentRole("AREA_HEAD")}
                className={`px-2.5 py-1 rounded-lg font-extrabold transition-all cursor-pointer ${
                  currentRole === "AREA_HEAD" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Head Area
              </button>
              <button
                onClick={() => setCurrentRole("KEPALA_UNIT")}
                className={`px-2.5 py-1 rounded-lg font-extrabold transition-all cursor-pointer ${
                  currentRole === "KEPALA_UNIT" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Kepala Unit
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Header Scope Selector */}
        {currentRole === "KEPALA_UNIT" && (
          <div className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Scoped Active Unit:</span>
              <select
                value={activeUnitScope}
                onChange={(e) => setActiveUnitScope(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-emerald-400 font-mono font-bold rounded-lg px-2.5 py-1 outline-none focus:border-emerald-500"
              >
                {units.map((u) => (
                  <option key={u.code} value={u.code}>
                    {u.code} — {u.name}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
              Kepala Unit: <strong className="text-white">{activeUnitInfo.headName}</strong>
            </span>
          </div>
        )}
      </header>

      {/* Main Body Layout */}
      <div className="flex-1 flex min-w-0">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-4 space-y-1 overflow-y-auto flex-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              MAIN NAVIGATION ({currentRole})
            </p>

            {[
              { label: "Dashboard", icon: LayoutDashboard },
              { label: "Input Worksheet Unit", icon: FileSpreadsheet },
              { label: "Monitoring Unit", icon: BarChart3 },
              { label: "Approval", icon: CheckSquare },
              { label: "Pesan dari Head", icon: Megaphone },
              { label: "Notifikasi", icon: Bell },
              { label: "Profil", icon: User }
            ].map((menu) => {
              const Icon = menu.icon;
              const isActive = activeMenu === menu.label;
              return (
                <button
                  key={menu.label}
                  onClick={() => {
                    setActiveMenu(menu.label);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-[#0F172A] text-white shadow-md shadow-slate-950/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  <span>{menu.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Status Regional</span>
              <p className="font-bold text-slate-900">17 Unit Mikro</p>
              <p className="text-[11px] text-emerald-600 font-mono font-bold">100% Operational</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 min-w-0">
          {activeMenu === "Dashboard" && (
            <div className="space-y-6">
              {/* Executive Welcome Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
                <div className="max-w-2xl space-y-3 relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-xs font-bold font-mono">
                    <Sparkles className="w-3.5 h-3.5" /> COMMAND CENTER REGIONAL 1
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {currentRole === "AREA_HEAD"
                      ? "Konsolidasi Performa 17 Kantor Mikro Unit"
                      : `Laporan Realisasi Unit: ${activeUnitInfo.name}`}
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    Pemantauan pencapaian target OS Kredit Mikro, Simpanan DPK, Collection Rate, dan Mitigasi Rasio NPL secara real-time.
                  </p>
                </div>
              </div>

              {/* Core Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Realisasi Kredit</span>
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-2 font-mono">
                    {formatRupiah(aggregateTotals.totalRealisasiKredit)}
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Target: {formatRupiah(aggregateTotals.totalTargetKredit)}</span>
                    <span className={`font-extrabold ${aggregateTotals.achKredit >= 100 ? "text-emerald-600" : "text-amber-600"}`}>
                      {aggregateTotals.achKredit.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Realisasi DPK</span>
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-2 font-mono">
                    {formatRupiah(aggregateTotals.totalRealisasiFunding)}
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Target: {formatRupiah(aggregateTotals.totalTargetFunding)}</span>
                    <span className="font-extrabold text-blue-600">
                      {aggregateTotals.achFunding.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rata-Rata NPL (%)</span>
                    <div className={`p-2.5 rounded-xl ${aggregateTotals.avgNpl <= 3.0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className={`text-2xl font-black mt-2 font-mono ${aggregateTotals.avgNpl <= 3.0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {aggregateTotals.avgNpl.toFixed(2)}%
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Batas Aman OJK / Internal: ≤ 3.00%</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collection Rate</span>
                    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mt-2 font-mono">
                    {aggregateTotals.avgCollection.toFixed(1)}%
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Target Penagihan Angsuran: 95.0%</p>
                </div>
              </div>

              {/* Embedded Excel Interactive Sheet Grid */}
              <WorksheetGrid
                initialMetrics={scopedMetrics}
                units={units}
                activeUnitScope={activeUnitScope}
                isHeadArea={currentRole === "AREA_HEAD" || currentRole === "SUPER_ADMIN"}
                onSaveWorksheet={handleSaveWorksheetBatch}
              />
            </div>
          )}

          {activeMenu === "Input Worksheet Unit" && (
            <div className="space-y-6">
              <WorksheetGrid
                initialMetrics={metrics}
                units={units}
                activeUnitScope={activeUnitScope}
                isHeadArea={currentRole === "AREA_HEAD" || currentRole === "SUPER_ADMIN"}
                onSaveWorksheet={handleSaveWorksheetBatch}
              />
            </div>
          )}

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
                      className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-slate-800 w-48 md:w-64 font-medium"
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

      {/* Detail Unit Modal */}
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

      {/* Broadcast Modal */}
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

      {/* Metric Edit Modal */}
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