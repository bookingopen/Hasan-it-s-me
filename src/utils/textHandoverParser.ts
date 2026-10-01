import { Patient, PatientStatus, FastingStatus } from '../types/ward';

export interface ParsedBedEntry {
  bedCode: string; // 'A1'..'D8'
  roomCode: 'A' | 'B' | 'C' | 'D';
  bedNumberInRoom: number; // 1..8
  rawText: string;
  diagnosis: string;
  operationName?: string;
  postOpDay: string;
  currentComplaints: string;
  managementPlan: string;
  status: PatientStatus;
  fastingStatus: FastingStatus;
  suggestedName?: string;
  suggestedSex: 'M' | 'F';
}

export function parseHandoverText(rawInput: string): ParsedBedEntry[] {
  const results: ParsedBedEntry[] = [];
  if (!rawInput || typeof rawInput !== 'string') return results;

  // Split into lines or chunks by delimiter
  // Some doctors paste with newlines or parentheses or commas
  const cleanedInput = rawInput
    .replace(/^\s*\(\s*/, '')
    .replace(/\s*\)\s*$/, '');

  // Regex to match lines starting with bed code: e.g. A1=..., B2: ..., C3 - ..., D4 ...
  // Or match occurrences of [A-D][1-8]\s*[:=\-]?\s*
  const bedBlockRegex = /(?:^|\n|\r|;|\b)([A-Da-d][1-8])\s*[:=\-]\s*([\s\S]*?)(?=(?:[\n\r;]|\b)[A-Da-d][1-8]\s*[:=\-]|$)/g;

  let match: RegExpExecArray | null;
  const processedBedCodes = new Set<string>();

  while ((match = bedBlockRegex.exec(cleanedInput)) !== null) {
    const rawCode = match[1].toUpperCase();
    const content = match[2].trim();
    if (!content || processedBedCodes.has(rawCode)) continue;
    processedBedCodes.add(rawCode);

    const roomCode = rawCode[0] as 'A' | 'B' | 'C' | 'D';
    const bedNumberInRoom = parseInt(rawCode[1], 10);
    // Rooms A & B are Male, Rooms C & D are Female
    const suggestedSex: 'M' | 'F' = (roomCode === 'A' || roomCode === 'B') ? 'M' : 'F';

    const parsed = parseSingleBedContent(rawCode, roomCode, bedNumberInRoom, content, suggestedSex);
    results.push(parsed);
  }

  // Fallback: If standard delimiter regex didn't catch (e.g. line-by-line format "A1 RIH 1st POD")
  if (results.length === 0) {
    const lines = cleanedInput.split(/[\n\r]+/);
    for (const line of lines) {
      const lineMatch = line.match(/^\s*([A-Da-d][1-8])\s*[:=\-\s]\s*(.*)$/);
      if (lineMatch) {
        const rawCode = lineMatch[1].toUpperCase();
        const content = lineMatch[2].trim();
        if (content && !processedBedCodes.has(rawCode)) {
          processedBedCodes.add(rawCode);
          const roomCode = rawCode[0] as 'A' | 'B' | 'C' | 'D';
          const bedNumberInRoom = parseInt(rawCode[1], 10);
          const suggestedSex: 'M' | 'F' = (roomCode === 'A' || roomCode === 'B') ? 'M' : 'F';
          results.push(parseSingleBedContent(rawCode, roomCode, bedNumberInRoom, content, suggestedSex));
        }
      }
    }
  }

  return results;
}

