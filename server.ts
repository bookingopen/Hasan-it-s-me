import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { createInitialWardState } from './src/data/initialWardState';
import { WardState, Bed, Patient } from './src/types/ward';

const PORT = Number(process.env.PORT) || 3000;
const app = express();

app.use(express.json());

// Persistent state cache file path
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'ward-state.json');

// Initialize or load ward state
let currentWardState: WardState;

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (fs.existsSync(STATE_FILE)) {
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    const parsedState = JSON.parse(raw);
    // Check if state is in modern format with bedCode (A1..D8)
    if (parsedState && Array.isArray(parsedState.beds) && parsedState.beds[0]?.bedCode) {
      currentWardState = parsedState;
    } else {
      currentWardState = createInitialWardState();
      saveStateToFile();
    }
  } catch (err) {
    console.error('Failed to parse ward-state.json, initializing fresh state:', err);
    currentWardState = createInitialWardState();
    saveStateToFile();
  }
} else {
  currentWardState = createInitialWardState();
  saveStateToFile();
}

function saveStateToFile() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(currentWardState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving ward state to file:', err);
  }
}

// Connected SSE clients for instantaneous multi-phone live sync
type SSEClient = {
  id: string;
  res: Response;
};
const sseClients = new Map<string, SSEClient>();

function broadcastState() {
  currentWardState.lastSyncTimestamp = Date.now();
  saveStateToFile();
  const payload = `data: ${JSON.stringify(currentWardState)}\n\n`;
  for (const [id, client] of sseClients.entries()) {
    try {
      client.res.write(payload);
    } catch {
      sseClients.delete(id);
    }
  }
}

// SSE Stream Endpoint for real-time mobile sync
app.get('/api/ward/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  sseClients.set(clientId, { id: clientId, res });

  // Send immediate current state
  res.write(`data: ${JSON.stringify(currentWardState)}\n\n`);

  // Heartbeat ping every 20 seconds to prevent mobile network dropouts
  const keepAlive = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(keepAlive);
      sseClients.delete(clientId);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(keepAlive);
    sseClients.delete(clientId);
  });
});

// REST Endpoints
app.get('/api/ward', (_req: Request, res: Response) => {
  res.json(currentWardState);
});

// Update a bed / patient
app.post('/api/ward/bed/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { patient, lastUpdatedBy } = req.body;

  const bedIndex = currentWardState.beds.findIndex((b) => b.id === id);
  if (bedIndex === -1) {
    return res.status(404).json({ error: 'Bed not found' });
  }

  if (patient) {
    const updatedPatient: Patient = {
      ...patient,
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: lastUpdatedBy || 'On-Call Surgeon'
    };
    currentWardState.beds[bedIndex].patient = updatedPatient;
  } else {
    currentWardState.beds[bedIndex].patient = null;
  }

  broadcastState();
  res.json({ success: true, bed: currentWardState.beds[bedIndex] });
});

