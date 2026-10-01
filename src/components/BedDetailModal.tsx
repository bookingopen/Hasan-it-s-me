import React, { useState } from 'react';
import { Bed, Patient, PatientStatus, STATUS_CONFIG, Vitals, FastingStatus } from '../types/ward';
import { 
  X, 
  Flame, 
  Save, 
  UserMinus, 
  ArrowRightLeft, 
  Clock, 
  UtensilsCrossed, 
  HeartPulse, 
  Check, 
  AlertCircle,
  FileCheck,
  Droplet,
  Stethoscope
} from 'lucide-react';

interface BedDetailModalProps {
  bed: Bed | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bedId: string, updatedPatient: Patient) => void;
  onDischarge: (bedId: string) => void;
  onOpenSwap: (bed: Bed) => void;
}

const SURGERY_PRESETS = [
  'Acute Suppurative Appendicitis with Localized Peritonitis',
  'Strangulated Inguinal Hernia with Bowel Compromise',
  'Perforated Peptic Ulcer with Generalized Peritonitis',
  'Acute Calculous Cholecystitis (Tokyo Guidelines Grade II)',
  'Adhesive Small Bowel Obstruction',
  'Acute Perianal Abscess for Incision & Drainage',
  'Mild Acute Biliary Pancreatitis',
  'Fournier’s Gangrene / Necrotizing Soft Tissue Infection',
  'Large Bowel Obstruction secondary to Colorectal Neoplasm',
  'Blunt Abdominal Trauma with Hemoperitoneum'
];

const COMPLAINT_TAGS = [
  'Severe Abdominal Pain',
  'High Fever / Chills',
  'Bilious Vomiting',
  'Abdominal Distension',
  'Obstipation / No Flatus',
  'Wound Soakage / Bleeding',
  'Shoulder Tip Gas Pain',
  'Passed Flatus & Stool',
  'Tolerating Oral Diet'
];

const PLAN_TAGS = [
  'Keep Strict NPO',
  'IV Ceftriaxone 1g + Metronidazole 500mg',
  'IV Fluids 125 mL/hr',
  'Crossmatch 2 Units PRBC',
  'Call Emergency OR Booking',
  'Serial Abdominal Exams Q4H',
  'Gastrografin Challenge Protocol',
  'Pull Surgical Drain if <50ml',
  'Advance Diet to Sips',
  'Discharge Home with Clinic Followup'
];

