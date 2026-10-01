import { Bed, Patient, WardState } from '../types/ward';
import { createInitialWardState } from '../data/initialWardState';

const STORAGE_KEY = 'surgesync_ward_cache';

// Helper to load cached state from localStorage
export function getCachedWardState(): WardState {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.warn('Could not read cached ward state:', err);
  }
  return createInitialWardState();
}

// Helper to save cache
export function setCachedWardState(state: WardState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Could not cache ward state:', err);
  }
}

export async function fetchWardState(): Promise<WardState> {
  try {
    const res = await fetch('/api/ward');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: WardState = await res.json();
    setCachedWardState(data);
    return data;
  } catch (err) {
    console.warn('Network fetch failed, using local cache:', err);
    return getCachedWardState();
  }
}

export async function apiUpdateBed(bedId: string, patient: Patient | null, updatedBy?: string): Promise<Bed | null> {
  try {
    const res = await fetch(`/api/ward/bed/${bedId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient, lastUpdatedBy: updatedBy })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.bed;
  } catch (err) {
    console.error('Failed to update bed on server:', err);
    return null;
  }
}

export async function apiAdmitPatient(bedId: string, patient: Partial<Patient>, admittedBy?: string): Promise<Bed | null> {
  try {
    const res = await fetch('/api/ward/admit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bedId, patient, admittedBy })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.bed;
  } catch (err) {
    console.error('Failed to admit patient on server:', err);
    return null;
  }
}

export async function apiDischargeBed(bedId: string): Promise<Bed | null> {
  try {
    const res = await fetch(`/api/ward/bed/${bedId}/discharge`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.bed;
  } catch (err) {
    console.error('Failed to discharge bed on server:', err);
    return null;
  }
}

export async function apiSwapBeds(fromBedId: string, toBedId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/ward/swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromBedId, toBedId })
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to swap beds on server:', err);
    return false;
  }
}

export async function apiReorderTheaterQueue(orderedPatientIds: string[]): Promise<boolean> {
  try {
    const res = await fetch('/api/ward/theater/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedPatientIds })
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to reorder theater queue on server:', err);
    return false;
  }
}

export async function apiResetWard(): Promise<WardState | null> {
  try {
    const res = await fetch('/api/ward/reset', { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.state;
  } catch (err) {
    console.error('Failed to reset ward on server:', err);
    return null;
  }
}

export async function apiImportBeds(entries: any[], overwriteAll: boolean): Promise<Bed[] | null> {
  try {
    const res = await fetch('/api/ward/import-beds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries, overwriteAll })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.beds;
  } catch (err) {
    console.error('Failed to import beds on server:', err);
    return null;
  }
}

export async function apiUpdateAnnouncement(announcement: string): Promise<boolean> {
  try {
    const res = await fetch('/api/ward/announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcement })
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to update announcement:', err);
    return false;
  }
}
