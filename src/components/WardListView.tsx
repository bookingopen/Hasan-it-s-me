import React, { useState } from 'react';
import { Bed, Patient, PatientStatus, STATUS_CONFIG } from '../types/ward';
import { 
  Search, 
  Printer, 
  Flame, 
  ExternalLink, 
  UserCheck, 
  UtensilsCrossed, 
  HeartPulse,
  Filter,
  Plus
} from 'lucide-react';

interface WardListViewProps {
  beds: Bed[];
  onSelectBed: (bed: Bed) => void;
  onAdmitToBed: (bed: Bed) => void;
}

export const WardListView: React.FC<WardListViewProps> = ({
  beds,
  onSelectBed,
  onAdmitToBed
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roomFilter, setRoomFilter] = useState<'all' | number>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PatientStatus>('all');

  const filteredBeds = beds.filter((bed) => {
    // Room filter
    if (roomFilter !== 'all' && bed.roomId !== roomFilter) return false;

    // Status filter
    const status: PatientStatus = bed.patient ? bed.patient.status : 'empty';
    if (statusFilter !== 'all' && status !== statusFilter) return false;

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const p = bed.patient;
      const bedMatch = bed.bedCode.toLowerCase().includes(q) || bed.roomName.toLowerCase().includes(q);
      const patMatch = p && (
        p.name.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q) ||
        p.diagnosis.toLowerCase().includes(q) ||
        (p.operationName && p.operationName.toLowerCase().includes(q)) ||
        (p.managementPlan && p.managementPlan.toLowerCase().includes(q)) ||
        (p.currentComplaints && p.currentComplaints.toLowerCase().includes(q))
      );
      if (!bedMatch && !patMatch) return false;
    }

    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      
      {/* Controls Bar: Search, Filters & Print */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 no-print">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient, diagnosis, MRN, plan, bed (e.g. A1, B2)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Room Filter Dropdown */}
        <select
          value={roomFilter}
          onChange={(e) => setRoomFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
        >
          <option value="all">All Rooms (A, B, C, D)</option>
          <option value="1">Room A (Male Ward: A1–A8)</option>
          <option value="2">Room B (Male Ward: B1–B8)</option>
          <option value="3">Room C (Female Ward: C1–C8)</option>
          <option value="4">Room D (Female Ward: D1–D8)</option>
        </select>

        {/* Status Filter Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
        >
          <option value="all">All Bed Statuses</option>
          <option value="er_op_today">🚨 ER Op Today</option>
          <option value="er_conservative">⚠️ ER Conservative</option>
          <option value="elective">📋 Elective List</option>
          <option value="post_op_stable">✅ Post-Op Stable</option>
          <option value="discharge_ready">🏁 Discharge Ready</option>
          <option value="empty">🛏️ Vacant Beds</option>
        </select>

        {/* Print / Export Ward Sheet */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
        >
          <Printer className="w-4 h-4 text-slate-400" />
          <span>Print Ward List</span>
        </button>

      </div>

      {/* High-Density Tabular Surgical List */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200 border-collapse">
            
            <thead className="bg-slate-950/90 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 w-16">Bed #</th>
                <th className="py-3 px-3 w-28">Room</th>
                <th className="py-3 px-3 min-w-[150px]">Patient</th>
                <th className="py-3 px-3 min-w-[200px]">Diagnosis & Procedure</th>
                <th className="py-3 px-3 w-24">POD</th>
                <th className="py-3 px-3 w-28">Status / Color</th>
                <th className="py-3 px-3 min-w-[180px]">Complaints</th>
                <th className="py-3 px-3 min-w-[200px]">Management Plan</th>
                <th className="py-3 px-3 w-28">Diet / NPO</th>
                <th className="py-3 px-3 w-20 text-right no-print">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80">
              {filteredBeds.map((bed) => {
                const p = bed.patient;
                const status = p ? p.status : 'empty';
                const config = STATUS_CONFIG[status];

                if (!p) {
                  return (
                    <tr key={bed.id} className="hover:bg-slate-800/40 text-slate-500">
                      <td className="py-3 px-3 font-mono font-bold text-slate-400">
                        {bed.bedCode}
                      </td>
                      <td className="py-3 px-3 text-[11px]">
                        Room {bed.roomCode} (C{bed.column}·R{bed.row})
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-400 italic">
                        Available Bed ({bed.bedCode})
                      </td>
                      <td className="py-3 px-3 text-slate-600">—</td>
                      <td className="py-3 px-3 text-slate-600">—</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">
                          VACANT
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">—</td>
                      <td className="py-3 px-3 text-slate-600">Ready for ER admission</td>
                      <td className="py-3 px-3 text-slate-600">—</td>
                      <td className="py-3 px-3 text-right no-print">
                        <button
                          onClick={() => onAdmitToBed(bed)}
                          className="px-2 py-1 bg-slate-800 hover:bg-rose-600 hover:text-white rounded text-[11px] font-semibold text-slate-300 transition-colors"
                        >
                          + Admit
                        </button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr 
                    key={bed.id} 
                    onClick={() => onSelectBed(bed)}
                    className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    {/* Bed Number */}
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-extrabold ${
                        status === 'er_op_today' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {bed.bedCode}
                      </span>
                    </td>

                    {/* Room & Row */}
                    <td className="py-3 px-3 text-[11px] text-slate-400">
                      <div>Room {bed.roomCode} ({bed.roomId <= 2 ? 'Male' : 'Female'})</div>
                      <div className="text-[10px] font-mono text-slate-500">C{bed.column}·R{bed.row}</div>
                    </td>

                    {/* Patient Name / Age / MRN */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-white text-xs">{p.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {p.age}y/{p.sex} · <span className="font-mono text-slate-500">{p.mrn}</span>
                      </div>
                    </td>

                    {/* Diagnosis & Op */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-100 text-xs line-clamp-1">{p.diagnosis}</div>
                      {p.operationName && (
                        <div className="text-[11px] text-slate-400 italic line-clamp-1">{p.operationName}</div>
                      )}
                    </td>

                    {/* Post-Op Day */}
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
                        {p.postOpDay}
                      </span>
                    </td>

                    {/* Status Badge with Color */}
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase whitespace-nowrap ${config.badgeBg} ${config.badgeText}`}>
                        {config.shortLabel}
                      </span>
                    </td>

                    {/* Complaints */}
                    <td className="py-3 px-3 text-slate-300 text-xs max-w-[200px]">
                      <div className="line-clamp-2">{p.currentComplaints || 'None'}</div>
                    </td>

                    {/* Management Plan */}
                    <td className="py-3 px-3 text-xs max-w-[220px]">
                      <div className="text-emerald-300 line-clamp-2">{p.managementPlan}</div>
                    </td>

                    {/* Fasting / Diet */}
                    <td className="py-3 px-3 text-xs whitespace-nowrap">
                      {p.fastingStatus === 'npo' ? (
                        <span className="font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800 text-[10px]">
                          NPO {p.fastingSince ? `(${p.fastingSince})` : ''}
                        </span>
                      ) : (
                        <span className="text-slate-300 capitalize text-[11px]">
                          {p.fastingStatus.replace('_', ' ')}
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-right no-print">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBed(bed);
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold"
                      >
                        Chart
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
};
