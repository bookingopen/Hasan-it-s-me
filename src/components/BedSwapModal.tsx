import React, { useState } from 'react';
import { Bed } from '../types/ward';
import { X, ArrowRightLeft } from 'lucide-react';

interface BedSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceBed: Bed | null;
  allBeds: Bed[];
  onSwap: (fromBedId: string, toBedId: string) => void;
}

export const BedSwapModal: React.FC<BedSwapModalProps> = ({
  isOpen,
  onClose,
  sourceBed,
  allBeds,
  onSwap
}) => {
  if (!isOpen || !sourceBed) return null;

  const [targetBedId, setTargetBedId] = useState<string>(
    allBeds.find((b) => b.id !== sourceBed.id)?.id || ''
  );

  const targetBedObj = allBeds.find((b) => b.id === targetBedId);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBedId || targetBedId === sourceBed.id) return;
    onSwap(sourceBed.id, targetBedId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl text-slate-100 overflow-hidden">
        
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">
              Bed Transfer / Swap
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="p-5 space-y-4 text-xs">
          
          {/* Source Bed Info */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[11px] mb-1">Transferring Patient From:</span>
            <div className="font-bold text-sm text-white">
              Bed {sourceBed.bedCode} ({sourceBed.roomName})
            </div>
            <div className="text-slate-300 mt-0.5">
              {sourceBed.patient ? (
                <>
                  {sourceBed.patient.name} ({sourceBed.patient.age}y/{sourceBed.patient.sex}) — {sourceBed.patient.diagnosis}
                </>
              ) : (
                <span className="text-slate-500 italic">Empty Bed ({sourceBed.bedCode})</span>
              )}
            </div>
          </div>

          {/* Target Bed Selection */}
          <div>
            <label className="block text-slate-400 font-bold uppercase tracking-wider text-[11px] mb-1">
              Select Destination Bed:
            </label>
            <select
              value={targetBedId}
              onChange={(e) => setTargetBedId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-medium"
            >
              {allBeds
                .filter((b) => b.id !== sourceBed.id)
                .map((bed) => (
                  <option key={bed.id} value={bed.id}>
                    Bed {bed.bedCode} — {bed.roomName} (
                    {bed.patient ? `Occupied: ${bed.patient.name}` : 'Vacant'}
                    )
                  </option>
                ))}
            </select>
          </div>

          {targetBedObj && (
            <p className="text-[11px] text-slate-400">
              {targetBedObj.patient
                ? `⚠️ This will swap Bed ${sourceBed.bedCode} (${sourceBed.patient?.name || 'Empty'}) with Bed ${targetBedObj.bedCode} (${targetBedObj.patient.name}).`
                : `✅ Bed ${targetBedObj.bedCode} is vacant. Patient will be moved to Bed ${targetBedObj.bedCode}.`}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-900/40"
            >
              Confirm Transfer
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
