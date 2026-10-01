import React, { useState } from 'react';
import { Bed, Patient, PatientStatus, ROOMS, STATUS_CONFIG } from '../types/ward';
import { 
  Bed as BedIcon, 
  Flame, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  ArrowRightLeft, 
  Plus, 
  UtensilsCrossed, 
  HeartPulse,
  Droplet,
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface RoomFloorPlanProps {
  beds: Bed[];
  onSelectBed: (bed: Bed) => void;
  onAdmitToBed: (bed: Bed) => void;
  onFastToggleEROP: (bed: Bed) => void;
  onOpenSwapModal: (bed: Bed) => void;
  activeStatusFilter: PatientStatus | 'all';
  genderFilter: 'all' | 'male' | 'female';
}

export const RoomFloorPlan: React.FC<RoomFloorPlanProps> = ({
  beds,
  onSelectBed,
  onAdmitToBed,
  onFastToggleEROP,
  onOpenSwapModal,
  activeStatusFilter,
  genderFilter
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<number | 'all'>('all');

  // Filter rooms based on genderFilter
  const visibleRooms = ROOMS.filter((room) => {
    if (genderFilter === 'male' && room.gender !== 'male') return false;
    if (genderFilter === 'female' && room.gender !== 'female') return false;
    if (selectedRoomId !== 'all' && room.id !== selectedRoomId) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Room Tabs Filter for Quick Zoom */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-400 mr-2 shrink-0">Room View:</span>
          
          <button
            onClick={() => setSelectedRoomId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedRoomId === 'all'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            All 4 Rooms (Overview)
          </button>

          {ROOMS.map((room) => {
            const isSelected = selectedRoomId === room.id;
            const roomBeds = beds.filter((b) => b.roomId === room.id);
            const occupied = roomBeds.filter((b) => b.patient !== null).length;
            const erOps = roomBeds.filter((b) => b.patient?.status === 'er_op_today').length;

            return (
              <button
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? room.gender === 'male'
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-pink-600 text-white border-pink-400'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800'
                }`}
              >
                <span>{room.name}</span>
                <span className="text-[10px] opacity-80 font-mono">({room.code}1–{room.code}8: {occupied}/8)</span>
                {erOps > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse ml-0.5" />
                )}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-400 hidden md:block">
          Physical layout: <span className="text-slate-200 font-mono">2 Columns × 4 Rows</span> per room
        </div>
      </div>

      {/* Grid of Rooms */}
      <div className={`grid gap-8 ${selectedRoomId === 'all' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
        {visibleRooms.map((room) => {
          const roomBeds = beds.filter((b) => b.roomId === room.id);
          const occupiedCount = roomBeds.filter((b) => b.patient !== null).length;
          const erOpCount = roomBeds.filter((b) => b.patient?.status === 'er_op_today').length;

          // Split into Column 1 (Beds 1-4) and Column 2 (Beds 5-8)
          const col1Beds = roomBeds.filter((b) => b.column === 1).sort((a, b) => a.row - b.row);
          const col2Beds = roomBeds.filter((b) => b.column === 2).sort((a, b) => a.row - b.row);

          return (
            <div 
              key={room.id}
              className="bg-slate-900/90 rounded-2xl border border-slate-800/90 p-4 sm:p-5 shadow-xl transition-all"
            >
              {/* Room Header with Gender Distinction */}
              <div className="flex flex-wrap items-center justify-between pb-3.5 mb-4 border-b border-slate-800 gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-3.5 h-10 rounded-full ${room.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        {room.name}
                      </h2>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        room.gender === 'male'
                          ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                          : 'bg-pink-500/10 text-pink-300 border-pink-500/30'
                      }`}>
                        {room.gender.toUpperCase()} WARD
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Beds <strong className="text-white font-mono">{room.code}1 to {room.code}8</strong> · 2 Columns × 4 Rows
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {erOpCount > 0 && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-950/80 text-rose-300 border border-rose-800 font-bold animate-pulse">
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      {erOpCount} Emergency OR
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium">
                    Occupancy: <strong className="text-white font-mono">{occupiedCount}/8</strong>
                  </span>
                </div>
              </div>

              {/* Physical Floor Plan: 2 Columns × 4 Rows with Central Aisle */}
              <div className="relative">
                {/* Visual Aisle Label for Hospital Staff */}
                <div className="hidden sm:flex items-center justify-between text-[11px] font-mono font-medium text-slate-500 uppercase px-2 mb-2">
                  <span>← Left Column ({room.code}1–{room.code}4)</span>
                  <span className="text-slate-400 font-semibold tracking-wider">Central Walking Aisle</span>
                  <span>Right Column ({room.code}5–{room.code}8) →</span>
                </div>

                {/* 2-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                  
                  {/* Column 1: Rows 1 to 4 */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center justify-between px-1">
                      <span>Column 1 (Window Side)</span>
                      <span className="text-slate-400 font-mono font-bold">Beds {room.code}1–{room.code}4</span>
                    </div>
                    {col1Beds.map((bed) => (
                      <BedCard
                        key={bed.id}
                        bed={bed}
                        onSelect={() => onSelectBed(bed)}
                        onAdmit={() => onAdmitToBed(bed)}
                        onToggleEROP={() => onFastToggleEROP(bed)}
                        onOpenSwap={() => onOpenSwapModal(bed)}
                        activeFilter={activeStatusFilter}
                      />
                    ))}
                  </div>

                  {/* Column 2: Rows 1 to 4 */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center justify-between px-1">
                      <span>Column 2 (Door Side)</span>
                      <span className="text-slate-400 font-mono font-bold">Beds {room.code}5–{room.code}8</span>
                    </div>
                    {col2Beds.map((bed) => (
                      <BedCard
                        key={bed.id}
                        bed={bed}
                        onSelect={() => onSelectBed(bed)}
                        onAdmit={() => onAdmitToBed(bed)}
                        onToggleEROP={() => onFastToggleEROP(bed)}
                        onOpenSwap={() => onOpenSwapModal(bed)}
                        activeFilter={activeStatusFilter}
                      />
                    ))}
                  </div>

                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

interface BedCardProps {
  bed: Bed;
  onSelect: () => void;
  onAdmit: () => void;
  onToggleEROP: () => void;
  onOpenSwap: () => void;
  activeFilter: PatientStatus | 'all';
}

const BedCard: React.FC<BedCardProps> = ({
  bed,
  onSelect,
  onAdmit,
  onToggleEROP,
  onOpenSwap,
  activeFilter
}) => {
  const patient = bed.patient;
  const status: PatientStatus = patient ? patient.status : 'empty';
  const config = STATUS_CONFIG[status];

  // If filtered out, fade slightly
  const isFilteredOut = activeFilter !== 'all' && activeFilter !== status;

  if (!patient) {
    return (
      <div 
        onClick={onAdmit}
        className={`group p-3.5 rounded-xl border border-dashed border-slate-700/80 bg-slate-950/40 hover:bg-slate-900/80 hover:border-slate-500 cursor-pointer transition-all flex flex-col justify-between min-h-[140px] ${
          isFilteredOut ? 'opacity-30' : 'opacity-100'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs font-extrabold flex items-center justify-center">
              {bed.bedCode}
            </span>
            <span className="text-xs font-semibold text-slate-400">Bed {bed.bedCode}</span>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            Row {bed.row} · Col {bed.column}
          </span>
        </div>

        <div className="py-3 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 group-hover:bg-rose-600 text-slate-400 group-hover:text-white transition-colors mb-1">
            <Plus className="w-4 h-4" />
          </div>
          <p className="text-xs font-medium text-slate-400 group-hover:text-slate-200">
            Available for ER Admission
          </p>
          <p className="text-[11px] text-slate-500">Tap to admit patient</p>
        </div>

        <div className="flex justify-end">
          <span className="text-[11px] text-rose-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            Quick Admit <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative p-3.5 rounded-xl border ${config.borderColor} ${config.cardBg} ${config.glowEffect} transition-all hover:scale-[1.01] ${
        isFilteredOut ? 'opacity-30' : 'opacity-100'
      }`}
    >
      {/* Top Row: Bed Number, Patient Info, Status Badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {/* Bed Number Box */}
          <span className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 text-white font-mono text-xs font-extrabold flex items-center justify-center shrink-0">
            {bed.bedCode}
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-white hover:underline cursor-pointer" onClick={onSelect}>
                {patient.name}
              </span>
              <span className="text-xs text-slate-400">
                ({patient.age}y/{patient.sex})
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              MRN: {patient.mrn} · Bed {bed.bedCode}
            </div>
          </div>
        </div>

        {/* Dynamic Status Badge (User requirement: manage by colors) */}
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span 
            className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider uppercase ${config.badgeBg} ${config.badgeText} shadow-sm`}
          >
            {config.shortLabel}
          </span>
          {/* Post-Op Day Badge */}
          <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/60 font-mono">
            {patient.postOpDay}
          </span>
        </div>
      </div>

      {/* Diagnosis: High Visibility Surgical Title */}
      <div 
        onClick={onSelect}
        className="cursor-pointer group"
      >
        <div className="text-xs font-bold text-slate-100 group-hover:text-rose-300 transition-colors line-clamp-1">
          {patient.diagnosis}
        </div>
        {patient.operationName && (
          <div className="text-[11px] text-slate-300 italic line-clamp-1">
            Op: {patient.operationName}
          </div>
        )}
      </div>

      {/* Complaints & Fasting Status */}
      <div className="my-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1 text-xs">
        {/* Fasting Notice */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center gap-1">
            <UtensilsCrossed className="w-3 h-3 text-amber-400" />
            Diet:
          </span>
          {patient.fastingStatus === 'npo' ? (
            <span className="font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-800 text-[10px] flex items-center gap-1">
              Strict NPO {patient.fastingSince ? `(since ${patient.fastingSince})` : ''}
            </span>
          ) : (
            <span className="text-slate-300 capitalize text-[10px] font-medium">
              {patient.fastingStatus.replace('_', ' ')}
            </span>
          )}
        </div>

        {/* Current Complaints */}
        <div className="text-[11px] text-slate-300">
          <strong className="text-slate-400">Complaints: </strong>
          <span className="line-clamp-1">{patient.currentComplaints || 'None reported'}</span>
        </div>

        {/* Management Plan */}
        <div className="text-[11px] text-slate-300">
          <strong className="text-slate-400">Plan: </strong>
          <span className="line-clamp-1 text-emerald-300">{patient.managementPlan || 'Observation'}</span>
        </div>

        {/* Vitals & Drains summary */}
        {(patient.vitals || patient.drainOutput) && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono">
            {patient.vitals && (
              <span className="flex items-center gap-1">
                <HeartPulse className="w-2.5 h-2.5 text-rose-400" />
                BP {patient.vitals.bp || '—'} · HR {patient.vitals.hr || '—'} · T {patient.vitals.temp ? `${patient.vitals.temp}°C` : '—'}
              </span>
            )}
            {patient.drainOutput && (
              <span className="text-amber-300 truncate max-w-[120px]">
                Drain: {patient.drainOutput}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between pt-1 gap-1 text-[11px]">
        {/* Toggle / Quick Action for Emergency OR */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleEROP();
          }}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-all ${
            status === 'er_op_today'
              ? 'bg-rose-500 text-white shadow-sm hover:bg-rose-600'
              : 'bg-slate-800 text-slate-300 hover:bg-rose-950 hover:text-rose-200 border border-slate-700/60'
          }`}
          title="Flag or unflag patient for Emergency Operating Theater today"
        >
          <Flame className="w-3 h-3 text-amber-300" />
          <span>{status === 'er_op_today' ? 'Booked ER OR' : '+ ER OR'}</span>
        </button>

        <div className="flex items-center gap-1.5">
          {/* Bed Swap */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenSwap();
            }}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            title="Move or swap patient with another bed"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>

          {/* Full Chart Modal */}
          <button
            onClick={onSelect}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            <span>Chart</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
