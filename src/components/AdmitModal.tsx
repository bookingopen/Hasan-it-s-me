import React, { useState } from 'react';
import { Bed, Patient, PatientStatus, ROOMS, STATUS_CONFIG } from '../types/ward';
import { X, UserPlus, Flame, AlertCircle } from 'lucide-react';

interface AdmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBed: Bed | null;
  availableBeds: Bed[];
  onAdmit: (bedId: string, newPatient: Partial<Patient>) => void;
}

const SURGERY_PRESETS = [
  'Acute Suppurative Appendicitis with Localized Peritonitis',
  'Strangulated Right Inguinal Hernia',
  'Perforated Peptic Ulcer with Generalized Peritonitis',
  'Acute Calculous Cholecystitis (Tokyo Grade II)',
  'Adhesive Small Bowel Obstruction',
  'Perianal / Ischiorectal Abscess',
  'Mild Acute Biliary Pancreatitis',
  'Fournier’s Gangrene / Necrotizing Fasciitis',
  'Acute Diverticulitis (Hinchey Ia/Ib)',
  'Blunt Abdominal Trauma with Splenic Laceration'
];

export const AdmitModal: React.FC<AdmitModalProps> = ({
  isOpen,
  onClose,
  targetBed,
  availableBeds,
  onAdmit
}) => {
  if (!isOpen) return null;

  // Default to targetBed or first vacant bed
  const initialBedId = targetBed ? targetBed.id : (availableBeds[0]?.id || '');
  const [selectedBedId, setSelectedBedId] = useState<string>(initialBedId);

  const selectedBedObj = availableBeds.find((b) => b.id === selectedBedId) || targetBed;
  // Room gender hint
  const isFemaleRoom = selectedBedObj ? selectedBedObj.roomId >= 3 : false;

  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(30);
  const [sex, setSex] = useState<'M' | 'F'>(isFemaleRoom ? 'F' : 'M');
  const [mrn, setMrn] = useState(`SRG-${Math.floor(10000 + Math.random() * 90000)}`);
  const [status, setStatus] = useState<PatientStatus>('er_op_today');
  const [diagnosis, setDiagnosis] = useState(SURGERY_PRESETS[0]);
  const [operationName, setOperationName] = useState('');
  const [postOpDay, setPostOpDay] = useState('Pre-Op (ER)');
  const [currentComplaints, setCurrentComplaints] = useState('Severe abdominal pain, nausea, localized tenderness');
  const [managementPlan, setManagementPlan] = useState('Strict NPO, IV Antibiotics, IV fluid resuscitation, blood sent for crossmatch, call emergency OR');
  const [fastingSince, setFastingSince] = useState(
    new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  const handleBedSelect = (id: string) => {
    setSelectedBedId(id);
    const bed = availableBeds.find((b) => b.id === id);
    if (bed) {
      setSex(bed.roomId >= 3 ? 'F' : 'M');
    }
  };

  const handlePresetSelect = (preset: string) => {
    setDiagnosis(preset);
    if (preset.includes('Appendicitis')) {
      setOperationName('Emergency Laparoscopic Appendectomy');
      setCurrentComplaints('RLQ tenderness, vomiting, fever');
      setManagementPlan('Strict NPO, IV Ceftriaxone + Flagyl, fluid resuscitation, prepare for OR');
      setStatus('er_op_today');
    } else if (preset.includes('Hernia')) {
      setOperationName('Emergency Inguinal Herniotomy & Mesh Repair');
      setCurrentComplaints('Tense irreducible groin mass, exquisite tenderness, vomiting');
      setManagementPlan('Immediate NPO, NG tube, IV analgesia, blood crossmatch, emergency theater Cat 1');
      setStatus('er_op_today');
    } else if (preset.includes('Perforated')) {
      setOperationName('Emergency Exploratory Laparotomy & Omental Patch');
      setCurrentComplaints('Sudden board-like abdominal rigidity, severe epigastric pain 10/10');
      setManagementPlan('Immediate Cat 1 emergency OR, 2 large bore IVs, IV Meropenem + Omeprazole, Foley');
      setStatus('er_op_today');
    } else if (preset.includes('Pancreatitis')) {
      setOperationName('Conservative Medical Management');
      setCurrentComplaints('Epigastric pain radiating to back, nausea');
      setManagementPlan('Aggressive Plasmalyte hydration, IV analgesia, monitor urine output >0.5ml/kg/hr');
      setStatus('er_conservative');
      setPostOpDay('Non-Op');
    } else if (preset.includes('Obstruction')) {
      setOperationName('Drip & Suck (Conservative) vs Laparotomy');
      setCurrentComplaints('Colicky abdominal pain, distension, bilious vomiting');
      setManagementPlan('NPO, NG decompression, IV fluids, serial abdominal exams, Gastrografin protocol');
      setStatus('er_conservative');
      setPostOpDay('Non-Op');
    } else if (preset.includes('Abscess')) {
      setOperationName('Examination under Anesthesia & Incision & Drainage');
      setCurrentComplaints('Throbbing perianal pain, painful swelling');
      setManagementPlan('NPO for afternoon minor emergency OR list, IV Augmentin');
      setStatus('er_op_today');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBedId) return;

    const newPatient: Partial<Patient> = {
      name: name.trim(),
      age: Number(age),
      sex,
      mrn: mrn.trim(),
      status,
      diagnosis,
      operationName: operationName || undefined,
      postOpDay,
      currentComplaints,
      managementPlan,
      fastingStatus: 'npo',
      fastingSince,
      vitals: {
        bp: '125/80',
        hr: 90,
        temp: 37.8,
        spo2: 99,
        painScore: 7
      },
      emergencyORDetails: status === 'er_op_today' ? {
        priority: 'cat2_urgent',
        queuePosition: 1,
        fastingHoursChecked: true,
        consentSigned: true,
        bloodCrossmatched: false,
        anesthesiaEvaluated: false,
        antibioticsGiven: true,
        bookedTime: 'Today'
      } : undefined
    };

    onAdmit(selectedBedId, newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl text-slate-100 my-auto overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-rose-950/60 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-900/40">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Quick Admit to Surgical Ward
              </h2>
              <p className="text-xs text-rose-200">
                ER Call Day Intake · Syncs instantly to all team phones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Bed Selection */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
              Select Vacant Bed (32-Bed Ward):
            </label>
            <select
              value={selectedBedId}
              onChange={(e) => handleBedSelect(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 font-medium"
            >
              {availableBeds.length === 0 ? (
                <option value="">No vacant beds available!</option>
              ) : (
                availableBeds.map((bed) => (
                  <option key={bed.id} value={bed.id}>
                    Bed {bed.bedCode} — {bed.roomName} (Row {bed.row}, Col {bed.column})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Quick Presets for Surgical Emergencies */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
              Quick Surgical Emergency Presets:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SURGERY_PRESETS.slice(0, 6).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-700/80 text-xs text-slate-300 hover:text-white transition-all"
                >
                  {preset.split(' ')[0]} {preset.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          {/* Patient Demographic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                Patient Name:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                Age:
              </label>
              <input
                type="number"
                required
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                Sex:
              </label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as 'M' | 'F')}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="M">Male (Rooms 1 & 2)</option>
                <option value="F">Female (Rooms 3 & 4)</option>
              </select>
            </div>
          </div>

          {/* MRN & Category Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                Hospital MRN:
              </label>
              <input
                type="text"
                required
                value={mrn}
                onChange={(e) => setMrn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                Ward Category / Status:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PatientStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-rose-300"
              >
                <option value="er_op_today">🚨 ER Operation Today (Red)</option>
                <option value="er_conservative">⚠️ ER Conservative Mgt (Amber)</option>
                <option value="elective">📋 Elective Surgical List (Purple)</option>
                <option value="post_op_stable">✅ Post-Op Stable (Emerald)</option>
              </select>
            </div>
          </div>

          {/* Diagnosis & Op */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                Primary Diagnosis:
              </label>
              <input
                type="text"
                required
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                Planned Operation / Procedure:
              </label>
              <input
                type="text"
                value={operationName}
                onChange={(e) => setOperationName(e.target.value)}
                placeholder="e.g. Emergency Laparoscopic Appendectomy"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          {/* Current Complaints */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
              Current Complaints:
            </label>
            <input
              type="text"
              value={currentComplaints}
              onChange={(e) => setCurrentComplaints(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          {/* Initial Management Plan */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
              Immediate Management Plan:
            </label>
            <textarea
              rows={2}
              value={managementPlan}
              onChange={(e) => setManagementPlan(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          {/* Fasting Notice */}
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/80 flex items-center justify-between text-xs text-amber-200">
            <span>Fasting status will default to <strong>Strict NPO</strong> for ER call safety</span>
            <input
              type="text"
              value={fastingSince}
              onChange={(e) => setFastingSince(e.target.value)}
              placeholder="Since time"
              className="w-28 px-2 py-1 bg-slate-900 border border-amber-700/80 rounded text-xs text-white"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedBedId}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-900/40 active:scale-95 disabled:opacity-50 transition-all"
            >
              Confirm Admission
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
