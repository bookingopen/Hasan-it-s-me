import React, { useState } from 'react';
import { Bed, Patient, WardState, ROOMS } from '../types/ward';
import { X, Copy, Check, Printer, Users, ShieldAlert, Sparkles } from 'lucide-react';

interface SBARHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  wardState: WardState;
}

export const SBARHandoverModal: React.FC<SBARHandoverModalProps> = ({
  isOpen,
  onClose,
  wardState
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);

  const beds = wardState.beds;
  const occupiedBeds = beds.filter((b) => b.patient !== null);
  const erOpBeds = beds.filter((b) => b.patient?.status === 'er_op_today');
  const conservativeBeds = beds.filter((b) => b.patient?.status === 'er_conservative');
  const electiveBeds = beds.filter((b) => b.patient?.status === 'elective');
  const postOpBeds = beds.filter((b) => b.patient?.status === 'post_op_stable');
  const dischargeBeds = beds.filter((b) => b.patient?.status === 'discharge_ready');
  const vacantBeds = beds.filter((b) => b.patient === null);

  // Male / Female vacant
  const maleVacant = vacantBeds.filter((b) => b.roomId <= 2).length;
  const femaleVacant = vacantBeds.filter((b) => b.roomId >= 3).length;

  const generateMarkdownHandover = () => {
    let text = `🏥 *SURGICAL WARD ON-CALL HANDOVER (SBAR)*\n`;
    text += `📅 Date: ${wardState.shiftDate} | Ward: 32 Beds (4 Rooms)\n`;
    text += `👨‍⚕️ Team: Cons: ${wardState.onCallTeam.consultant} | Reg: ${wardState.onCallTeam.registrar} | Res: ${wardState.onCallTeam.resident}\n\n`;

    text += `🚨 *SITUATION:*\n`;
    text += `• Total Beds Occupied: ${occupiedBeds.length}/32 (${vacantBeds.length} Vacant: ${maleVacant} Male, ${femaleVacant} Female)\n`;
    text += `• Emergency OR Pending: ${erOpBeds.length} Cases\n`;
    text += `• ER Conservative: ${conservativeBeds.length} Cases\n`;
    text += `• Elective List: ${electiveBeds.length} Patients\n`;
    text += `• Post-Op Stable: ${postOpBeds.length} Patients\n\n`;

    text += `🔥 *EMERGENCY OR CASES PENDING TODAY:*\n`;
    if (erOpBeds.length === 0) {
      text += `None currently queued.\n\n`;
    } else {
      erOpBeds.forEach((b, i) => {
        const p = b.patient!;
        text += `${i + 1}. [Bed ${b.bedCode} - Room ${b.roomCode}] ${p.name} (${p.age}y/${p.sex}, ${p.mrn})\n`;
        text += `   • Diagnosis: ${p.diagnosis}\n`;
        text += `   • Procedure: ${p.operationName || 'Emergency Surgery'}\n`;
        text += `   • Diet: ${p.fastingStatus.toUpperCase()} ${p.fastingSince ? `(since ${p.fastingSince})` : ''}\n`;
        text += `   • Complaints: ${p.currentComplaints}\n`;
        text += `   • Plan: ${p.managementPlan}\n\n`;
      });
    }

    text += `⚠️ *ER CONSERVATIVE CASES:*\n`;
    conservativeBeds.forEach((b) => {
      const p = b.patient!;
      text += `• Bed ${b.bedCode} (Room ${b.roomCode}): ${p.name} (${p.diagnosis}) — Plan: ${p.managementPlan}\n`;
    });
    text += `\n`;

    text += `✅ *POST-OP PATIENTS FOR MONITORING:*\n`;
    postOpBeds.forEach((b) => {
      const p = b.patient!;
      text += `• Bed ${b.bedCode} (Room ${b.roomCode}): ${p.name} (${p.postOpDay} ${p.operationName || p.diagnosis}) — ${p.managementPlan}\n`;
    });

    return text;
  };

  const handleCopy = () => {
    const text = generateMarkdownHandover();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl text-slate-100 my-auto overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-900/40">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                SBAR Shift Handover & Call Report
              </h2>
              <p className="text-xs text-slate-400">
                Situation · Background · Assessment · Recommendation & Plan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Report</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/30"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy for WhatsApp / Slack'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Handover Sheet Preview */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-slate-900 text-xs">
          
          {/* Situation Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-rose-400 uppercase tracking-wider">
                1. SITUATION (Ward Census)
              </h3>
              <span className="font-mono text-slate-400">{wardState.shiftDate}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
              <div>
                <span className="text-slate-500 block text-[11px]">Total Occupancy:</span>
                <strong className="text-white text-sm font-mono">{occupiedBeds.length} / 32 Beds</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Vacant ER Capacity:</span>
                <strong className="text-emerald-400 text-sm font-mono">{vacantBeds.length} Available</strong>
                <span className="text-[10px] text-slate-400 block">({maleVacant} Male, {femaleVacant} Female)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Emergency OR Queued:</span>
                <strong className="text-rose-400 text-sm font-mono">{erOpBeds.length} Urgent Operations</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">ER Conservative:</span>
                <strong className="text-amber-400 text-sm font-mono">{conservativeBeds.length} Patients</strong>
              </div>
            </div>
          </div>

          {/* Background / Room Breakdown */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-blue-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              2. BACKGROUND (Room Breakdown)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROOMS.map((room) => {
                const roomBeds = beds.filter((b) => b.roomId === room.id);
                const occ = roomBeds.filter((b) => b.patient !== null).length;
                return (
                  <div key={room.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{room.name}</span>
                      <span className="font-mono text-[11px] text-slate-400">{occ}/8 Beds Occupied</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{room.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assessment / Critical Emergency OR List */}
          <div className="bg-slate-950 p-4 rounded-xl border border-rose-900/50 space-y-3">
            <h3 className="font-bold text-sm text-rose-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              3. ASSESSMENT — EMERGENCY OR CASES (URGENT CALL LIST)
            </h3>
            {erOpBeds.length === 0 ? (
              <p className="text-slate-400 italic">No emergency operations currently scheduled.</p>
            ) : (
              <div className="space-y-2">
                {erOpBeds.map((bed, idx) => {
                  const p = bed.patient!;
                  return (
                    <div key={bed.id} className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">
                          #{idx + 1}. Bed {bed.bedCode} ({bed.roomName}) — {p.name} ({p.age}y/{p.sex})
                        </span>
                        <span className="font-mono text-[11px] text-rose-300 font-bold">
                          MRN: {p.mrn} · {p.emergencyORDetails?.priority ? p.emergencyORDetails.priority.replace('_', ' ').toUpperCase() : 'URGENT'}
                        </span>
                      </div>
                      <div className="text-slate-300">
                        <strong className="text-rose-300">Procedure: </strong> {p.operationName || 'Emergency Operation'} for {p.diagnosis}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        <strong>Complaints: </strong> {p.currentComplaints}
                      </div>
                      <div className="text-emerald-300 text-[11px]">
                        <strong>Plan: </strong> {p.managementPlan}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Plan */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              4. RECOMMENDATION & ACTIVE PLAN FOR INCOMING TEAM
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
              <li>Liaise with Operating Theater coordinator for slot allocation for the {erOpBeds.length} emergency cases.</li>
              <li>Maintain strict NPO on all pre-op emergency patients; ensure active IV lines and maintenance crystalloids running.</li>
              <li>Serial abdominal exams on conservative SBO (Bed 5) and pancreatitis patients every 4 hours.</li>
              <li>Keep {maleVacant} male beds and {femaleVacant} female beds prepped and sanitized for incoming night ER call admissions.</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
