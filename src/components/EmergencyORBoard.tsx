import React from 'react';
import { Bed, Patient, STATUS_CONFIG } from '../types/ward';
import { 
  Flame, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowUp, 
  ArrowDown, 
  Scissors, 
  AlertOctagon, 
  FileCheck, 
  ShieldAlert,
  Droplets,
  Stethoscope,
  ChevronRight,
  Plus
} from 'lucide-react';

interface EmergencyORBoardProps {
  beds: Bed[];
  onSelectBed: (bed: Bed) => void;
  onUpdatePatient: (bedId: string, updatedPatient: Patient) => void;
  onReorderQueue: (orderedPatientIds: string[]) => void;
  onAdmitERClick: () => void;
}

export const EmergencyORBoard: React.FC<EmergencyORBoardProps> = ({
  beds,
  onSelectBed,
  onUpdatePatient,
  onReorderQueue,
  onAdmitERClick
}) => {
  // Filter all beds that have ER Operation Today
  const erOpBeds = beds
    .filter((b) => b.patient && b.patient.status === 'er_op_today')
    .sort((a, b) => {
      const qA = a.patient?.emergencyORDetails?.queuePosition || 99;
      const qB = b.patient?.emergencyORDetails?.queuePosition || 99;
      return qA - qB;
    });

  // Filter Elective list patients for comparison
  const electiveBeds = beds.filter((b) => b.patient && b.patient.status === 'elective');

  // Filter ER Conservative patients
  const conservativeBeds = beds.filter((b) => b.patient && b.patient.status === 'er_conservative');

  const moveQueue = (index: number, direction: 'up' | 'down') => {
    const newBeds = [...erOpBeds];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBeds.length) return;

    const temp = newBeds[index];
    newBeds[index] = newBeds[targetIndex];
    newBeds[targetIndex] = temp;

    const orderedIds = newBeds.map((b) => b.patient!.id);
    onReorderQueue(orderedIds);
  };

  const toggleChecklist = (bed: Bed, field: 'fastingHoursChecked' | 'consentSigned' | 'bloodCrossmatched' | 'anesthesiaEvaluated' | 'antibioticsGiven') => {
    if (!bed.patient) return;
    const currentDetails = bed.patient.emergencyORDetails || {
      priority: 'cat2_urgent',
      fastingHoursChecked: false,
      consentSigned: false,
      bloodCrossmatched: false,
      anesthesiaEvaluated: false,
      antibioticsGiven: false
    };

    const updatedPatient: Patient = {
      ...bed.patient,
      emergencyORDetails: {
        ...currentDetails,
        [field]: !currentDetails[field]
      }
    };
    onUpdatePatient(bed.id, updatedPatient);
  };

  const handleMarkSurgeryCompleted = (bed: Bed) => {
    if (!bed.patient) return;
    const updatedPatient: Patient = {
      ...bed.patient,
      status: 'post_op_stable',
      postOpDay: 'POD #0 (Today)',
      operationName: bed.patient.operationName || `${bed.patient.diagnosis} (Emergency Op Done)`,
      managementPlan: `Immediate Post-Op Day 0: Monitor vitals Q1H x 4, IV fluids 100ml/hr, IV analgesia, keep NPO until fully awake`,
      emergencyORDetails: undefined
    };
    onUpdatePatient(bed.id, updatedPatient);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Call Day OR Summary */}
      <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/60 p-5 rounded-2xl border border-rose-800/80 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-900/50">
            <Flame className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Emergency Operating Theater (OR) Board
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-600 text-white font-extrabold uppercase">
                Active Call Queue
              </span>
            </h1>
            <p className="text-xs text-rose-200 mt-0.5">
              Live prioritized list for emergency cases on ER call day · Fasting timers, consent & crossmatch checklists
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAdmitERClick}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-md shadow-rose-900/30 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Emergency Case</span>
          </button>
        </div>
      </div>

      {/* Main Section: ER Operating List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              Emergency OR Queue ({erOpBeds.length} Cases Scheduled)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Order determines emergency theater sequence
          </span>
        </div>

        {erOpBeds.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h3 className="text-base font-bold text-white">No Emergency Operations Currently Queued</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              All surgical patients are currently post-op, managed conservatively, or elective.
              When an acute surgical abdomen or trauma arrives from ER, click "+ ER OR" on any bed to add them to this board.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {erOpBeds.map((bed, index) => {
              const patient = bed.patient!;
              const orDetails = patient.emergencyORDetails;
              const isFirst = index === 0;
              const isLast = index === erOpBeds.length - 1;

              return (
                <div
                  key={bed.id}
                  className="bg-slate-900 rounded-2xl border border-rose-500/70 p-4 sm:p-5 shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-rose-600" />

                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    
                    {/* Left: Queue Position, Bed, Patient Info */}
                    <div className="flex items-start gap-3.5">
                      {/* Priority Rank # */}
                      <div className="flex flex-col items-center justify-center w-12 h-14 rounded-xl bg-rose-600 text-white font-extrabold shadow-md shrink-0">
                        <span className="text-[10px] uppercase tracking-wider font-semibold opacity-90">OR</span>
                        <span className="text-xl font-mono">#{index + 1}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-white hover:underline cursor-pointer" onClick={() => onSelectBed(bed)}>
                            {patient.name}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {patient.age}y / {patient.sex}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-rose-300 font-mono text-xs font-bold">
                            Bed {bed.bedCode} ({bed.roomName.split(' ')[0]} {bed.roomName.split(' ')[1]})
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[11px]">
                            MRN: {patient.mrn}
                          </span>

                          {/* Priority Tier Badge */}
                          {orDetails?.priority === 'cat1_immediate' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white animate-pulse">
                              CAT 1: IMMEDIATE (&lt;1h)
                            </span>
                          )}
                          {orDetails?.priority === 'cat2_urgent' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950">
                              CAT 2: URGENT (&lt;4h)
                            </span>
                          )}
                          {orDetails?.priority === 'cat3_expedited' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                              CAT 3: EXPEDITED (&lt;24h)
                            </span>
                          )}
                        </div>

                        {/* Surgery Procedure & Diagnosis */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-rose-300">
                            {patient.operationName || 'Emergency Procedure TBD'}
                          </span>
                          <span className="text-xs text-slate-400">
                            for {patient.diagnosis}
                          </span>
                        </div>

                        {/* Current Complaints & Vitals */}
                        <div className="text-xs text-slate-300 flex flex-wrap items-center gap-3">
                          <span>
                            <strong className="text-slate-400">Complaints:</strong> {patient.currentComplaints}
                          </span>
                          {patient.vitals && (
                            <span className="font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                              BP: {patient.vitals.bp || '—'} · HR: {patient.vitals.hr || '—'} · SpO2: {patient.vitals.spo2 || '—'}% · Pain: {patient.vitals.painScore || '—'}/10
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Theater Readiness Checklist (Interactive Toggles) */}
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 flex flex-wrap items-center gap-2.5 text-xs">
                      
                      {/* Fasting (NPO) */}
                      <button
                        onClick={() => toggleChecklist(bed, 'fastingHoursChecked')}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                          orDetails?.fastingHoursChecked
                            ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800'
                            : 'bg-rose-950/40 text-rose-300 border-rose-800/80'
                        }`}
                        title="Click to toggle NPO fasting verification"
                      >
                        {orDetails?.fastingHoursChecked ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span>NPO: {patient.fastingSince ? `since ${patient.fastingSince}` : 'Verified'}</span>
                      </button>

                      {/* Consent */}
                      <button
                        onClick={() => toggleChecklist(bed, 'consentSigned')}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                          orDetails?.consentSigned
                            ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800'
                            : 'bg-rose-950/40 text-rose-300 border-rose-800/80'
                        }`}
                        title="Click to toggle consent status"
                      >
                        {orDetails?.consentSigned ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span>Consent Signed</span>
                      </button>

                      {/* Blood Crossmatch */}
                      <button
                        onClick={() => toggleChecklist(bed, 'bloodCrossmatched')}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                          orDetails?.bloodCrossmatched
                            ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800'
                            : 'bg-amber-950/40 text-amber-300 border-amber-800/80'
                        }`}
                        title="Click to toggle blood crossmatch status"
                      >
                        <Droplets className="w-3.5 h-3.5 text-rose-400" />
                        <span>Blood G&S: {orDetails?.bloodCrossmatched ? '2 Units Ready' : 'Pending'}</span>
                      </button>

                      {/* Anesthesia */}
                      <button
                        onClick={() => toggleChecklist(bed, 'anesthesiaEvaluated')}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                          orDetails?.anesthesiaEvaluated
                            ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                        title="Click to toggle anesthesia assessment"
                      >
                        <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Anesthesia: {orDetails?.anesthesiaEvaluated ? 'Cleared' : 'Pending'}</span>
                      </button>

                      {/* Pre-op Antibiotic */}
                      <button
                        onClick={() => toggleChecklist(bed, 'antibioticsGiven')}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                          orDetails?.antibioticsGiven
                            ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                        title="Click to toggle prophylactic antibiotics"
                      >
                        {orDetails?.antibioticsGiven ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>Antibiotic STAT</span>
                      </button>

                    </div>

                    {/* Right: Reorder Queue & Complete Operation Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                      {/* Move Up / Down Buttons */}
                      <div className="flex flex-col gap-1">
                        <button
                          disabled={isFirst}
                          onClick={() => moveQueue(index, 'up')}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300"
                          title="Move earlier in queue"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={isLast}
                          onClick={() => moveQueue(index, 'down')}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300"
                          title="Move later in queue"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Operation Finished Button */}
                      <button
                        onClick={() => handleMarkSurgeryCompleted(bed)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 rounded-lg transition-all"
                        title="Mark surgery finished and transfer to Post-Op Stable (POD #0)"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        <span>Op Finished (Set POD #0)</span>
                      </button>

                      {/* Full Chart */}
                      <button
                        onClick={() => onSelectBed(bed)}
                        className="px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg"
                      >
                        Chart
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cross-Reference Section: Elective & ER Conservative Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
        
        {/* ER Conservative Managed Today */}
        <div className="bg-slate-900/80 rounded-2xl border border-amber-800/60 p-4">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h3 className="text-sm font-bold text-white">
                ER Conservative Management Today ({conservativeBeds.length})
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80 uppercase">
              Non-Operative
            </span>
          </div>

          {conservativeBeds.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No patients on conservative emergency management.</p>
          ) : (
            <div className="space-y-2">
              {conservativeBeds.map((bed) => (
                <div
                  key={bed.id}
                  onClick={() => onSelectBed(bed)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 hover:border-amber-500/60 cursor-pointer transition-all flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{bed.patient?.name}</span>
                      <span className="text-slate-400 font-normal">({bed.patient?.age}y/{bed.patient?.sex})</span>
                      <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-950/80 px-1 rounded border border-amber-800">Bed {bed.bedCode}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 line-clamp-1">
                      {bed.patient?.diagnosis}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Elective Surgical List Today */}
        <div className="bg-slate-900/80 rounded-2xl border border-indigo-800/60 p-4">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
              <h3 className="text-sm font-bold text-white">
                Elective Surgical List ({electiveBeds.length})
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/80 uppercase">
              Elective OR
            </span>
          </div>

          {electiveBeds.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No elective list patients today.</p>
          ) : (
            <div className="space-y-2">
              {electiveBeds.map((bed) => (
                <div
                  key={bed.id}
                  onClick={() => onSelectBed(bed)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-indigo-500/30 hover:border-indigo-500/60 cursor-pointer transition-all flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{bed.patient?.name}</span>
                      <span className="text-slate-400 font-normal">({bed.patient?.age}y/{bed.patient?.sex})</span>
                      <span className="text-[10px] text-indigo-300 font-mono font-bold bg-indigo-950/80 px-1 rounded border border-indigo-800">Bed {bed.bedCode}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 line-clamp-1">
                      {bed.patient?.operationName || bed.patient?.diagnosis}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
