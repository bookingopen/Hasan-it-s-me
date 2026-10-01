export type PatientStatus =
  | 'er_op_today'       // ER Operation to be done today / Scheduled Emergency OR / Onlist
  | 'er_conservative'   // ER Patient managed conservatively today
  | 'elective'          // Elective surgical list patient
  | 'post_op_stable'    // Post-op stable / recovering
  | 'discharge_ready'   // Discharge pending / ready
  | 'empty';            // Empty bed

export type PatientSex = 'M' | 'F';

export type RoomGender = 'male' | 'female';
export type RoomCode = 'A' | 'B' | 'C' | 'D';

export interface Vitals {
  bp?: string;          // e.g. "124/78"
  hr?: number;          // e.g. 88
  temp?: number;        // e.g. 37.8 °C
  spo2?: number;        // e.g. 98 %
  painScore?: number;   // 0 - 10
  respiratoryRate?: number;
}

export type FastingStatus = 'npo' | 'sips' | 'clear_fluids' | 'soft_diet' | 'regular';

export interface EmergencyORDetails {
  priority: 'cat1_immediate' | 'cat2_urgent' | 'cat3_expedited';
  queuePosition?: number;
  fastingHoursChecked: boolean;
  consentSigned: boolean;
  bloodCrossmatched: boolean;
  anesthesiaEvaluated: boolean;
  antibioticsGiven: boolean;
  bookedTime?: string;
  otRoom?: string;
  specialRequirements?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: PatientSex;
  mrn: string;
  admissionDate: string;
  status: PatientStatus;
  
  // Surgical ward specific
  diagnosis: string;
  operationName?: string;
  postOpDay: string; // "Pre-Op (On-List)", "1st POD", "2nd POD", "3rd POD", "Immediate POD", "Non-Op"
  currentComplaints: string;
  managementPlan: string;
  
  // Clinical monitors
  fastingStatus: FastingStatus;
  fastingSince?: string;
  vitals?: Vitals;
  drainOutput?: string;
  catheterInPlace?: boolean;
  urineOutput?: string;
  ivFluids?: string;
  antibiotics?: string;
  allergies?: string;
  
  // Emergency theater list specific
  emergencyORDetails?: EmergencyORDetails;

  updatedAt: string;
  lastUpdatedBy?: string;
}

export interface Bed {
  id: string; // e.g., 'bed-A1'
  bedCode: string; // 'A1', 'A2' ... 'D8'
  bedNumber: number; // 1 to 32
  roomCode: RoomCode; // 'A', 'B', 'C', 'D'
  roomId: number; // 1, 2, 3, 4
  roomName: string; // e.g. "Room A (Male Ward)"
  column: 1 | 2; // Column 1 (Beds 1-4) or Column 2 (Beds 5-8 in room)
  row: 1 | 2 | 3 | 4; // Row 1, 2, 3, 4
  patient?: Patient | null;
}

export interface Room {
  id: number;
  code: RoomCode;
  name: string;
  shortName: string;
  gender: RoomGender;
  bedPrefix: string; // 'A', 'B', 'C', 'D'
  bedCodes: string[]; // e.g. ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8']
  description: string;
}

export interface WardState {
  beds: Bed[];
  shiftDate: string;
  onCallTeam: {
    consultant: string;
    registrar: string;
    resident: string;
    intern: string;
  };
  lastSyncTimestamp: number;
  announcement?: string;
}

export const ROOMS: Room[] = [
  {
    id: 1,
    code: 'A',
    name: 'Room A (Male Ward)',
    shortName: 'Room A',
    gender: 'male',
    bedPrefix: 'A',
    bedCodes: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'],
    description: 'Beds A1 to A8 · Male Surgical Acute Ward'
  },
  {
    id: 2,
    code: 'B',
    name: 'Room B (Male Ward)',
    shortName: 'Room B',
    gender: 'male',
    bedPrefix: 'B',
    bedCodes: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8'],
    description: 'Beds B1 to B8 · Male Surgical Ward'
  },
  {
    id: 3,
    code: 'C',
    name: 'Room C (Female Ward)',
    shortName: 'Room C',
    gender: 'female',
    bedPrefix: 'C',
    bedCodes: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'],
    description: 'Beds C1 to C8 · Female Surgical Acute Ward'
  },
  {
    id: 4,
    code: 'D',
    name: 'Room D (Female Ward)',
    shortName: 'Room D',
    gender: 'female',
    bedPrefix: 'D',
    bedCodes: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'],
    description: 'Beds D1 to D8 · Female Surgical Ward'
  }
];

