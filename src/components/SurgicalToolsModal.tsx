import React, { useState } from 'react';
import { X, Calculator, Activity, Clock, Droplets, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SurgicalToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SurgicalToolsModal: React.FC<SurgicalToolsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'alvarado' | 'tokyo' | 'fasting' | 'fluids'>('alvarado');

  // Alvarado State
  const [alvarado, setAlvarado] = useState({
    migratory: false,
    anorexia: false,
    nausea: false,
    rlqTenderness: false,
    rebound: false,
    elevatedTemp: false,
    leukocytosis: false,
    leftShift: false
  });

  const alvaradoScore =
    (alvarado.migratory ? 1 : 0) +
    (alvarado.anorexia ? 1 : 0) +
    (alvarado.nausea ? 1 : 0) +
    (alvarado.rlqTenderness ? 2 : 0) +
    (alvarado.rebound ? 1 : 0) +
    (alvarado.elevatedTemp ? 1 : 0) +
    (alvarado.leukocytosis ? 2 : 0) +
    (alvarado.leftShift ? 1 : 0);

  // Fasting State
  const [mealType, setMealType] = useState<'clears' | 'light' | 'heavy'>('light');
  const [mealTime, setMealTime] = useState('04:00');

  // IV Fluids State (4-2-1 Rule)
  const [weightKg, setWeightKg] = useState<number>(70);
  const hourlyRate =
    weightKg <= 10
      ? weightKg * 4
      : weightKg <= 20
      ? 40 + (weightKg - 10) * 2
      : 60 + (weightKg - 20) * 1;
  const dailyTotal = hourlyRate * 24;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl text-slate-100 my-auto overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-900/40">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Surgical On-Call Clinical Calculators
              </h2>
              <p className="text-xs text-slate-400">
                Alvarado Appendicitis · Tokyo Cholecystitis · NPO Timer · IV Fluids
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/80 px-4 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('alvarado')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'alvarado' ? 'border-rose-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Alvarado (Appendicitis)
          </button>
          <button
            onClick={() => setActiveTab('tokyo')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'tokyo' ? 'border-rose-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Tokyo TG18 (Cholecystitis)
          </button>
          <button
            onClick={() => setActiveTab('fasting')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'fasting' ? 'border-rose-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            NPO Fasting Rules
          </button>
          <button
            onClick={() => setActiveTab('fluids')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'fluids' ? 'border-rose-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            IV Fluids (4-2-1 Rule)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4 text-xs">
          
          {/* 1. Alvarado Score */}
          {activeTab === 'alvarado' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 font-medium">Alvarado Score Total:</span>
                  <div className="text-2xl font-mono font-extrabold text-white">
                    {alvaradoScore} <span className="text-sm font-normal text-slate-400">/ 10</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    alvaradoScore >= 7
                      ? 'bg-rose-600 text-white'
                      : alvaradoScore >= 5
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {alvaradoScore >= 7
                      ? 'High Probability (Surgery Indicated)'
                      : alvaradoScore >= 5
                      ? 'Equivocal (Admit & CT / Serial Exams)'
                      : 'Low Probability (Unlikely)'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <span>Migratory right iliac fossa pain</span>
                  <input
                    type="checkbox"
                    checked={alvarado.migratory}
                    onChange={(e) => setAlvarado({ ...alvarado, migratory: e.target.checked })}
                    className="w-4 h-4 text-rose-600"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <span>Anorexia (Loss of appetite)</span>
                  <input
                    type="checkbox"
                    checked={alvarado.anorexia}
                    onChange={(e) => setAlvarado({ ...alvarado, anorexia: e.target.checked })}
                    className="w-4 h-4 text-rose-600"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <span>Nausea or vomiting</span>
                  <input
                    type="checkbox"
                    checked={alvarado.nausea}
                    onChange={(e) => setAlvarado({ ...alvarado, nausea: e.target.checked })}
                    className="w-4 h-4 text-rose-600"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-rose-900/60 cursor-pointer">
                  <span className="font-bold text-rose-300">Tenderness in right lower quadrant (+2 pts)</span>
                  <input
                    type="checkbox"
                    checked={alvarado.rlqTenderness}
                    onChange={(e) => setAlvarado({ ...alvarado, rlqTenderness: e.target.checked })}
                    className="w-4 h-4 text-rose-600"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <span>Rebound tenderness in RLQ</span>
                  <input
                    type="checkbox"
                    checked={alvarado.rebound}
                    onChange={(e) => setAlvarado({ ...alvarado, rebound: e.target.checked })}
                    className="w-4 h-4 text-rose-600"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <span>Elevated temperature (≥ 37.3°C / 99.1°F)</span>
                  <input
                    type="checkbox"
                    checked={alvarado.elevatedTemp}
                    onChange={(e) => setAlvarado({ ...alvarado, elevatedTemp: e.target.checked })}
                    className="w-4 h-4 text-rose-600"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-rose-900/60 cursor-pointer">
                  <span className="font-bold text-rose-300">Leukocytosis &gt; 10,000/μL (+2 pts)</span>
                  <input
                    type="checkbox"
                    checked={alvarado.leukocytosis}
                    onChange={(e) => setAlvarado({ ...alvarado, leukocytosis: e.target.checked })}
                    className="w-4 h-4 text-rose-600"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <span>Neutrophilic left shift (Neutrophils &gt; 75%)</span>
                  <input
                    type="checkbox"
                    checked={alvarado.leftShift}
                    onChange={(e) => setAlvarado({ ...alvarado, leftShift: e.target.checked })}
                    className="w-4 h-4 text-rose-600"
                  />
                </label>
              </div>
            </div>
          )}

          {/* 2. Tokyo Guidelines (Cholecystitis) */}
          {activeTab === 'tokyo' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-sm text-amber-400">Tokyo Guidelines 2018 (TG18) Severity:</h3>
                
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-bold text-white">Grade I (Mild Acute Cholecystitis):</div>
                  <p className="text-slate-400 mt-1">
                    No organ dysfunction, mild gallbladder inflammation only. Recommended: Early laparoscopic cholecystectomy within 72 hours of symptom onset.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/80">
                  <div className="font-bold text-amber-300">Grade II (Moderate Acute Cholecystitis):</div>
                  <p className="text-slate-300 mt-1">
                    Any of: Elevated WBC (&gt;18,000), palpable tender RUQ mass, duration of complaints &gt;72 hours, marked local inflammation (gangrenous cholecystitis, biliary peritonitis, pericholecystic abscess).
                  </p>
                  <p className="text-amber-400 font-semibold mt-1">Recommended: Early laparoscopic cholecystectomy by experienced surgeon OR percutaneous cholecystostomy.</p>
                </div>

                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800">
                  <div className="font-bold text-rose-300">Grade III (Severe Acute Cholecystitis):</div>
                  <p className="text-slate-300 mt-1">
                    Organ dysfunction in ANY system: Cardiovascular (hypotension requiring dopamine/norepi), Neurological (GCS drop), Respiratory (PaO2/FiO2 &lt;300), Renal (Cr &gt;2.0), Hepatic (INR &gt;1.5), Hematological (Platelets &lt;100k).
                  </p>
                  <p className="text-rose-400 font-semibold mt-1">Recommended: ICU admission, organ support, urgent gallbladder drainage (percutaneous transhepatic cholecystostomy).</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. Fasting Guidelines */}
          {activeTab === 'fasting' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-sm text-cyan-400">ASA Pre-Operative Fasting Criteria:</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-emerald-400 text-sm block">2 Hours:</strong>
                    <span className="text-slate-300">Clear liquids only (water, fruit juice without pulp, carbonated beverages, clear tea/black coffee).</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-amber-400 text-sm block">6 Hours:</strong>
                    <span className="text-slate-300">Light meal (toast and clear liquids, non-human milk, infant formula).</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 sm:col-span-2">
                    <strong className="text-rose-400 text-sm block">8+ Hours:</strong>
                    <span className="text-slate-300">Fried food, fatty food, or meat (slows gastric emptying; strictly require ≥8 hours before general anesthesia).</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-200">
                  <AlertTriangle className="w-4 h-4 inline mr-1 text-rose-400" />
                  <strong>ER Call Exception:</strong> In emergency trauma or acute peritonitis (bowel obstruction/perforation), all patients are considered full stomach regardless of fasting time! Rapid Sequence Induction (RSI) with cricoid pressure indicated.
                </div>
              </div>
            </div>
          )}

          {/* 4. IV Fluids */}
          {activeTab === 'fluids' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-sm text-blue-400">Maintenance IV Fluids (Holliday-Segar 4-2-1 Rule):</h3>

                <div>
                  <label className="block text-slate-400 mb-1">Patient Body Weight (kg):</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-40 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-base"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800">
                    <span className="text-slate-400 text-[11px] block">Maintenance Hourly Rate:</span>
                    <strong className="text-xl font-mono text-cyan-300">{hourlyRate} mL / hr</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800">
                    <span className="text-slate-400 text-[11px] block">24-Hour Maintenance:</span>
                    <strong className="text-xl font-mono text-cyan-300">{dailyTotal} mL / day</strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Formula: 4 mL/kg/hr for first 10 kg + 2 mL/kg/hr for next 10 kg + 1 mL/kg/hr for each kg above 20 kg.
                  Add replacement for NG suction / drain losses ml-for-ml with 0.9% Normal Saline.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
