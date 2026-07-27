'use client';

import React from 'react';
import Link from 'next/link';
import {
Building2,
TrendingUp,
Wallet,
AlertTriangle,
FileText,
Target,
Clock,
ArrowUpRight,
CheckCircle2,
AlertCircle
} from 'lucide-react';
import {
formatRupiah,
formatCurrencyShort,
calculateAchievement,
getPerformanceStatus,
formatPercentage
} from '@/lib/utils/formatters';

export default function KepalaUnitDashboard() {
// Mock Data untuk Unit Spesifik Kepala Unit yang Login (cth: Unit Mikro Pasar Besar - UM-001)
const myUnitData = {
code: 'UM-001',
name: 'Unit Mikro Pasar Besar',
period: 'Juli 2026',
target_kredit: 15000000000,
realisasi_kredit: 16200000000,
target_dpk: 12000000000,
realisasi_dpk: 12500000000,
npl_ratio: 1.85,
last_report_status: 'REVIEWED',
latest_area_head_note: 'Performa penyaluran kredit bulan ini sangat baik. Pertahankan kualitas underwriting untuk menjaga NPL di bawah 2%.',
};

const achKredit = calculateAchievement(myUnitData.realisasi_kredit, myUnitData.target_kredit);
const achDpk = calculateAchievement(myUnitData.realisasi_dpk, myUnitData.target_dpk);
const statusKredit = getPerformanceStatus(achKredit);
const statusDpk = getPerformanceStatus(achDpk);

return (

{/* Header Operational Control */}




Unit Operational Control

· {myUnitData.code}


{myUnitData.name}


Pantauan KPI internal unit, status target bulanan, dan quick action pelaporan harian.



    <div className="flex items-center space-x-3">
      <Link
        href="/kepala-unit/reports"
        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-blue-500/20"
      >
        <FileText className="h-4 w-4" />
        <span>Input Laporan Harian</span>
      </Link>
    </div>
  </div>

  {/* Area Head Directive Banner (If Available) */}
  {myUnitData.latest_area_head_note && (
    <div className="bg-blue-950/60 border border-blue-800/80 rounded-xl p-4 text-blue-100 flex items-start space-x-3 shadow-md">
      <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="text-xs font-bold text-blue-300 uppercase tracking-wider">
          Catatan Arahan Terakhir dari Area Head
        </p>
        <p className="text-xs leading-relaxed text-slate-200">
          "{myUnitData.latest_area_head_note}"
        </p>
      </div>
    </div>
  )}

  {/* Main KPI Status Overview */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    
    {/* Card Target Kredit */}
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white text-sm">Penyaluran Kredit</h3>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          statusKredit === 'GREEN' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
        }`}>
          Ach {achKredit}%
        </span>
      </div>

      <div>
        <div className="text-2xl font-bold text-white">
          {formatRupiah(myUnitData.realisasi_kredit)}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Target: {formatRupiah(myUnitData.target_kredit)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full rounded-full ${achKredit >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(achKredit, 100)}%` }}
          ></div>
        </div>
        <p className="text-[10px] text-right text-slate-400">
          {achKredit >= 100 ? 'Target Terlampaui' : `Sisa Target: ${formatCurrencyShort(myUnitData.target_kredit - myUnitData.realisasi_kredit)}`}
        </p>
      </div>
    </div>

    {/* Card Target DPK */}
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Wallet className="h-5 w-5 text-emerald-400" />
          <h3 className="font-semibold text-white text-sm">Penghimpunan DPK</h3>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          statusDpk === 'GREEN' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
        }`}>
          Ach {achDpk}%
        </span>
      </div>

      <div>
        <div className="text-2xl font-bold text-white">
          {formatRupiah(myUnitData.realisasi_dpk)}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Target: {formatRupiah(myUnitData.target_dpk)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${Math.min(achDpk, 100)}%` }}
          ></div>
        </div>
        <p className="text-[10px] text-right text-slate-400">
          {achDpk >= 100 ? 'Target Terlampaui' : `Sisa Target: ${formatCurrencyShort(myUnitData.target_dpk - myUnitData.realisasi_dpk)}`}
        </p>
      </div>
    </div>

    {/* Card NPL Ratio */}
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <h3 className="font-semibold text-white text-sm">Rasio NPL Unit</h3>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          myUnitData.npl_ratio < 3.0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
        }`}>
          {myUnitData.npl_ratio < 3.0 ? 'Aman' : 'Perlu Perhatian'}
        </span>
      </div>

      <div>
        <div className="text-2xl font-bold text-white">
          {formatPercentage(myUnitData.npl_ratio)}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Maksimum Toleransi: 3.00%
        </div>
      </div>

      <p className="text-xs text-slate-400 pt-2 border-t border-slate-800">
        Kualitas portofolio unit saat ini berada dalam kisaran aman dan sehat.
      </p>
    </div>

  </div>

  {/* Quick Navigation Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    
    <Link 
      href="/kepala-unit/pipeline"
      className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-6 transition-all shadow-lg flex items-center justify-between"
    >
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-400" />
          <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">
            Pipeline & Prospek Debitur
          </h4>
        </div>
        <p className="text-xs text-slate-400">
          Kelola calon debitur potensial dan lacak status kelayakan pembiayaan.
        </p>
      </div>
      <ArrowUpRight className="h-5 w-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
    </Link>

    <Link 
      href="/kepala-unit/reports"
      className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-6 transition-all shadow-lg flex items-center justify-between"
    >
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-emerald-400" />
          <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">
            Laporan Harian Operasional
          </h4>
        </div>
        <p className="text-xs text-slate-400">
          Kirim ringkasan aktivitas harian dan sampaikan kendala operasional ke Area Head.
        </p>
      </div>
      <ArrowUpRight className="h-5 w-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
    </Link>

  </div>
</div>


);
}