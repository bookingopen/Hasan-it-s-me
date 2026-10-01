import React from 'react';
import { PatientStatus, STATUS_CONFIG } from '../types/ward';
import { AlertCircle, BedDouble, Filter, Sparkles } from 'lucide-react';

interface StatsBarProps {
  statusCounts: Record<PatientStatus, number>;
  totalBeds: number;
  totalOccupied: number;
  activeStatusFilter: PatientStatus | 'all';
  setActiveStatusFilter: (status: PatientStatus | 'all') => void;
  genderFilter: 'all' | 'male' | 'female';
  setGenderFilter: (gender: 'all' | 'male' | 'female') => void;
  announcement?: string;
  onEditAnnouncement?: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  statusCounts,
  totalBeds,
  totalOccupied,
  activeStatusFilter,
  setActiveStatusFilter,
  genderFilter,
  setGenderFilter,
  announcement,
  onEditAnnouncement
}) => {
  const vacantBeds = totalBeds - totalOccupied;

  return (
    <div className="bg-slate-900 border-b border-slate-800/80 px-3 sm:px-6 py-2.5 space-y-2.5">
      {/* On-Call Shift Announcement Bar */}
      {announcement && (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-xs text-rose-200">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="font-semibold text-rose-300 shrink-0">ER CALL STATUS:</span>
            <span className="truncate">{announcement}</span>
          </div>
          {onEditAnnouncement && (
            <button 
              onClick={onEditAnnouncement}
              className="text-[11px] underline hover:text-white shrink-0"
            >
              Update
            </button>
          )}
        </div>
      )}

      {/* Main Filter & Metric Cards */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Gender / Room Filter Segment */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[11px] px-2 font-medium flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-500" />
            Wards:
          </span>
          <button
            onClick={() => setGenderFilter('all')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              genderFilter === 'all'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All 4 Rooms (32 Beds)
          </button>
          <button
            onClick={() => setGenderFilter('male')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              genderFilter === 'male'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-blue-300 hover:text-white'
            }`}
          >
            Male Wards (Rooms A & B)
          </button>
          <button
            onClick={() => setGenderFilter('female')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              genderFilter === 'female'
                ? 'bg-pink-600 text-white font-semibold'
                : 'text-pink-300 hover:text-white'
            }`}
          >
            Female Wards (Rooms C & D)
          </button>
        </div>

        {/* Color-Coded Status Filter Badges (Crucial for user's color requirement) */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] text-slate-400 font-medium mr-1 hidden lg:inline">
            Status Colors:
          </span>

          {/* All */}
          <button
            onClick={() => setActiveStatusFilter('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${
              activeStatusFilter === 'all'
                ? 'bg-slate-700 text-white border-slate-500 shadow-sm'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            All Beds ({totalOccupied}/{totalBeds})
          </button>

          {/* ER Operation Today */}
          <button
            onClick={() => setActiveStatusFilter('er_op_today')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all border ${
              activeStatusFilter === 'er_op_today'
                ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)] ring-2 ring-rose-400/50'
                : 'bg-rose-950/40 text-rose-300 border-rose-800/80 hover:bg-rose-900/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span>ER Op Today</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/80 text-white text-[10px]">
              {statusCounts.er_op_today}
            </span>
          </button>

          {/* ER Conservative */}
          <button
            onClick={() => setActiveStatusFilter('er_conservative')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${
              activeStatusFilter === 'er_conservative'
                ? 'bg-amber-600 text-white border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)] ring-2 ring-amber-400/50'
                : 'bg-amber-950/40 text-amber-300 border-amber-800/80 hover:bg-amber-900/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>ER Conservative</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/80 text-white text-[10px]">
              {statusCounts.er_conservative}
            </span>
          </button>

          {/* Elective List */}
          <button
            onClick={() => setActiveStatusFilter('elective')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${
              activeStatusFilter === 'elective'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.3)] ring-2 ring-indigo-400/50'
                : 'bg-indigo-950/40 text-indigo-300 border-indigo-800/80 hover:bg-indigo-900/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>Elective List</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/80 text-white text-[10px]">
              {statusCounts.elective}
            </span>
          </button>

          {/* Post-Op Stable */}
          <button
            onClick={() => setActiveStatusFilter('post_op_stable')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${
              activeStatusFilter === 'post_op_stable'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-2 ring-emerald-400/50'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Post-Op Stable</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/80 text-white text-[10px]">
              {statusCounts.post_op_stable}
            </span>
          </button>

          {/* Discharge Ready */}
          <button
            onClick={() => setActiveStatusFilter('discharge_ready')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${
              activeStatusFilter === 'discharge_ready'
                ? 'bg-teal-600 text-white border-teal-400 shadow-sm'
                : 'bg-teal-950/40 text-teal-300 border-teal-800/80 hover:bg-teal-900/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span>Discharge</span>
            <span className="px-1.5 py-0.2 rounded-full bg-teal-500/80 text-white text-[10px]">
              {statusCounts.discharge_ready}
            </span>
          </button>

          {/* Vacant Beds */}
          <button
            onClick={() => setActiveStatusFilter('empty')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${
              activeStatusFilter === 'empty'
                ? 'bg-slate-700 text-white border-slate-500'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-300'
            }`}
          >
            <BedDouble className="w-3.5 h-3.5 text-slate-400" />
            <span>Vacant</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px]">
              {vacantBeds}
            </span>
          </button>

        </div>

      </div>
    </div>
  );
};
