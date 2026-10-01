import React, { useState } from 'react';
import { parseHandoverText, ParsedBedEntry } from '../utils/textHandoverParser';
import { Bed, Patient, PatientStatus, STATUS_CONFIG } from '../types/ward';
import { 
  X, 
  ClipboardPaste, 
  Sparkles, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  Flame, 
  HelpCircle,
  FileText,
  RotateCcw
} from 'lucide-react';

interface TextImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyParsedBeds: (parsedEntries: ParsedBedEntry[], overwriteAll: boolean) => void;
}

const DOCTOR_SAMPLE_TEXT = `A1=Onlist for Stoma Reversal...Hb=8...Kindly do distal LOOPOGRAM and Further ready patient for List
A4=Chronic Anal fissure Onlist(Echo+Cardiac fitness Not done Kindly do it)
A5=Acute Appendicitis....Leftover Npo was Not complete So will go to OPD
A7=Infected wound+Skin around Stoma Inflammed
B2=RIH 1st POD
B5=R arm Cellulitis....Debridement done
B8=Haemorrhoids Multiple Ligation 3rd POD.....Kindly Reasses patient and Put onlist if needed and prepare for list.....
C1=MRM(1st POD)
C2=PUH onlist 
C3=orthopedics old Patient admitted for Shortness of Breath Under name of Dr Ishaq....
C5=Right Gluteal Abscess
C6=Appendectomy Immediate POD
C8=Breast Abscess Incision and Drainage done 
D1=Cholelithiasis...Has DM Manage According To Medicine Call
D3=Acute Cholecystitis
D4=Appendectomy
D5=Anal Fissure...Was supposed to be done today but Anesthesia team deferred To under case and asked for Cardiac fitness.....Kindly Prepare for List  If Needed
D6=DCIS of Left Breat....Patient was admitted through OPD for list but Was forgotten at the time of list making....
D7=Right BREAST Abscess...Incision and Drainage done
D8= Stoma Reversal 1st POD...`;

export const TextImportModal: React.FC<TextImportModalProps> = ({
  isOpen,
  onClose,
  onApplyParsedBeds
}) => {
  if (!isOpen) return null;

  const [rawText, setRawText] = useState(DOCTOR_SAMPLE_TEXT);
  const [overwriteMode, setOverwriteMode] = useState<'update' | 'replace'>('update');
  const [parsedEntries, setParsedEntries] = useState<ParsedBedEntry[]>(() => parseHandoverText(DOCTOR_SAMPLE_TEXT));

  const handleTextChange = (text: string) => {
    setRawText(text);
    const parsed = parseHandoverText(text);
    setParsedEntries(parsed);
  };

  const handleApply = () => {
    if (parsedEntries.length === 0) return;
    onApplyParsedBeds(parsedEntries, overwriteMode === 'replace');
    onClose();
  };

  const handleLoadSample = () => {
    handleTextChange(DOCTOR_SAMPLE_TEXT);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl text-slate-100 my-auto overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-rose-950/80 via-slate-900 to-indigo-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-900/40">
              <ClipboardPaste className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Auto-Arrange Beds from Text Handover
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  SMART PARSER
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Paste WhatsApp / Telegram / SMS notes (e.g. A1=..., B2=...) · Automatically assigns beds, diagnosis, colors & plans
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Quick Helper & Sample Loader */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Format supported: <code className="text-rose-300 font-mono">A1=Diagnosis...Plan</code> or <code className="text-rose-300 font-mono">B2: RIH 1st POD</code>
              </span>
            </div>
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white transition-colors flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Insert Doctor's Sample Text</span>
            </button>
          </div>

          {/* Text Input Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
                Paste Handover Text:
              </label>
              <span className="text-[11px] text-slate-400">
                {parsedEntries.length} bed entries detected
              </span>
            </div>
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Paste text like: A1=Onlist for Stoma Reversal...Hb=8...&#10;B2=RIH 1st POD&#10;C5=Right Gluteal Abscess"
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-500 leading-relaxed"
            />
          </div>

          {/* Import Mode Selection */}
          <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-950/70 rounded-xl border border-slate-800">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              Sync Mode:
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="radio"
                name="overwriteMode"
                value="update"
                checked={overwriteMode === 'update'}
                onChange={() => setOverwriteMode('update')}
                className="text-rose-600 focus:ring-rose-500"
              />
              <span><strong>Update mentioned beds only</strong> (Keep other beds intact)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="radio"
                name="overwriteMode"
                value="replace"
                checked={overwriteMode === 'replace'}
                onChange={() => setOverwriteMode('replace')}
                className="text-rose-600 focus:ring-rose-500"
              />
              <span><strong>Replace entire 32-bed ward</strong> (Unmentioned beds become Vacant)</span>
            </label>
          </div>

          {/* Live Parsed Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Live Ward Bed Arrangement Preview ({parsedEntries.length} Beds)
              </h3>
              <span className="text-[11px] text-slate-400">
                Colors and fields auto-detected from keywords
              </span>
            </div>

            {parsedEntries.length === 0 ? (
              <div className="p-6 text-center bg-slate-950/50 rounded-xl border border-slate-800 text-slate-500">
                No bed codes detected in pasted text. Make sure lines start with A1 to D8.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto p-1">
                {parsedEntries.map((entry) => {
                  const config = STATUS_CONFIG[entry.status];
                  return (
                    <div
                      key={entry.bedCode}
                      className={`p-2.5 rounded-xl border ${config.borderColor} ${config.cardBg} space-y-1`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded bg-slate-900 font-mono font-bold text-white text-xs flex items-center justify-center border border-slate-700">
                            {entry.bedCode}
                          </span>
                          <span className="font-bold text-white text-xs">
                            Room {entry.roomCode} ({entry.suggestedSex === 'M' ? 'Male' : 'Female'})
                          </span>
                        </div>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${config.badgeBg} ${config.badgeText}`}>
                          {config.shortLabel}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-100 line-clamp-1">
                        {entry.diagnosis}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="text-cyan-300 font-mono font-semibold">{entry.postOpDay}</span>
                        {entry.fastingStatus === 'npo' && (
                          <span className="text-amber-400 font-bold">NPO</span>
                        )}
                      </div>

                      {entry.managementPlan && (
                        <div className="text-[11px] text-slate-300 line-clamp-2 bg-slate-950/60 p-1.5 rounded border border-slate-800">
                          <strong className="text-slate-400">Plan: </strong>
                          {entry.managementPlan}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={parsedEntries.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-900/40 active:scale-95 disabled:opacity-50 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Apply {parsedEntries.length} Beds to Ward & Sync All Phones</span>
          </button>
        </div>

      </div>
    </div>
  );
};
