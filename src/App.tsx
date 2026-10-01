import React, { useEffect, useState, useMemo } from 'react';
import { Bed, Patient, PatientStatus, WardState } from './types/ward';
import { createInitialWardState } from './data/initialWardState';
import { 
  fetchWardState, 
  apiUpdateBed, 
  apiAdmitPatient, 
  apiDischargeBed, 
  apiSwapBeds, 
  apiReorderTheaterQueue, 
  apiResetWard,
  apiImportBeds,
  getCachedWardState,
  setCachedWardState
} from './services/wardApi';
import { TopNav } from './components/TopNav';
import { StatsBar } from './components/StatsBar';
import { RoomFloorPlan } from './components/RoomFloorPlan';
import { EmergencyORBoard } from './components/EmergencyORBoard';
import { WardListView } from './components/WardListView';
import { BedDetailModal } from './components/BedDetailModal';
import { AdmitModal } from './components/AdmitModal';
import { SBARHandoverModal } from './components/SBARHandoverModal';
import { SurgicalToolsModal } from './components/SurgicalToolsModal';
import { ShareSyncModal } from './components/ShareSyncModal';
import { BedSwapModal } from './components/BedSwapModal';
import { TextImportModal } from './components/TextImportModal';
import { ParsedBedEntry } from './utils/textHandoverParser';