function parseSingleBedContent(
  bedCode: string,
  roomCode: 'A' | 'B' | 'C' | 'D',
  bedNumberInRoom: number,
  content: string,
  suggestedSex: 'M' | 'F'
): ParsedBedEntry {
  const lower = content.toLowerCase();

  // 1. Detect Post-Op Day (POD)
  let postOpDay = 'Pre-Op';
  let hasPOD = false;

  const podMatch = content.match(/(\d+)(?:st|nd|rd|th)?\s*pod/i) || 
                   content.match(/pod\s*#?\s*(\d+)/i) || 
                   content.match(/immediate\s*pod/i);

  if (podMatch) {
    hasPOD = true;
    if (podMatch[0].toLowerCase().includes('immediate')) {
      postOpDay = 'Immediate POD';
    } else {
      const num = podMatch[1] || podMatch[0].match(/\d+/)?.[0] || '1';
      const suffix = num === '1' ? '1st' : num === '2' ? '2nd' : num === '3' ? '3rd' : `${num}th`;
      postOpDay = `${suffix} POD`;
    }
  } else if (lower.includes('debridement done') || lower.includes('incision and drainage done') || lower.includes('i&d done')) {
    hasPOD = true;
    postOpDay = 'POD #0 (Procedure Done)';
  } else if (lower.includes('conservative') || lower.includes('manage according to') || lower.includes('manage to')) {
    postOpDay = 'Non-Op';
  }

  // 2. Detect Clinical Status & Color
  let status: PatientStatus = 'er_conservative';

  const isOnList = lower.includes('onlist') || lower.includes('on list') || lower.includes('on-list') || lower.includes('ready for list') || lower.includes('put onlist');
  const isDeferred = lower.includes('deferred') || lower.includes('cardiac fitness not done') || lower.includes('echo+cardiac fitness') || lower.includes('forgotten at the time of list');
  const isOPD = lower.includes('opd');

  if (isOnList && !hasPOD) {
    status = 'er_op_today';
  } else if (hasPOD) {
    // If post-op but mentions "Put onlist if needed"
    if (lower.includes('put onlist if needed')) {
      status = 'er_op_today';
    } else {
      status = 'post_op_stable';
    }
  } else if (lower.includes('acute appendicitis') || lower.includes('acute cholecystitis') || lower.includes('gluteal abscess') || lower.includes('abscess')) {
    status = 'er_op_today';
  } else if (isDeferred || isOPD || lower.includes('dcis')) {
    status = 'elective';
  } else {
    status = 'er_conservative';
  }

  // 3. Separate Diagnosis, Plan & Complaints
  // Split by ellipsis '...' or '....' or 'Kindly' or '('
  const segments = content
    .split(/\.{2,}|\s*-\s*|\s*;\s*|\s*\(\s*|\s*\)\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  let diagnosis = segments[0] || content;
  let managementPlan = '';
  let currentComplaints = '';

  // Expand standard surgical acronyms
  if (diagnosis.toUpperCase().startsWith('RIH')) {
    diagnosis = diagnosis.replace(/RIH/i, 'Right Inguinal Hernia (RIH)');
  } else if (diagnosis.toUpperCase().startsWith('PUH')) {
    diagnosis = diagnosis.replace(/PUH/i, 'Paraumbilical Hernia (PUH)');
  } else if (diagnosis.toUpperCase().startsWith('MRM')) {
    diagnosis = diagnosis.replace(/MRM/i, 'Modified Radical Mastectomy (MRM)');
  } else if (diagnosis.toUpperCase().startsWith('DCIS')) {
    diagnosis = diagnosis.replace(/DCIS/i, 'Ductal Carcinoma In Situ (DCIS)');
  }

  // Separate complaints vs plan
  if (segments.length > 1) {
    const remaining = segments.slice(1).join('. ');
    if (lower.includes('kindly') || lower.includes('plan') || lower.includes('manage') || lower.includes('hb=') || lower.includes('echo') || lower.includes('prepare')) {
      managementPlan = remaining;
    } else {
      currentComplaints = remaining;
    }
  }

  if (!managementPlan) {
    if (status === 'er_op_today') {
      managementPlan = 'Prepare for Emergency/Elective OT list, check NPO & pre-op fitness';
    } else if (status === 'post_op_stable') {
      managementPlan = 'Post-op wound check, monitor vitals, analgesia, mobilize';
    } else {
      managementPlan = 'Conservative medical management, serial assessments';
    }
  }

  // Fasting Status
  let fastingStatus: FastingStatus = 'regular';
  if (status === 'er_op_today' || lower.includes('npo')) {
    fastingStatus = 'npo';
  } else if (hasPOD && (postOpDay.includes('Immediate') || postOpDay.includes('1st'))) {
    fastingStatus = 'sips';
  } else if (status === 'post_op_stable') {
    fastingStatus = 'soft_diet';
  }

  // Operation Name if applicable
  let operationName = '';
  if (hasPOD || lower.includes('appendectomy') || lower.includes('stoma reversal') || lower.includes('ligation') || lower.includes('mrm') || lower.includes('debridement') || lower.includes('incision and drainage')) {
    operationName = diagnosis;
  }

  return {
    bedCode,
    roomCode,
    bedNumberInRoom,
    rawText: content,
    diagnosis,
    operationName: operationName || undefined,
    postOpDay,
    currentComplaints: currentComplaints || 'As documented on handover',
    managementPlan,
    status,
    fastingStatus,
    suggestedSex
  };
}
