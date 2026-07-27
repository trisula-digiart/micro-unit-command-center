'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
Building2,
TrendingUp,
Wallet,
AlertTriangle,
Search,
Filter,
ChevronRight,
MessageSquare,
ArrowUpRight,
ShieldAlert,
CheckCircle2,
Clock
} from 'lucide-react';
import { PerformanceMetric, PerformanceStatus } from '@/types';
import {
formatRupiah,
formatCurrencyShort,
calculateAchievement,
getPerformanceStatus,
formatPercentage
} from '@/lib/utils/formatters';

// Sample Data Mock - 17 Unit Mikro Regional
const INITIAL_METRICS: PerformanceMetric[] = [
{ id: '1', unit_id: 'UM-001', unit: { id: '1', code: 'UM-001', name: 'Unit Mikro Pasar Besar', region: 'Regional Office' }, period_date: '2026-07-01', target_kredit: 15000000000, realisasi_kredit: 16200000000, target_dpk: 12000000000, realisasi_dpk: 12500000000, npl_ratio: 1.85 },
{ id: '2', unit_id: 'UM-002', unit: { id: '2', code: 'UM-002', name: 'Unit Mikro Merdeka', region: 'Regional Office' }, period_date: '2026-07-01', target_kredit: 12000000000, realisasi_kredit: 11800000000, target_dpk: 10000000000, realisasi_dpk: 9800000000, npl_ratio: 2.10 },
{ id: '3', unit_id: 'UM-003', unit: { id: '3', code: 'UM-003', name: 'Unit Mikro Sudirman', region: 'Regional Office' }, period_date: '2026-07-01', target_kredit: 18000000000, realisasi_kredit: 13500000000, target_dpk: 15000000000, realisasi_dpk: 11000000000, npl_ratio: 3.45 },
{ id: '4', unit_id: 'UM-004', unit: { id: '4', code: 'UM-004', name: 'Unit Mikro Ahmad Yani', region: 'Regional Office' }, period_date: '2026-07-01', target_kredit: 10000000000, realisasi_kredit: 10500000000, target_dpk: 8000000000, realisasi_dpk: 8400000000, npl_ratio: 1.20 },
{ id: '5', unit_id: 'UM-005', unit: { id: '5', code: 'UM-005', name: 'Unit Mikro Gatot Subroto', region: 'Regional Office' }, period_date: '2026-07-01', target_kredit: 14000000000, realisasi_kredit: 11000000000, target_dpk: 11000000000, realisasi_dpk: 9200000000, npl_ratio: 3.80 },
{ id: '6', unit_id: 'UM-006', unit: { id: '6', code: 'UM-006', name: 'Unit Mikro Diponegoro', region: 'Regional Office' }, period_date: '2026-07-01', target_kredit: 11000000000, realisasi_kredit: 11200000000, target_dpk: 9000000000, realisasi_dpk: 9100000000, npl_ratio: 2.05 },
{ id: '7', unit_id: 'UM-007', unit: { id: '7', code: 'UM-007', name: 'Unit Mikro Pahlawan', region: 'Regional Office' }, period_date: '2026-07-01', target_kredit: 13000000000, realisasi_kredit: 10100000000, target_dpk: 10000000000, realisasi_dpk: 7900000000, npl_ratio: 4.10 },
{ id: '8', unit_id: 'UM-008', unit: { id: '8', code: 'UM-008', name: 'Unit Mikro Veteran', region: 'Regional Office' }, period_date: '2026-07-01', target_kredit: 16000000000, realisasi_kredit: 16800000000, target_dpk: 13000000000, realisasi_dpk: 13200000000, npl_ratio: 1.50 },
{ id: '9', unit_id: 'UM-009', unit: { id: '9', code: 'UM-009', name: 'Unit Mikro Kartini', region: 'Regional Office' }, period_date: '2026-07-01', target_kredit: 9000000000, realisasi_kredit: 9100000000, target_dpk: 7500000000, realisasi_dpk: 7600000000, npl_ratio: 1.90 },
{ id: '10', unit_id: 'UM-010', unit: { id: '10', code: 'UM-010', name: 'Unit Mikro Pemuda', region: 'Regional Office' }, period_date: '2026-07-01', target_kredit: 12500000000, realisasi_kredit: 10200000000, target_dpk: 10500000000, realisasi_dpk: 8800000000, npl_ratio: 2.90 },
{ id: '11', unit_id: 'UM-011', unit: { id: '11', code: 'UM-011', name: 'Unit Mikro Gajah Mada', region: 'Regional Office' }, period_date: '2026-07-01', target_kredit: 15500000000, realisasi_kredit: 15900000000, target_dpk: 12500000000, realisasi_dpk: 12800000000, npl_ratio: 1.10 },
{ id: '12', unit_id: 'UM-012', unit: { id: '12', code: 'UM-012', name: 'Unit Mikro Hayam Wuruk', region: 'Regional Office' }, period_date: '2026-07-01', target_kredit: 11500000000, realisasi_kredit: 11600000000, target_dpk: 9500000000, realisasi_dpk: 9700000000, npl_ratio: 2.30 },
{ id: '13', unit_id: 'UM-013', unit: { id: '13', code: 'UM-013', name: 'Unit Mikro Borobudur', region: 'Regional Office' }, period_date: '2026-07-01', target_kredit: 13500000000, realisasi_kredit: 10800000000, target_dpk: 11000000000, realisasi_dpk: 8700000000, npl_ratio: 3.20 },
{ id: '14', unit_id: 'UM-014', unit: { id: '14', code: 'UM-014', name: 'Unit Mikro Prambanan', region: 'Regional Office' }, period_date: '2026-07-01', target_kredit: 10500000000, realisasi_kredit: 10900000000, target_dpk: 8500000000, realisasi_dpk: 8900000000, npl_ratio: 1.75 },
{ id: '15', unit_id: 'UM-015', unit: { id: '15', code: 'UM-015', name: 'Unit Mikro Cenderawasih', region: 'Regional Office' }, period_date: '2026-07-01', target_kredit: 14500000000, realisasi_kredit: 14700000000, target_dpk: 11500000000, realisasi_dpk: 11800000000, npl_ratio: 2.00 },
{ id: '16', unit_id: 'UM-016', unit: { id: '16', code: 'UM-016', name: 'Unit Mikro Imam Bonjol', region: 'Regional Office' }, period_date: '2026-07-01', target_kredit: 12000000000, realisasi_kredit: 9500000000, target_dpk: 10000000000, realisasi_dpk: 7800000000, npl_ratio: 3.60 },
{ id: '17', unit_id: 'UM-017', unit: { id: '17', code: 'UM-017', name: 'Unit Mikro Raden Intan', region: 'Regional Office' }, period_date: '2026-07-01', target_kredit: 13000000000, realisasi_kredit: 13300000000, target_dpk: 10500000000, realisasi_dpk: 10800000000, npl_ratio: 1.40 },
];

