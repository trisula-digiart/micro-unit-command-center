'use client';

import React, { useState } from 'react';
import {
FileText,
Send,
CheckCircle2,
Clock,
MessageSquare,
AlertCircle
} from 'lucide-react';
import { DailyReport } from '@/types';
import { formatDateIndo } from '@/lib/utils/formatters';

// Sample Mock History Reports
const INITIAL_REPORTS: DailyReport[] = [
{
id: 'rep-101',
unit_id: 'UM-001',
user_id: 'u-1',
report_date: '2026-07-27',
summary_activities: 'Melakukan penagihan lapangan untuk 5 debitur binaan, penyaluran KUR Mikro senilai Rp 150 Juta kepada 2 pelaku UMKM pasar.',
operational_issues: 'Terjadi sedikit keterlambatan pencairan karena jaringan kantor cabang sedang maintenance pagi hari.',
area_head_notes: 'Bagus, pastikan berkas administrasi kelengkapan jaminan terarsipkan dengan baik.',
status: 'REVIEWED',
created_at: '2026-07-27T16:30:00Z',
},
{
id: 'rep-100',
unit_id: 'UM-001',
user_id: 'u-1',
report_date: '2026-07-26',
summary_activities: 'Kunjungan prospek tempat usaha kuliner di wilayah Pasar Besar. Pengumpulan berkas persyaratan 3 calon debitur.',
operational_issues: 'Nihil kendala operasional.',
area_head_notes: undefined,
status: 'SUBMITTED',
created_at: '2026-07-26T17:00:00Z',
},
];

export default function DailyReportsPage() {
const [reports, setReports] = useState<DailyReport[]>(INITIAL_REPORTS);
const [activities, setActivities] = useState('');
const [issues, setIssues] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);
const [successMessage, setSuccessMessage] = useState(false);

const handleSubmitReport = (e: React.FormEvent) => {
e.preventDefault();
if (!activities.trim()) return;

setIsSubmitting(true);

setTimeout(() => {
  const newReport: DailyReport = {
    id: `rep-${Date.now()}`,
    unit_id: 'UM-001',
    user_id: 'u-1',
    report_date: new Date().toISOString().split('T')[0],
    summary_activities: activities,
    operational_issues: issues.trim() ? issues : 'Nihil kendala operasional.',
    status: 'SUBMITTED',
    created_at: new Date().toISOString(),
  };

  setReports([newReport, ...reports]);
  setActivities('');
  setIssues('');
  setIsSubmitting(false);
  setSuccessMessage(true);

  setTimeout(() => setSuccessMessage(false), 3000);
}, 800);


};

return (

{/* Header Banner */}



Daily Operational Report

· Unit Mikro Pasar Besar (UM-001)


Pelaporan Harian Operasional


Kirimkan ringkasan kegiatan dan kendala operasional unit Anda kepada Area Head secara terstruktur.



  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
    
    {/* Form Input Laporan Harian (Left Side - 5 Columns) */}
    <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4 h-fit">
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <FileText className="h-5 w-5 text-blue-400" />
        <h3 className="font-bold text-white text-sm">Form Input Laporan Harian</h3>
      </div>

      {successMessage && (
        <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-3 rounded-lg text-xs flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>Laporan harian berhasil dikirim ke Area Head!</span>
        </div>
      )}

      <form onSubmit={handleSubmitReport} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Tanggal Laporan:
          </label>
          <input
            type="text"
            disabled
            value={formatDateIndo(new Date().toISOString())}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-400 font-medium cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Ringkasan Aktivitas Operasional <span className="text-rose-400">*</span>:
          </label>
          <textarea
            rows={4}
            required
            value={activities}
            onChange={(e) => setActivities(e.target.value)}
            placeholder="Deskripsikan penyaluran kredit, penagihan, atau prospek debitur hari ini..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Kendala Operasional / Isu Lapangan (Opsional):
          </label>
          <textarea
            rows={3}
            value={issues}
            onChange={(e) => setIssues(e.target.value)}
            placeholder="Sampaikan jika ada kendala jaringan, berkas, atau regulasi..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-all shadow-lg shadow-blue-500/20"
        >
          <Send className="h-3.5 w-3.5" />
          <span>{isSubmitting ? 'Mengarahkan...' : 'Kirim Laporan'}</span>
        </button>
      </form>
    </div>

    {/* Timeline Riwayat Laporan & Supervisory Notes (Right Side - 7 Columns) */}
    <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-bold text-white text-sm">Riwayat Laporan & Arahan Area Head</h3>
        <span className="text-xs text-slate-400">{reports.length} Laporan Terdaftar</span>
      </div>

      <div className="space-y-4">
        {reports.map((item) => (
          <div
            key={item.id}
            className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 space-y-3"
          >
            {/* Header item */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-200">
                  {formatDateIndo(item.report_date)}
                </span>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                item.status === 'REVIEWED'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                {item.status}
              </span>
            </div>

            {/* Body Content */}
            <div className="space-y-2 text-xs text-slate-300">
              <div>
                <span className="font-semibold text-slate-400">Ringkasan Aktivitas:</span>
                <p className="mt-0.5 leading-relaxed text-slate-200">{item.summary_activities}</p>
              </div>

              {item.operational_issues && (
                <div className="pt-1">
                  <span className="font-semibold text-amber-400">Kendala Lapangan:</span>
                  <p className="mt-0.5 text-slate-400">{item.operational_issues}</p>
                </div>
              )}
            </div>

            {/* Area Head Supervisory Notes Card */}
            {item.area_head_notes && (
              <div className="bg-blue-950/40 border border-blue-800/60 rounded-lg p-3 text-xs text-blue-200 space-y-1">
                <div className="flex items-center space-x-1.5 text-blue-400 font-bold">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Catatan Arahan Area Head:</span>
                </div>
                <p className="text-slate-300 pl-5 leading-relaxed">
                  "{item.area_head_notes}"
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>

  </div>
</div>


);
}