export const BedDetailModal: React.FC<BedDetailModalProps> = ({
  bed,
  isOpen,
  onClose,
  onSave,
  onDischarge,
  onOpenSwap
}) => {
  if (!isOpen || !bed || !bed.patient) return null;

  const [patient, setPatient] = useState<Patient>({ ...bed.patient });
  const [activeTab, setActiveTab] = useState<'clinical' | 'emergency_or' | 'vitals'>('clinical');

  const statusConfig = STATUS_CONFIG[patient.status];

  const handleStatusChange = (newStatus: PatientStatus) => {
    let emergencyDetails = patient.emergencyORDetails;
    if (newStatus === 'er_op_today' && !emergencyDetails) {
      emergencyDetails = {
        priority: 'cat2_urgent',
        queuePosition: 1,
        fastingHoursChecked: patient.fastingStatus === 'npo',
        consentSigned: false,
        bloodCrossmatched: false,
        anesthesiaEvaluated: false,
        antibioticsGiven: false
      };
    }

    setPatient({
      ...patient,
      status: newStatus,
      emergencyORDetails: emergencyDetails
    });
  };

  const handleVitalsChange = (field: keyof Vitals, value: any) => {
    setPatient({
      ...patient,
      vitals: {
        ...(patient.vitals || {}),
        [field]: value
      }
    });
  };

  const appendComplaintTag = (tag: string) => {
    const existing = patient.currentComplaints.trim();
    if (!existing) {
      setPatient({ ...patient, currentComplaints: tag });
    } else if (!existing.includes(tag)) {
      setPatient({ ...patient, currentComplaints: `${existing}, ${tag}` });
    }
  };

  const appendPlanTag = (tag: string) => {
    const existing = patient.managementPlan.trim();
    if (!existing) {
      setPatient({ ...patient, managementPlan: tag });
    } else if (!existing.includes(tag)) {
      setPatient({ ...patient, managementPlan: `${existing}, ${tag}` });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(bed.id, patient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl text-slate-100 my-auto overflow-hidden">
        
        {/* Header with Bed info & Status Color Ribbon */}
        <div className={`p-4 sm:p-5 border-b border-slate-800 ${statusConfig.cardBg} flex items-start justify-between gap-3`}>
          <div className="flex items-center gap-3">
            <span className="w-12 h-10 rounded-xl bg-slate-950 border border-slate-700 font-mono text-base font-extrabold flex items-center justify-center text-white">
              {bed.bedCode}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {patient.name}
                </h2>
                <span className="text-xs text-slate-400">
                  ({patient.age}y / {patient.sex})
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${statusConfig.badgeBg} ${statusConfig.badgeText}`}>
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Bed <strong className="text-white font-mono">{bed.bedCode}</strong> · {bed.roomName} (Row {bed.row}, Col {bed.column}) · MRN: <span className="font-mono text-slate-300">{patient.mrn}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenSwap(bed)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Transfer to another bed"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('clinical')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'clinical'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Clinical Chart & Plan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('emergency_or')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'emergency_or'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Emergency OR Details</span>
            {patient.status === 'er_op_today' && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vitals')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'vitals'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            <span>Vitals, Drains & I/O</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* TAB 1: Clinical Chart & Plan */}
          {activeTab === 'clinical' && (
            <div className="space-y-4">
              
              {/* Status Color Selection (Crucial User Requirement) */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                  Patient Category & Color Classification:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  
                  {/* ER Op Today */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange('er_op_today')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      patient.status === 'er_op_today'
                        ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-rose-300">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      ER Op Today
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Emergency surgery required</p>
                  </button>

                  {/* ER Conservative */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange('er_conservative')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      patient.status === 'er_conservative'
                        ? 'bg-amber-950/80 border-amber-500 ring-2 ring-amber-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      ER Conservative
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Non-operative management</p>
                  </button>

                  {/* Elective List */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange('elective')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      patient.status === 'elective'
                        ? 'bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      Elective List
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Planned elective admission</p>
                  </button>

                  {/* Post-Op Stable */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange('post_op_stable')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      patient.status === 'post_op_stable'
                        ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Post-Op Stable
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Recovering post-procedure</p>
                  </button>

                  {/* Discharge Ready */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange('discharge_ready')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      patient.status === 'discharge_ready'
                        ? 'bg-teal-950/80 border-teal-500 ring-2 ring-teal-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-teal-300">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      Discharge Ready
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Medically fit for home</p>
                  </button>

                </div>
              </div>

              {/* Diagnosis Field + Presets */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                  Primary Surgical Diagnosis:
                </label>
                <input
                  type="text"
                  required
                  value={patient.diagnosis}
                  onChange={(e) => setPatient({ ...patient, diagnosis: e.target.value })}
                  placeholder="e.g. Acute Appendicitis with Localized Peritonitis"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
                
                {/* Presets Chips */}
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  <span className="text-[10px] text-slate-500 font-semibold mr-1">Quick Select:</span>
                  {SURGERY_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPatient({ ...patient, diagnosis: preset })}
                      className="px-2 py-0.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded text-[10px] transition-colors truncate max-w-[200px]"
                      title={preset}
                    >
                      {preset.split(' ')[0]} {preset.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Operation Done / Planned + Post-Op Day */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Operation Done / Planned Procedure:
                  </label>
                  <input
                    type="text"
                    value={patient.operationName || ''}
                    onChange={(e) => setPatient({ ...patient, operationName: e.target.value })}
                    placeholder="e.g. Emergency Laparoscopic Appendectomy"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Post-Op Day (POD):
                  </label>
                  <select
                    value={patient.postOpDay}
                    onChange={(e) => setPatient({ ...patient, postOpDay: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Pre-Op (ER)">Pre-Op (ER Urgent)</option>
                    <option value="Pre-Op (Elective)">Pre-Op (Elective)</option>
                    <option value="POD #0">POD #0 (Day of Surgery)</option>
                    <option value="POD #1">POD #1</option>
                    <option value="POD #2">POD #2</option>
                    <option value="POD #3">POD #3</option>
                    <option value="POD #4+">POD #4 or later</option>
                    <option value="Non-Op">Non-Operative / Conservative</option>
                  </select>
                </div>
              </div>

              {/* Current Complaints */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Current Complaints:
                  </label>
                  <span className="text-[11px] text-slate-500">Tap tags below to append</span>
                </div>
                <textarea
                  rows={2}
                  value={patient.currentComplaints}
                  onChange={(e) => setPatient({ ...patient, currentComplaints: e.target.value })}
                  placeholder="e.g. Sharp RLQ tenderness 8/10, vomiting x 2, migrating pain"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
                <div className="mt-1 flex flex-wrap gap-1">
                  {COMPLAINT_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => appendComplaintTag(tag)}
                      className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-[10px] transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Management Plan */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Surgical Management Plan:
                  </label>
                  <span className="text-[11px] text-slate-500">Tap orders below to append</span>
                </div>
                <textarea
                  rows={3}
                  value={patient.managementPlan}
                  onChange={(e) => setPatient({ ...patient, managementPlan: e.target.value })}
                  placeholder="e.g. Strict NPO, IV Ceftriaxone 1g + Metronidazole 500mg, IV fluids 125ml/h, emergency OR call"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
                <div className="mt-1 flex flex-wrap gap-1">
                  {PLAN_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => appendPlanTag(tag)}
                      className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-slate-800 text-[10px] transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diet / Fasting Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1 flex items-center gap-1.5">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
                    Fasting / Diet Status:
                  </label>
                  <select
                    value={patient.fastingStatus}
                    onChange={(e) => setPatient({ ...patient, fastingStatus: e.target.value as FastingStatus })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="npo">Strict NPO (Nil Per Os - Fasting)</option>
                    <option value="sips">Sips of Water Only</option>
                    <option value="clear_fluids">Clear Liquids</option>
                    <option value="soft_diet">Soft / Low Residue Diet</option>
                    <option value="regular">Regular General Diet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Fasting Since (Time):
                  </label>
                  <input
                    type="text"
                    value={patient.fastingSince || ''}
                    onChange={(e) => setPatient({ ...patient, fastingSince: e.target.value })}
                    placeholder="e.g. 02:00 or Yesterday 22:00"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Emergency OR Board Details */}
          {activeTab === 'emergency_or' && (
            <div className="space-y-4">
              <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl text-xs text-rose-200">
                Configure emergency theater list priority, consent, blood crossmatch, and anesthesia readiness.
              </div>

              {/* Priority Category */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                  Emergency Triage Priority Tier:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  
                  <button
                    type="button"
                    onClick={() => setPatient({
                      ...patient,
                      emergencyORDetails: {
                        ...(patient.emergencyORDetails || { fastingHoursChecked: true, consentSigned: false, bloodCrossmatched: false, anesthesiaEvaluated: false, antibioticsGiven: false }),
                        priority: 'cat1_immediate'
                      }
                    })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      patient.emergencyORDetails?.priority === 'cat1_immediate'
                        ? 'bg-red-950/80 border-red-500 ring-2 ring-red-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-extrabold text-red-400">CATEGORY 1: IMMEDIATE</div>
                    <div className="text-[11px] text-slate-300 mt-0.5">Threat to life/limb (&lt;1 hour)</div>
                    <div className="text-[10px] text-slate-500 mt-1">Peritonitis, strangulated hernia, hemorrhage</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPatient({
                      ...patient,
                      emergencyORDetails: {
                        ...(patient.emergencyORDetails || { fastingHoursChecked: true, consentSigned: false, bloodCrossmatched: false, anesthesiaEvaluated: false, antibioticsGiven: false }),
                        priority: 'cat2_urgent'
                      }
                    })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      patient.emergencyORDetails?.priority === 'cat2_urgent'
                        ? 'bg-amber-950/80 border-amber-500 ring-2 ring-amber-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-extrabold text-amber-400">CATEGORY 2: URGENT</div>
                    <div className="text-[11px] text-slate-300 mt-0.5">Operate within 4 hours</div>
                    <div className="text-[10px] text-slate-500 mt-1">Acute appendicitis, closed loop SBO</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPatient({
                      ...patient,
                      emergencyORDetails: {
                        ...(patient.emergencyORDetails || { fastingHoursChecked: true, consentSigned: false, bloodCrossmatched: false, anesthesiaEvaluated: false, antibioticsGiven: false }),
                        priority: 'cat3_expedited'
                      }
                    })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      patient.emergencyORDetails?.priority === 'cat3_expedited'
                        ? 'bg-blue-950/80 border-blue-500 ring-2 ring-blue-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-extrabold text-blue-400">CATEGORY 3: EXPEDITED</div>
                    <div className="text-[11px] text-slate-300 mt-0.5">Operate within 12–24 hours</div>
                    <div className="text-[10px] text-slate-500 mt-1">Perianal abscess, stable tissue infections</div>
                  </button>

                </div>
              </div>

              {/* Theater Checklist */}
              <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-2">
                  Emergency Pre-Op Readiness Checklist:
                </span>

                <label className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={patient.emergencyORDetails?.fastingHoursChecked || false}
                    onChange={(e) => setPatient({
                      ...patient,
                      emergencyORDetails: {
                        ...(patient.emergencyORDetails || { priority: 'cat2_urgent', consentSigned: false, bloodCrossmatched: false, anesthesiaEvaluated: false, antibioticsGiven: false }),
                        fastingHoursChecked: e.target.checked
                      }
                    })}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-white">NPO Fasting Status Verified</span>
                    <p className="text-[11px] text-slate-400">At least 6 hours for solids / 2 hours clear fluids</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={patient.emergencyORDetails?.consentSigned || false}
                    onChange={(e) => setPatient({
                      ...patient,
                      emergencyORDetails: {
                        ...(patient.emergencyORDetails || { priority: 'cat2_urgent', fastingHoursChecked: true, bloodCrossmatched: false, anesthesiaEvaluated: false, antibioticsGiven: false }),
                        consentSigned: e.target.checked
                      }
                    })}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-white">Informed Surgical Consent Signed</span>
                    <p className="text-[11px] text-slate-400">Consent form on physical chart / electronic EHR</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={patient.emergencyORDetails?.bloodCrossmatched || false}
                    onChange={(e) => setPatient({
                      ...patient,
                      emergencyORDetails: {
                        ...(patient.emergencyORDetails || { priority: 'cat2_urgent', fastingHoursChecked: true, consentSigned: false, anesthesiaEvaluated: false, antibioticsGiven: false }),
                        bloodCrossmatched: e.target.checked
                      }
                    })}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-white">Blood Group & Screen / Crossmatch Ready</span>
                    <p className="text-[11px] text-slate-400">Blood bank units reserved in refrigerator</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={patient.emergencyORDetails?.anesthesiaEvaluated || false}
                    onChange={(e) => setPatient({
                      ...patient,
                      emergencyORDetails: {
                        ...(patient.emergencyORDetails || { priority: 'cat2_urgent', fastingHoursChecked: true, consentSigned: false, bloodCrossmatched: false, antibioticsGiven: false }),
                        anesthesiaEvaluated: e.target.checked
                      }
                    })}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-white">Anesthesia Consult & Airway Evaluated</span>
                    <p className="text-[11px] text-slate-400">On-call anesthetist notified & patient cleared</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={patient.emergencyORDetails?.antibioticsGiven || false}
                    onChange={(e) => setPatient({
                      ...patient,
                      emergencyORDetails: {
                        ...(patient.emergencyORDetails || { priority: 'cat2_urgent', fastingHoursChecked: true, consentSigned: false, bloodCrossmatched: false, anesthesiaEvaluated: false }),
                        antibioticsGiven: e.target.checked
                      }
                    })}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-white">Prophylactic Antibiotics Administered / Charted</span>
                    <p className="text-[11px] text-slate-400">Given within 60 mins before incision</p>
                  </div>
                </label>
              </div>

              {/* Theater Room & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Emergency Theater Assigned:
                  </label>
                  <input
                    type="text"
                    value={patient.emergencyORDetails?.otRoom || ''}
                    onChange={(e) => setPatient({
                      ...patient,
                      emergencyORDetails: {
                        ...(patient.emergencyORDetails || { priority: 'cat2_urgent', fastingHoursChecked: true, consentSigned: false, bloodCrossmatched: false, anesthesiaEvaluated: false, antibioticsGiven: false }),
                        otRoom: e.target.value
                      }
                    })}
                    placeholder="e.g. Emergency OR 1 or Minor OT"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Booked / Target Time:
                  </label>
                  <input
                    type="text"
                    value={patient.emergencyORDetails?.bookedTime || ''}
                    onChange={(e) => setPatient({
                      ...patient,
                      emergencyORDetails: {
                        ...(patient.emergencyORDetails || { priority: 'cat2_urgent', fastingHoursChecked: true, consentSigned: false, bloodCrossmatched: false, anesthesiaEvaluated: false, antibioticsGiven: false }),
                        bookedTime: e.target.value
                      }
                    })}
                    placeholder="e.g. 11:30 AM"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: Vitals, Drains & I/O */}
          {activeTab === 'vitals' && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block">
                Bedside Vitals & Nursing Chart:
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">BP (mmHg)</label>
                  <input
                    type="text"
                    value={patient.vitals?.bp || ''}
                    onChange={(e) => handleVitalsChange('bp', e.target.value)}
                    placeholder="120/80"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Pulse (bpm)</label>
                  <input
                    type="number"
                    value={patient.vitals?.hr || ''}
                    onChange={(e) => handleVitalsChange('hr', Number(e.target.value))}
                    placeholder="84"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={patient.vitals?.temp || ''}
                    onChange={(e) => handleVitalsChange('temp', Number(e.target.value))}
                    placeholder="37.8"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    value={patient.vitals?.spo2 || ''}
                    onChange={(e) => handleVitalsChange('spo2', Number(e.target.value))}
                    placeholder="99"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Pain (0–10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={patient.vitals?.painScore ?? ''}
                    onChange={(e) => handleVitalsChange('painScore', Number(e.target.value))}
                    placeholder="7"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white"
                  />
                </div>
              </div>

              {/* Drains & Output */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Surgical Drain Output (24h):
                  </label>
                  <input
                    type="text"
                    value={patient.drainOutput || ''}
                    onChange={(e) => setPatient({ ...patient, drainOutput: e.target.value })}
                    placeholder="e.g. JP Drain: 85ml serosanguinous"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Urine Output & Catheter:
                  </label>
                  <input
                    type="text"
                    value={patient.urineOutput || ''}
                    onChange={(e) => setPatient({ ...patient, urineOutput: e.target.value })}
                    placeholder="e.g. 50 ml/hr clear via Foley"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              {/* Fluids & Antibiotics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Active IV Fluids:
                  </label>
                  <input
                    type="text"
                    value={patient.ivFluids || ''}
                    onChange={(e) => setPatient({ ...patient, ivFluids: e.target.value })}
                    placeholder="e.g. Normal Saline 0.9% @ 125 mL/hr"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Antibiotics & Known Allergies:
                  </label>
                  <input
                    type="text"
                    value={patient.antibiotics || ''}
                    onChange={(e) => setPatient({ ...patient, antibiotics: e.target.value })}
                    placeholder="e.g. IV Ceftriaxone + Flagyl (Allergy: NKDA)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

            </div>
          )}

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-800 gap-3">
            <button
              type="button"
              onClick={() => {
                if (confirm(`Discharge / vacate Bed ${bed.bedNumber}? This will mark the bed as empty and available for incoming ER admissions.`)) {
                  onDischarge(bed.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-950/80 border border-rose-900/60 transition-colors"
            >
              <UserMinus className="w-4 h-4" />
              <span>Discharge / Vacate Bed</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-900/40 active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Patient Chart</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