export default function AreaHeadDashboard() {
const [searchQuery, setSearchQuery] = useState('');
const [statusFilter, setStatusFilter] = useState<'ALL' | PerformanceStatus>('ALL');
const [selectedUnitForNote, setSelectedUnitForNote] = useState<PerformanceMetric | null>(null);
const [noteText, setNoteText] = useState('');
const [isNoteSubmitted, setIsNoteSubmitted] = useState(false);

// Calculated Aggregate Values
const aggregates = useMemo(() => {
let totKreditTarget = 0;
let totKreditRealisasi = 0;
let totDpkTarget = 0;
let totDpkRealisasi = 0;
let totNplSum = 0;
let atRiskCount = 0;

INITIAL_METRICS.forEach((m) => {
  totKreditTarget += m.target_kredit;
  totKreditRealisasi += m.realisasi_kredit;
  totDpkTarget += m.target_dpk;
  totDpkRealisasi += m.realisasi_dpk;
  totNplSum += m.npl_ratio;
  if (m.npl_ratio >= 3.0) atRiskCount++;
});

const achKredit = calculateAchievement(totKreditRealisasi, totKreditTarget);
const achDpk = calculateAchievement(totDpkRealisasi, totDpkTarget);
const avgNpl = Number((totNplSum / INITIAL_METRICS.length).toFixed(2));

return {
  totalUnits: INITIAL_METRICS.length,
  totKreditTarget,
  totKreditRealisasi,
  achKredit,
  totDpkTarget,
  totDpkRealisasi,
  achDpk,
  avgNpl,
  atRiskCount,
};


}, []);

// Filtered Unit List
const filteredMetrics = useMemo(() => {
return INITIAL_METRICS.filter((item) => {
const matchSearch = item.unit?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
item.unit?.code.toLowerCase().includes(searchQuery.toLowerCase());

  const ach = calculateAchievement(item.realisasi_kredit, item.target_kredit);
  const status = getPerformanceStatus(ach);

  const matchStatus = statusFilter === 'ALL' || status === statusFilter;

  return matchSearch && matchStatus;
});


}, [searchQuery, statusFilter]);

const handleSendNote = (e: React.FormEvent) => {
e.preventDefault();
if (!noteText.trim()) return;
setIsNoteSubmitted(true);
setTimeout(() => {
setIsNoteSubmitted(false);
setSelectedUnitForNote(null);
setNoteText('');
}, 1500);
};

return (

{/* Top Header Banner */}




Executive View

· Regional Area Command


Monitoring Performance 17 Kantor Mikro


Ringkasan konsolidasi target kredit, DPK, dan pemantauan NPL secara real-time.



    <div className="flex items-center space-x-3">
      <Link
        href="/area-head/risk-watchlist"
        className="flex items-center space-x-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-700/50 text-rose-300 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all shadow-lg"
      >
        <ShieldAlert className="h-4 w-4 text-rose-400" />
        <span>Watchlist Risk ({aggregates.atRiskCount})</span>
      </Link>
    </div>
  </div>

  {/* Aggregate KPI Summary Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {/* Total Outstanding Kredit */}
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Kredit</span>
        <div className="p-2 bg-blue-950 text-blue-400 rounded-lg">
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white mt-3">
        {formatCurrencyShort(aggregates.totKreditRealisasi)}
      </p>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-slate-400">Target: {formatCurrencyShort(aggregates.totKreditTarget)}</span>
        <span className={`font-bold ${aggregates.achKredit >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
          {aggregates.achKredit}%
        </span>
      </div>
    </div>

    {/* Total DPK / Funding */}
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total DPK / Funding</span>
        <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg">
          <Wallet className="h-5 w-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white mt-3">
        {formatCurrencyShort(aggregates.totDpkRealisasi)}
      </p>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-slate-400">Target: {formatCurrencyShort(aggregates.totDpkTarget)}</span>
        <span className={`font-bold ${aggregates.achDpk >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
          {aggregates.achDpk}%
        </span>
      </div>
    </div>

    {/* Average NPL Ratio */}
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rata-rata NPL</span>
        <div className={`p-2 rounded-lg ${aggregates.avgNpl >= 3.0 ? 'bg-rose-950 text-rose-400' : 'bg-slate-800 text-slate-300'}`}>
          <AlertTriangle className="h-5 w-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white mt-3">
        {formatPercentage(aggregates.avgNpl)}
      </p>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-slate-400">Threshold Maksimal: 3.00%</span>
        <span className={`font-bold ${aggregates.avgNpl < 3.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {aggregates.avgNpl < 3.0 ? 'Aman' : 'Tinggi'}
        </span>
      </div>
    </div>

    {/* Total Units Covered */}
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Unit Terhubung</span>
        <div className="p-2 bg-purple-950 text-purple-400 rounded-lg">
          <Building2 className="h-5 w-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white mt-3">
        {aggregates.totalUnits} <span className="text-xs font-normal text-slate-400">Kantor Unit</span>
      </p>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-slate-400">Performa Di Bawah Target:</span>
        <span className="font-bold text-rose-400">
          {INITIAL_METRICS.filter(m => calculateAchievement(m.realisasi_kredit, m.target_kredit) < 80).length} Unit
        </span>
      </div>
    </div>
  </div>

  {/* Main Table Controls & Filters */}
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* Search Box */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nama kantor unit atau kode (cth: Pasar Besar / UM-001)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Status Filter Buttons */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 md:pb-0">
        <div className="flex items-center text-xs text-slate-400 mr-2">
          <Filter className="h-3.5 w-3.5 mr-1" />
          <span>Status:</span>
        </div>
        {(['ALL', 'GREEN', 'YELLOW', 'RED'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === st
                ? st === 'GREEN'
                  ? 'bg-emerald-600 text-white'
                  : st === 'YELLOW'
                  ? 'bg-amber-600 text-white'
                  : st === 'RED'
                  ? 'bg-rose-600 text-white'
                  : 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {st === 'ALL' ? 'Semua Unit' : st}
          </button>
        ))}
      </div>
    </div>

    {/* 17 Unit Performance Table */}
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
          <tr>
            <th className="py-3 px-4">Kode & Nama Unit</th>
            <th className="py-3 px-4 text-right">Realisasi / Target Kredit</th>
            <th className="py-3 px-4 text-center">Ach Kredit</th>
            <th className="py-3 px-4 text-right">Realisasi / Target DPK</th>
            <th className="py-3 px-4 text-center">Ach DPK</th>
            <th className="py-3 px-4 text-center">NPL (%)</th>
            <th className="py-3 px-4 text-center">Status</th>
            <th className="py-3 px-4 text-center">Aksi Area Head</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-slate-200">
          {filteredMetrics.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-8 text-center text-slate-500">
                Tidak ditemukan data unit mikro yang sesuai filter.
              </td>
            </tr>
          ) : (
            filteredMetrics.map((m) => {
              const achKredit = calculateAchievement(m.realisasi_kredit, m.target_kredit);
              const achDpk = calculateAchievement(m.realisasi_dpk, m.target_dpk);
              const status = getPerformanceStatus(achKredit);

              return (
                <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{m.unit?.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{m.unit?.code}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="font-semibold text-white">{formatRupiah(m.realisasi_kredit)}</div>
                    <div className="text-[10px] text-slate-400">Target: {formatCurrencyShort(m.target_kredit)}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold">
                    <span className={achKredit >= 100 ? 'text-emerald-400' : achKredit >= 80 ? 'text-amber-400' : 'text-rose-400'}>
                      {achKredit}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="font-semibold text-white">{formatRupiah(m.realisasi_dpk)}</div>
                    <div className="text-[10px] text-slate-400">Target: {formatCurrencyShort(m.target_dpk)}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold">
                    <span className={achDpk >= 100 ? 'text-emerald-400' : achDpk >= 80 ? 'text-amber-400' : 'text-rose-400'}>
                      {achDpk}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                      m.npl_ratio >= 3.0 ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'text-slate-300'
                    }`}>
                      {formatPercentage(m.npl_ratio)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      status === 'GREEN'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : status === 'YELLOW'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => setSelectedUnitForNote(m)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-blue-950 hover:bg-blue-900 text-blue-300 rounded border border-blue-800 transition-colors text-[11px] font-semibold"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Berikan Arahan</span>
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </div>

  {/* Modal Direct Instruction / Supervisory Note */}
  {selectedUnitForNote && (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-white text-base">Instruksi & Arahan Supervisi</h3>
            <p className="text-xs text-slate-400">
              {selectedUnitForNote.unit?.name} ({selectedUnitForNote.unit?.code})
            </p>
          </div>
          <button
            onClick={() => setSelectedUnitForNote(null)}
            className="text-slate-400 hover:text-white text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {isNoteSubmitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto animate-bounce" />
            <p className="text-sm font-bold text-white">Instruksi Berhasil Dikirim!</p>
            <p className="text-xs text-slate-400">
              Catatan supervisi telah diteruskan ke portal Kepala Unit terkait.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendNote} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Isi Catatan Arahan Khusus Area Head:
              </label>
              <textarea
                rows={4}
                required
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Masukkan poin tindakan perbaikan, percepatan pipeline, atau mitigasi NPL..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUnitForNote(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20"
              >
                Kirim Instruksi
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )}
</div>


);
}