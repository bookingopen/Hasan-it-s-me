import React from 'react';
import { 
  Activity, 
  Bed as BedIcon, 
  Flame, 
  FileText, 
  QrCode, 
  PlusCircle, 
  Calculator, 
  RefreshCw,
  Users,
  ClipboardPaste
} from 'lucide-react';

interface TopNavProps {
  activeView: 'floorplan' | 'theater' | 'list' | 'sbar';
  setActiveView: (view: 'floorplan' | 'theater' | 'list' | 'sbar') => void;
  erOpCount: number;
  totalOccupied: number;
  totalBeds: number;
  isLiveConnected: boolean;
  lastSyncTime: Date;
  onOpenAdmit: () => void;
  onOpenImportText: () => void;
  onOpenQR: () => void;
  onOpenTools: () => void;
  onOpenSwap: () => void;
  onManualRefresh: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeView,
  setActiveView,
  erOpCount,
  totalOccupied,
  totalBeds,
  isLiveConnected,
  lastSyncTime,
  onOpenAdmit,
  onOpenImportText,
  onOpenQR,
  onOpenTools,
  onOpenSwap,
  onManualRefresh
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Zone 1: Brand & On-Call Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-900/30">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  SurgeSync
                </span>
                <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  ER Call Day
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Surgical Ward · 32 Beds (4 Rooms) · Live Synced
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Views (Segmented Controls) */}
          <nav className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveView('floorplan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeView === 'floorplan'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BedIcon className="w-3.5 h-3.5" />
              <span>Ward Layout</span>
            </button>

            <button
              onClick={() => setActiveView('theater')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeView === 'theater'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>Emergency OR</span>
              {erOpCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 animate-pulse">
                  {erOpCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeView === 'list'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ward List</span>
            </button>

            <button
              onClick={() => setActiveView('sbar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeView === 'sbar'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>SBAR Handoff</span>
            </button>
          </nav>

          {/* Zone 3: Quick Action Buttons & Real-time Live Status */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live Indicator */}
            <div 
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 cursor-pointer"
              title="Real-time multi-device sync via Server-Sent Events"
              onClick={onManualRefresh}
            >
              <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
              <span className="font-mono text-emerald-400 font-medium">
                {isLiveConnected ? 'Live Synced' : 'Reconnecting...'}
              </span>
              <RefreshCw className="w-3 h-3 text-slate-500 hover:text-slate-300 ml-1 transition-transform active:rotate-180" />
            </div>

            {/* Paste Text Handover */}
            <button
              onClick={onOpenImportText}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 rounded-lg border border-amber-500/40 shadow-sm transition-all"
              title="Paste WhatsApp text list (A1=..., B2=...) to auto-arrange into 32 beds"
            >
              <ClipboardPaste className="w-4 h-4 text-amber-400" />
              <span className="whitespace-nowrap">Paste Text</span>
            </button>

            {/* Surgical Tools */}
            <button
              onClick={onOpenTools}
              className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
              title="Clinical Calculators (Alvarado, Tokyo Cholecystitis, Fasting & Fluids)"
            >
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">Calculators</span>
            </button>

            {/* Sync Phone QR */}
            <button
              onClick={onOpenQR}
              className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-slate-100 hover:text-white bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 rounded-lg border border-indigo-500/40 transition-colors"
              title="Scan with phone camera to sync ward list instantly"
            >
              <QrCode className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Phone Sync</span>
            </button>

            {/* Quick Admit */}
            <button
              onClick={onOpenAdmit}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-md shadow-rose-900/30 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="whitespace-nowrap">+ Admit ER</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