export interface StatusStyleConfig {
  label: string;
  shortLabel: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  cardBg: string;
  glowEffect: string;
  dotColor: string;
  colorHex: string;
}

export const STATUS_CONFIG: Record<PatientStatus, StatusStyleConfig> = {
  er_op_today: {
    label: 'ER Operation / On-List',
    shortLabel: 'ON-LIST (ER OP)',
    description: 'Emergency Surgery required / booked today on list',
    badgeBg: 'bg-rose-600',
    badgeText: 'text-white',
    borderColor: 'border-rose-500/80 ring-1 ring-rose-500/50',
    cardBg: 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950',
    glowEffect: 'shadow-[0_0_15px_rgba(244,63,94,0.25)]',
    dotColor: 'bg-rose-500',
    colorHex: '#e11d48'
  },
  er_conservative: {
    label: 'ER Conservative Mgt',
    shortLabel: 'CONSERVATIVE',
    description: 'Acute admission managed non-operatively',
    badgeBg: 'bg-amber-500/20 border border-amber-500/40',
    badgeText: 'text-amber-300 font-semibold',
    borderColor: 'border-amber-500/60',
    cardBg: 'bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950',
    glowEffect: 'shadow-[0_0_12px_rgba(245,158,11,0.15)]',
    dotColor: 'bg-amber-400',
    colorHex: '#f59e0b'
  },
  elective: {
    label: 'Elective Surgical List',
    shortLabel: 'ELECTIVE LIST',
    description: 'Scheduled elective surgical admission / OPD list',
    badgeBg: 'bg-indigo-500/20 border border-indigo-500/40',
    badgeText: 'text-indigo-300 font-semibold',
    borderColor: 'border-indigo-500/60',
    cardBg: 'bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-950',
    glowEffect: 'shadow-[0_0_12px_rgba(99,102,241,0.15)]',
    dotColor: 'bg-indigo-400',
    colorHex: '#6366f1'
  },
  post_op_stable: {
    label: 'Post-Op Stable',
    shortLabel: 'POST-OP STABLE',
    description: 'Post-operative recovering smoothly',
    badgeBg: 'bg-emerald-500/20 border border-emerald-500/40',
    badgeText: 'text-emerald-300 font-semibold',
    borderColor: 'border-emerald-500/60',
    cardBg: 'bg-gradient-to-br from-emerald-950/25 via-slate-900 to-slate-950',
    glowEffect: 'shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    dotColor: 'bg-emerald-400',
    colorHex: '#10b981'
  },
  discharge_ready: {
    label: 'Discharge Planned',
    shortLabel: 'DISCHARGE READY',
    description: 'Medically cleared for discharge home / stepdown',
    badgeBg: 'bg-teal-500/20 border border-teal-500/40',
    badgeText: 'text-teal-300 font-semibold',
    borderColor: 'border-teal-500/50',
    cardBg: 'bg-gradient-to-br from-teal-950/20 via-slate-900 to-slate-950',
    glowEffect: '',
    dotColor: 'bg-teal-400',
    colorHex: '#14b8a6'
  },
  empty: {
    label: 'Empty Bed Available',
    shortLabel: 'AVAILABLE BED',
    description: 'Vacant bed ready for ER triage admission',
    badgeBg: 'bg-slate-800 text-slate-400',
    badgeText: 'text-slate-400',
    borderColor: 'border-slate-800 border-dashed hover:border-slate-700',
    cardBg: 'bg-slate-900/40 hover:bg-slate-900/60',
    glowEffect: '',
    dotColor: 'bg-slate-600',
    colorHex: '#64748b'
  }
};