// Admit patient directly to a bed
app.post('/api/ward/admit', (req: Request, res: Response) => {
  const { bedId, patient, admittedBy } = req.body;
  const bed = currentWardState.beds.find((b) => b.id === bedId);
  if (!bed) {
    return res.status(404).json({ error: 'Bed not found' });
  }

  const newPatient: Patient = {
    ...patient,
    id: `pat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    admissionDate: patient.admissionDate || 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    updatedAt: new Date().toISOString(),
    lastUpdatedBy: admittedBy || 'On-Call Resident'
  };

  bed.patient = newPatient;
  broadcastState();
  res.json({ success: true, bed });
});

// Discharge / Clear bed
app.post('/api/ward/bed/:id/discharge', (req: Request, res: Response) => {
  const { id } = req.params;
  const bed = currentWardState.beds.find((b) => b.id === id);
  if (!bed) {
    return res.status(404).json({ error: 'Bed not found' });
  }

  bed.patient = null;
  broadcastState();
  res.json({ success: true, bed });
});

// Swap or move patients between 2 beds
app.post('/api/ward/swap', (req: Request, res: Response) => {
  const { fromBedId, toBedId } = req.body;
  const bedA = currentWardState.beds.find((b) => b.id === fromBedId);
  const bedB = currentWardState.beds.find((b) => b.id === toBedId);

  if (!bedA || !bedB) {
    return res.status(404).json({ error: 'One or both beds not found' });
  }

  const temp = bedA.patient;
  bedA.patient = bedB.patient;
  bedB.patient = temp;

  if (bedA.patient) {
    bedA.patient.updatedAt = new Date().toISOString();
  }
  if (bedB.patient) {
    bedB.patient.updatedAt = new Date().toISOString();
  }

  broadcastState();
  res.json({ success: true, bedA, bedB });
});

// Reorder emergency theater list queue
app.post('/api/ward/theater/reorder', (req: Request, res: Response) => {
  const { orderedPatientIds } = req.body as { orderedPatientIds: string[] };

  if (Array.isArray(orderedPatientIds)) {
    orderedPatientIds.forEach((patId, index) => {
      for (const bed of currentWardState.beds) {
        if (bed.patient && bed.patient.id === patId) {
          if (!bed.patient.emergencyORDetails) {
            bed.patient.emergencyORDetails = {
              priority: 'cat2_urgent',
              queuePosition: index + 1,
              fastingHoursChecked: true,
              consentSigned: true,
              bloodCrossmatched: false,
              anesthesiaEvaluated: false,
              antibioticsGiven: false
            };
          } else {
            bed.patient.emergencyORDetails.queuePosition = index + 1;
          }
        }
      }
    });
  }

  broadcastState();
  res.json({ success: true });
});

// Reset demo ward data
app.post('/api/ward/reset', (_req: Request, res: Response) => {
  currentWardState = createInitialWardState();
  broadcastState();
  res.json({ success: true, state: currentWardState });
});

// Batch Import beds from text parser
app.post('/api/ward/import-beds', (req: Request, res: Response) => {
  const { entries, overwriteAll } = req.body as { entries: any[]; overwriteAll?: boolean };

  if (!Array.isArray(entries)) {
    return res.status(400).json({ error: 'Invalid entries array' });
  }

  const updatedCodes = new Set<string>();

  for (const entry of entries) {
    const bed = currentWardState.beds.find((b) => b.bedCode === entry.bedCode);
    if (bed) {
      updatedCodes.add(entry.bedCode);
      const existingPat = bed.patient;
      const patientId = existingPat?.id || `pat-${entry.bedCode}-${Date.now()}`;
      const patientName = existingPat?.name || `Patient ${entry.bedCode}`;
      const age = existingPat?.age || 45;
      const sex = entry.suggestedSex || (bed.roomCode === 'A' || bed.roomCode === 'B' ? 'M' : 'F');
      const mrn = existingPat?.mrn || `SRG-${Math.floor(10000 + Math.random() * 90000)}`;

      bed.patient = {
        id: patientId,
        name: patientName,
        age,
        sex,
        mrn,
        admissionDate: existingPat?.admissionDate || 'Today, Handover',
        status: entry.status || 'er_conservative',
        diagnosis: entry.diagnosis,
        operationName: entry.operationName,
        postOpDay: entry.postOpDay || 'Pre-Op',
        currentComplaints: entry.currentComplaints || 'From text handover',
        managementPlan: entry.managementPlan || 'Observation',
        fastingStatus: entry.fastingStatus || 'regular',
        vitals: existingPat?.vitals || {
          bp: '120/80',
          hr: 80,
          temp: 37.0,
          spo2: 99,
          painScore: 3
        },
        emergencyORDetails: entry.status === 'er_op_today' ? {
          priority: 'cat2_urgent',
          queuePosition: 1,
          fastingHoursChecked: entry.fastingStatus === 'npo',
          consentSigned: true,
          bloodCrossmatched: false,
          anesthesiaEvaluated: false,
          antibioticsGiven: true,
          bookedTime: 'Today'
        } : undefined,
        updatedAt: new Date().toISOString(),
        lastUpdatedBy: 'Text Handover Import'
      };
    }
  }

  // If overwriteAll is requested, clear unmentioned beds to vacant
  if (overwriteAll) {
    for (const bed of currentWardState.beds) {
      if (!updatedCodes.has(bed.bedCode)) {
        bed.patient = null;
      }
    }
  }

  broadcastState();
  res.json({ success: true, count: updatedCodes.size, beds: currentWardState.beds });
});

// Update announcement
app.post('/api/ward/announcement', (req: Request, res: Response) => {
  const { announcement } = req.body;
  currentWardState.announcement = announcement;
  broadcastState();
  res.json({ success: true, announcement });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Mount Vite in dev mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve static in production
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SurgeSync server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
