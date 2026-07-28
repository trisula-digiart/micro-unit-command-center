"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Save,
  Plus,
  Trash2,
  Download,
  RefreshCw,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  ArrowUpDown,
  Filter,
  Check,
  Search,
  Sparkles
} from "lucide-react";
import { PerformanceMetric, UnitDetail } from "@/types";

interface WorksheetGridProps {
  initialMetrics: PerformanceMetric[];
  units: UnitDetail[];
  activeUnitScope: string;
  isHeadArea: boolean;
  onSaveWorksheet: (updatedMetrics: PerformanceMetric[]) => Promise<void> | void;
  isConnectedLive?: boolean;
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

export default function WorksheetGrid({
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
    if (confirm("Apakah Anda yakin ingin menghapus baris unit ini dari worksheet?")) {
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
        profit: (row.realisasi_kredit * 0.08) - (row.target_kredit * 0.02),
        last_update: "Baru saja disimpam",
        submitted_today: true
      }));

      await onSaveWorksheet(updatedMetrics);

      // Reset modified markers
      setGridRowData((prev) => prev.map((r) => ({ ...r, isModified: false })));
      setSaveSuccessMsg("✓ Seluruh data worksheet berhasil disimpan dan disinkronkan!");
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan data worksheet.");
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
      
      {}
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

      {}
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

      {}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full border-collapse text-left text-xs font-sans">
          
          {/* Table Header (Excel Ribbon Header Style) */}
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

          {/* Table Body - Excel Editable Grid Cells */}
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
                  {/* Row Index */}
                  <td className="p-2 border-r border-slate-200 text-center font-mono text-[10px] text-slate-400 font-bold bg-slate-100/50">
                    {idx + 1}
                  </td>

                  {/* Kode Unit (Editable if Head) */}
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

                  {/* Nama Unit */}
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

                  {/* Target Kredit (Editable Cell) */}
                  <td className="p-1 border-r border-slate-200 bg-emerald-50/20">
                    <input
                      type="number"
                      value={row.target_kredit}
                      onChange={(e) => handleCellChange(row.id, "target_kredit", e.target.value)}
                      className="w-full text-right font-mono font-bold px-2 py-1 bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 rounded text-slate-900"
                    />
                  </td>

                  {/* Realisasi Kredit (Editable Cell) */}
                  <td className="p-1 border-r border-slate-200 bg-emerald-50/30">
                    <input
                      type="number"
                      value={row.realisasi_kredit}
                      onChange={(e) => handleCellChange(row.id, "realisasi_kredit", e.target.value)}
                      className="w-full text-right font-mono font-black px-2 py-1 bg-transparent text-emerald-700 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 rounded"
                    />
                  </td>

                  {/* % Achievement Kredit (Formula Computed) */}
                  <td className="p-2 border-r border-slate-200 text-center font-mono font-black bg-emerald-100/60">
                    <span className={achKredit >= 100 ? "text-emerald-700" : achKredit >= 80 ? "text-amber-700" : "text-rose-600"}>
                      {achKredit.toFixed(1)}%
                    </span>
                  </td>

                  {/* Target DPK (Editable Cell) */}
                  <td className="p-1 border-r border-slate-200 bg-blue-50/20">
                    <input
                      type="number"
                      value={row.target_funding}
                      onChange={(e) => handleCellChange(row.id, "target_funding", e.target.value)}
                      className="w-full text-right font-mono font-bold px-2 py-1 bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded text-slate-900"
                    />
                  </td>

                  {/* Realisasi DPK (Editable Cell) */}
                  <td className="p-1 border-r border-slate-200 bg-blue-50/30">
                    <input
                      type="number"
                      value={row.realisasi_funding}
                      onChange={(e) => handleCellChange(row.id, "realisasi_funding", e.target.value)}
                      className="w-full text-right font-mono font-black px-2 py-1 bg-transparent text-blue-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded"
                    />
                  </td>

                  {/* % Achievement DPK (Formula Computed) */}
                  <td className="p-2 border-r border-slate-200 text-center font-mono font-black bg-blue-100/60 text-blue-800">
                    {achFunding.toFixed(1)}%
                  </td>

                  {/* Collection Rate % (Editable Cell) */}
                  <td className="p-1 border-r border-slate-200 bg-amber-50/20">
                    <input
                      type="number"
                      step="0.1"
                      value={row.realisasi_collection}
                      onChange={(e) => handleCellChange(row.id, "realisasi_collection", e.target.value)}
                      className="w-full text-center font-mono font-bold px-1 py-1 bg-transparent text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 rounded"
                    />
                  </td>

                  {/* NPL % (Editable Cell with Traffic Light highlight) */}
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

                  {/* DKP % (Editable Cell) */}
                  <td className="p-1 border-r border-slate-200 bg-purple-50/20">
                    <input
                      type="number"
                      step="0.01"
                      value={row.dkp_percentage}
                      onChange={(e) => handleCellChange(row.id, "dkp_percentage", e.target.value)}
                      className="w-full text-center font-mono font-bold px-1 py-1 bg-transparent text-purple-800 outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 rounded"
                    />
                  </td>

                  {/* Status KPI Badge */}
                  <td className="p-2 border-r border-slate-200 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black border font-mono ${kpiBadge.bg}`}>
                      {kpiBadge.label}
                    </span>
                  </td>

                  {/* AO Count */}
                  <td className="p-1 border-r border-slate-200">
                    <input
                      type="number"
                      value={row.ao_count}
                      onChange={(e) => handleCellChange(row.id, "ao_count", e.target.value)}
                      className="w-full text-center font-mono text-slate-700 px-1 py-1 bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-slate-400 rounded"
                    />
                  </td>

                  {/* Total Customers */}
                  <td className="p-1 border-r border-slate-200">
                    <input
                      type="number"
                      value={row.total_customers}
                      onChange={(e) => handleCellChange(row.id, "total_customers", e.target.value)}
                      className="w-full text-center font-mono text-slate-700 px-1 py-1 bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-slate-400 rounded"
                    />
                  </td>

                  {/* Delete Button (If Head Area) */}
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

          {}
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

      {}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 font-mono">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-emerald-600" />
          <span>Formulasi otomatis aktif. Sel yang diubah akan disorot warna kuning lembut.</span>
        </div>
        <div>
          <span>Status Sinkronisasi DB: </span>
          <strong className={isConnectedLive ? "text-emerald-600" : "text-amber-600"}>
            {isConnectedLive ? "● Terhubung Supabase Live" : "● Offline Local Mode"}
          </strong>
        </div>
      </div>

    </div>
  );
}