export default function App() {
  const [wardState, setWardState] = useState<WardState>(() => getCachedWardState());
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  
  // Navigation & View Filters
  const [activeView, setActiveView] = useState<'floorplan' | 'theater' | 'list' | 'sbar'>('floorplan');
  const [activeStatusFilter, setActiveStatusFilter] = useState<PatientStatus | 'all'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');

  // Modal States
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [admitModalOpen, setAdmitModalOpen] = useState<boolean>(false);
  const [targetBedForAdmit, setTargetBedForAdmit] = useState<Bed | null>(null);
  const [sbarModalOpen, setSbarModalOpen] = useState<boolean>(false);
  const [toolsModalOpen, setToolsModalOpen] = useState<boolean>(false);
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [swapModalOpen, setSwapModalOpen] = useState<boolean>(false);
  const [sourceBedForSwap, setSourceBedForSwap] = useState<Bed | null>(null);
  const [importTextModalOpen, setImportTextModalOpen] = useState<boolean>(false);

  // Setup Server-Sent Events (SSE) Real-Time Synchronization
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/ward/stream');

        eventSource.onopen = () => {
          setIsLiveConnected(true);
          setLastSyncTime(new Date());
        };

        eventSource.onmessage = (event) => {
          try {
            const data: WardState = JSON.parse(event.data);
            if (data && Array.isArray(data.beds)) {
              setWardState(data);
              setCachedWardState(data);
              setLastSyncTime(new Date());
              setIsLiveConnected(true);

              // Update active selected bed if currently open in modal
              setSelectedBed((prev) => {
                if (!prev) return null;
                const fresh = data.beds.find((b) => b.id === prev.id);
                return fresh || null;
              });
            }
          } catch (err) {
            console.error('Failed to parse SSE payload:', err);
          }
        };

        eventSource.onerror = () => {
          setIsLiveConnected(false);
          if (eventSource) {
            eventSource.close();
          }
          // Reconnect attempt after 3 seconds
          reconnectTimeout = setTimeout(connectSSE, 3000);
        };
      } catch (err) {
        console.warn('SSE not supported or connection error, falling back to polling:', err);
      }
    };

    connectSSE();

    // Fallback periodic sync every 15s to keep state fresh
    const pollInterval = setInterval(async () => {
      try {
        const fresh = await fetchWardState();
        if (fresh && Array.isArray(fresh.beds)) {
          setWardState(fresh);
          setLastSyncTime(new Date());
        }
      } catch (e) {
        console.warn('Poll failed:', e);
      }
    }, 15000);

    return () => {
      if (eventSource) eventSource.close();
      clearTimeout(reconnectTimeout);
      clearInterval(pollInterval);
    };
  }, []);

  // Compute status counts for StatsBar & Badges
  const statusCounts = useMemo(() => {
    const counts: Record<PatientStatus, number> = {
      er_op_today: 0,
      er_conservative: 0,
      elective: 0,
      post_op_stable: 0,
      discharge_ready: 0,
      empty: 0
    };

    wardState.beds.forEach((bed) => {
      if (!bed.patient) {
        counts.empty++;
      } else {
        counts[bed.patient.status] = (counts[bed.patient.status] || 0) + 1;
      }
    });

    return counts;
  }, [wardState.beds]);

  const totalOccupied = wardState.beds.length - statusCounts.empty;
  const availableBeds = useMemo(() => {
    return wardState.beds.filter((b) => b.patient === null);
  }, [wardState.beds]);

  // Operations
  const handleSavePatient = async (bedId: string, updatedPatient: Patient) => {
    // Optimistic update
    setWardState((prev) => {
      const nextBeds = prev.beds.map((b) =>
        b.id === bedId ? { ...b, patient: updatedPatient } : b
      );
      const next = { ...prev, beds: nextBeds };
      setCachedWardState(next);
      return next;
    });

    await apiUpdateBed(bedId, updatedPatient);
  };

  const handleDischarge = async (bedId: string) => {
    setWardState((prev) => {
      const nextBeds = prev.beds.map((b) =>
        b.id === bedId ? { ...b, patient: null } : b
      );
      const next = { ...prev, beds: nextBeds };
      setCachedWardState(next);
      return next;
    });

    await apiDischargeBed(bedId);
  };

  const handleAdmitPatient = async (bedId: string, patientData: Partial<Patient>) => {
    // Call API
    await apiAdmitPatient(bedId, patientData);
  };

  const handleFastToggleEROP = async (bed: Bed) => {
    if (!bed.patient) return;
    const isAlreadyEROP = bed.patient.status === 'er_op_today';
    const newStatus: PatientStatus = isAlreadyEROP ? 'post_op_stable' : 'er_op_today';

    const updatedPatient: Patient = {
      ...bed.patient,
      status: newStatus,
      emergencyORDetails: newStatus === 'er_op_today' ? {
        priority: 'cat2_urgent',
        queuePosition: 1,
        fastingHoursChecked: bed.patient.fastingStatus === 'npo',
        consentSigned: true,
        bloodCrossmatched: false,
        anesthesiaEvaluated: false,
        antibioticsGiven: true,
        bookedTime: 'Today'
      } : undefined
    };

    handleSavePatient(bed.id, updatedPatient);
  };

  const handleReorderTheaterQueue = async (orderedPatientIds: string[]) => {
    await apiReorderTheaterQueue(orderedPatientIds);
  };

  const handleSwapBeds = async (fromBedId: string, toBedId: string) => {
    await apiSwapBeds(fromBedId, toBedId);
  };

  const handleResetDemo = async () => {
    const res = await apiResetWard();
    if (res) {
      setWardState(res);
      setCachedWardState(res);
    }
  };

  const handleManualRefresh = async () => {
    const fresh = await fetchWardState();
    if (fresh) {
      setWardState(fresh);
      setLastSyncTime(new Date());
    }
  };

  const handleApplyParsedBeds = async (parsedEntries: ParsedBedEntry[], overwriteAll: boolean) => {
    const updatedBeds = await apiImportBeds(parsedEntries, overwriteAll);
    if (updatedBeds) {
      setWardState((prev) => {
        const next = { ...prev, beds: updatedBeds, lastSyncTimestamp: Date.now() };
        setCachedWardState(next);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      
      {/* Top Navigation */}
      <TopNav
        activeView={activeView}
        setActiveView={setActiveView}
        erOpCount={statusCounts.er_op_today}
        totalOccupied={totalOccupied}
        totalBeds={wardState.beds.length}
        isLiveConnected={isLiveConnected}
        lastSyncTime={lastSyncTime}
        onOpenAdmit={() => {
          setTargetBedForAdmit(availableBeds[0] || null);
          setAdmitModalOpen(true);
        }}
        onOpenImportText={() => setImportTextModalOpen(true)}
        onOpenQR={() => setQrModalOpen(true)}
        onOpenTools={() => setToolsModalOpen(true)}
        onOpenSwap={() => {
          setSourceBedForSwap(wardState.beds[0] || null);
          setSwapModalOpen(true);
        }}
        onManualRefresh={handleManualRefresh}
      />

      {/* Stats Bar & Color Filter Legends */}
      <StatsBar
        statusCounts={statusCounts}
        totalBeds={wardState.beds.length}
        totalOccupied={totalOccupied}
        activeStatusFilter={activeStatusFilter}
        setActiveStatusFilter={setActiveStatusFilter}
        genderFilter={genderFilter}
        setGenderFilter={setGenderFilter}
        announcement={wardState.announcement}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5">
        
        {/* VIEW 1: Ward Floor Plan (Physical 4 Rooms, 2 Columns x 4 Rows per room) */}
        {activeView === 'floorplan' && (
          <RoomFloorPlan
            beds={wardState.beds}
            onSelectBed={(bed) => setSelectedBed(bed)}
            onAdmitToBed={(bed) => {
              setTargetBedForAdmit(bed);
              setAdmitModalOpen(true);
            }}
            onFastToggleEROP={handleFastToggleEROP}
            onOpenSwapModal={(bed) => {
              setSourceBedForSwap(bed);
              setSwapModalOpen(true);
            }}
            activeStatusFilter={activeStatusFilter}
            genderFilter={genderFilter}
          />
        )}

        {/* VIEW 2: Emergency Operating Theater (OR) Board */}
        {activeView === 'theater' && (
          <EmergencyORBoard
            beds={wardState.beds}
            onSelectBed={(bed) => setSelectedBed(bed)}
            onUpdatePatient={handleSavePatient}
            onReorderQueue={handleReorderTheaterQueue}
            onAdmitERClick={() => {
              setTargetBedForAdmit(availableBeds[0] || null);
              setAdmitModalOpen(true);
            }}
          />
        )}

        {/* VIEW 3: High-Density Ward List for Ward Rounds */}
        {activeView === 'list' && (
          <WardListView
            beds={wardState.beds}
            onSelectBed={(bed) => setSelectedBed(bed)}
            onAdmitToBed={(bed) => {
              setTargetBedForAdmit(bed);
              setAdmitModalOpen(true);
            }}
          />
        )}

        {/* VIEW 4: SBAR Handover Direct Tab */}
        {activeView === 'sbar' && (
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  SBAR Shift Handover Document
                </h2>
                <p className="text-xs text-slate-400">
                  Ready to copy for WhatsApp/Slack or print for morning ward rounds
                </p>
              </div>
              <button
                onClick={() => setSbarModalOpen(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 rounded-xl text-xs font-bold text-white"
              >
                Open Fullscreen Modal View
              </button>
            </div>
            
            {/* Inline SBAR Preview */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 font-mono text-xs text-slate-300 space-y-3 whitespace-pre-wrap">
              {`🏥 SURGICAL WARD ON-CALL HANDOVER (SBAR)\n` +
               `Date: ${wardState.shiftDate} · Total Beds: ${totalOccupied}/32 Occupied (${wardState.beds.length - totalOccupied} Vacant)\n` +
               `On-Call Consultant: ${wardState.onCallTeam.consultant}\n` +
               `Emergency OR Queue: ${statusCounts.er_op_today} urgent cases\n` +
               `ER Conservative: ${statusCounts.er_conservative} cases\n` +
               `Elective List: ${statusCounts.elective} cases\n` +
               `Post-Op Stable: ${statusCounts.post_op_stable} cases`}
            </div>
          </div>
        )}

      </main>

      {/* Footer Status */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-3 px-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>SurgeSync · Surgical Ward 32-Bed Command · On-Call ER System</span>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setQrModalOpen(true)}
              className="text-indigo-400 hover:underline flex items-center gap-1"
            >
              Scan Phone QR Code
            </button>
            <span className="text-slate-700">·</span>
            <button
              onClick={() => setToolsModalOpen(true)}
              className="text-cyan-400 hover:underline"
            >
              Surgical Calculators
            </button>
            <span className="text-slate-700">·</span>
            <span className="text-slate-500 font-mono">
              Live SSE Sync: {isLiveConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Bed Detail & Surgical Clinical Chart */}
      <BedDetailModal
        bed={selectedBed}
        isOpen={selectedBed !== null}
        onClose={() => setSelectedBed(null)}
        onSave={handleSavePatient}
        onDischarge={handleDischarge}
        onOpenSwap={(bed) => {
          setSelectedBed(null);
          setSourceBedForSwap(bed);
          setSwapModalOpen(true);
        }}
      />

      {/* 2. Fast ER Admission Intake Modal */}
      <AdmitModal
        isOpen={admitModalOpen}
        onClose={() => setAdmitModalOpen(false)}
        targetBed={targetBedForAdmit}
        availableBeds={availableBeds}
        onAdmit={handleAdmitPatient}
      />

      {/* 3. SBAR Handover Modal */}
      <SBARHandoverModal
        isOpen={sbarModalOpen}
        onClose={() => setSbarModalOpen(false)}
        wardState={wardState}
      />

      {/* 4. Surgical Calculators Modal */}
      <SurgicalToolsModal
        isOpen={toolsModalOpen}
        onClose={() => setToolsModalOpen(false)}
      />

      {/* 5. Phone Sync QR Code Modal */}
      <ShareSyncModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        onResetDemo={handleResetDemo}
      />

      {/* 6. Bed Swap / Transfer Modal */}
      <BedSwapModal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
        sourceBed={sourceBedForSwap}
        allBeds={wardState.beds}
        onSwap={handleSwapBeds}
      />

      {/* 7. Auto-Arrange from Text Handover Modal */}
      <TextImportModal
        isOpen={importTextModalOpen}
        onClose={() => setImportTextModalOpen(false)}
        onApplyParsedBeds={handleApplyParsedBeds}
      />

    </div>
  );
}
