import { Bed, WardState, RoomCode } from '../types/ward';

export function generateInitialBeds(): Bed[] {
  const beds: Bed[] = [];
  const roomCodes: RoomCode[] = ['A', 'B', 'C', 'D'];

  let globalBedNumber = 1;

  for (const rCode of roomCodes) {
    let roomId = 1;
    let roomName = 'Room A (Male Ward)';
    if (rCode === 'A') {
      roomId = 1;
      roomName = 'Room A (Male Ward)';
    } else if (rCode === 'B') {
      roomId = 2;
      roomName = 'Room B (Male Ward)';
    } else if (rCode === 'C') {
      roomId = 3;
      roomName = 'Room C (Female Ward)';
    } else {
      roomId = 4;
      roomName = 'Room D (Female Ward)';
    }

    for (let bedIndex = 1; bedIndex <= 8; bedIndex++) {
      const bedCode = `${rCode}${bedIndex}`;
      // Col 1: 1, 2, 3, 4
      // Col 2: 5, 6, 7, 8
      const column = bedIndex <= 4 ? 1 : 2;
      const row = ((bedIndex - 1) % 4 + 1) as 1 | 2 | 3 | 4;

      beds.push({
        id: `bed-${bedCode}`,
        bedCode,
        bedNumber: globalBedNumber++,
        roomCode: rCode,
        roomId,
        roomName,
        column,
        row,
        patient: null
      });
    }
  }

  const findBed = (code: string) => beds.find((b) => b.bedCode === code);

  // --- ROOM A (MALE WARD) ---
  // A1: Onlist for Stoma Reversal...Hb=8...Kindly do distal LOOPOGRAM and Further ready patient for List
  const bA1 = findBed('A1');
  if (bA1) {
    bA1.patient = {
      id: 'pat-A1',
      name: 'Mohammad Tariq',
      age: 48,
      sex: 'M',
      mrn: 'SRG-88301',
      admissionDate: 'Today, 06:00',
      status: 'er_op_today',
      diagnosis: 'Temporary Loop Ileostomy (Prepared for Stoma Reversal)',
      operationName: 'Exploratory Laparotomy & Stoma Reversal',
      postOpDay: 'Pre-Op (On-List)',
      currentComplaints: 'Stoma functioning, Hb low at 8.0 g/dL',
      managementPlan: 'Hb=8.0. Kindly do distal LOOPOGRAM today & further ready patient for list. Transfuse 1 unit PRBC pre-op.',
      fastingStatus: 'npo',
      fastingSince: '02:00',
      vitals: { bp: '122/78', hr: 84, temp: 37.0, spo2: 98, painScore: 2 },
      emergencyORDetails: {
        priority: 'cat2_urgent',
        queuePosition: 1,
        fastingHoursChecked: true,
        consentSigned: true,
        bloodCrossmatched: true,
        anesthesiaEvaluated: true,
        antibioticsGiven: false,
        bookedTime: 'Emergency List Slot 1',
        otRoom: 'Emergency OR 1'
      },
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'Dr. Hassan (On-Call)'
    };
  }

  // A4: Chronic Anal fissure Onlist(Echo+Cardiac fitness Not done Kindly do it)
  const bA4 = findBed('A4');
  if (bA4) {
    bA4.patient = {
      id: 'pat-A4',
      name: 'Zahid Khan',
      age: 56,
      sex: 'M',
      mrn: 'SRG-88304',
      admissionDate: 'Today, 05:30',
      status: 'er_op_today',
      diagnosis: 'Chronic Anal Fissure with Sentinel Pile',
      operationName: 'Lateral Internal Sphincterotomy (LIS) on List',
      postOpDay: 'Pre-Op (On-List)',
      currentComplaints: 'Severe burning anal pain during defecation (8/10), bleeding per rectum',
      managementPlan: 'On-List. Echo + Cardiac fitness NOT DONE — Kindly do it immediately before induction.',
      fastingStatus: 'npo',
      fastingSince: '00:00',
      vitals: { bp: '142/88', hr: 76, temp: 36.8, spo2: 99, painScore: 6 },
      emergencyORDetails: {
        priority: 'cat3_expedited',
        queuePosition: 4,
        fastingHoursChecked: true,
        consentSigned: true,
        bloodCrossmatched: false,
        anesthesiaEvaluated: false,
        antibioticsGiven: false
      },
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'Dr. Hassan'
    };
  }

  // A5: Acute Appendicitis....Leftover Npo was Not complete So will go to OPD
  const bA5 = findBed('A5');
  if (bA5) {
    bA5.patient = {
      id: 'pat-A5',
      name: 'Bilal Ahmed',
      age: 26,
      sex: 'M',
      mrn: 'SRG-88305',
      admissionDate: 'Today, 04:00',
      status: 'er_conservative',
      diagnosis: 'Acute Appendicitis (Settling / Interval)',
      operationName: 'Conservative Trial vs Interval Appendectomy',
      postOpDay: 'Non-Op',
      currentComplaints: 'RLQ dull tenderness improving (3/10), tolerated trial sips',
      managementPlan: 'Leftover NPO was NOT complete, so will go to OPD for interval evaluation or elective list. Monitor serial vitals.',
      fastingStatus: 'sips',
      vitals: { bp: '118/74', hr: 78, temp: 37.2, spo2: 99, painScore: 3 },
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'Resident'
    };
  }

  // A7: Infected wound+Skin around Stoma Inflammed
  const bA7 = findBed('A7');
  if (bA7) {
    bA7.patient = {
      id: 'pat-A7',
      name: 'Usman Ghani',
      age: 62,
      sex: 'M',
      mrn: 'SRG-88307',
      admissionDate: 'Yesterday, 20:00',
      status: 'er_conservative',
      diagnosis: 'Peristomal Pyoderma / Infected Surgical Wound with Inflamed Peristomal Skin',
      operationName: 'Wound Dressing & Conservative Care',
      postOpDay: 'Non-Op',
      currentComplaints: 'Erythema, purulent discharge around stoma site, burning pain (5/10)',
      managementPlan: 'Infected wound + skin around stoma inflamed. Regular saline flush, hydrocolloid wafer dressing, oral/IV antibiotics, consult stoma care nurse.',
      fastingStatus: 'regular',
      vitals: { bp: '130/82', hr: 82, temp: 37.6, spo2: 98, painScore: 5 },
      antibiotics: 'IV Augmentin 1.2g TDS',
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'Dr. Hassan'
    };
  }

  // --- ROOM B (MALE WARD) ---
  // B2: RIH 1st POD
  const bB2 = findBed('B2');
  if (bB2) {
    bB2.patient = {
      id: 'pat-B2',
      name: 'Rashid Ali',
      age: 44,
      sex: 'M',
      mrn: 'SRG-88312',
      admissionDate: 'Yesterday',
      status: 'post_op_stable',
      diagnosis: 'Right Inguinal Hernia (RIH)',
      operationName: 'Lichtenstein Mesh Hernioplasty (Done Yesterday)',
      postOpDay: '1st POD',
      currentComplaints: 'Mild right groin ache (2/10), voided clear urine, ambulating in room',
      managementPlan: 'RIH 1st POD. Oral analgesics, light diet, wound inspection dry, planned discharge tomorrow morning.',
      fastingStatus: 'soft_diet',
      vitals: { bp: '120/78', hr: 72, temp: 36.7, spo2: 99, painScore: 2 },
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'Resident'
    };
  }

  // B5: R arm Cellulitis....Debridement done
  const bB5 = findBed('B5');
  if (bB5) {
    bB5.patient = {
      id: 'pat-B5',
      name: 'Hamza Farooq',
      age: 39,
      sex: 'M',
      mrn: 'SRG-88315',
      admissionDate: 'Yesterday',
      status: 'post_op_stable',
      diagnosis: 'Severe Right Arm Cellulitis with Tissue Necrosis',
      operationName: 'Emergency Surgical Debridement Done',
      postOpDay: '1st POD (Debridement Done)',
      currentComplaints: 'Wound dressing intact, limb elevation maintained, pain well managed (3/10)',
      managementPlan: 'R arm cellulitis: Debridement done. Continue IV broad spectrum antibiotics, elevate right upper limb on sling, inspect wound bed in 24h.',
      fastingStatus: 'regular',
      vitals: { bp: '124/76', hr: 80, temp: 37.3, spo2: 98, painScore: 3 },
      antibiotics: 'IV Piperacillin-Tazobactam 4.5g TDS',
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'Resident'
    };
  }

  // B8: Haemorrhoids Multiple Ligation 3rd POD.....Kindly Reasses patient and Put onlist if needed and prepare for list.....
  const bB8 = findBed('B8');
  if (bB8) {
    bB8.patient = {
      id: 'pat-B8',
      name: 'Farhan Sheikh',
      age: 51,
      sex: 'M',
      mrn: 'SRG-88318',
      admissionDate: '3 days ago',
      status: 'post_op_stable',
      diagnosis: 'Grade III/IV Internal Hemorrhoids',
      operationName: 'Multiple Hemorrhoidal Band Ligation',
      postOpDay: '3rd POD',
      currentComplaints: 'Perianal discomfort, mild bleeding on defecation (4/10)',
      managementPlan: 'Haemorrhoids Multiple Ligation 3rd POD. Kindly reassess patient and PUT ON-LIST IF NEEDED and prepare for list. Sitz baths, laxatives.',
      fastingStatus: 'soft_diet',
      vitals: { bp: '128/80', hr: 74, temp: 36.9, spo2: 99, painScore: 4 },
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'Dr. Hassan'
    };
  }

  // --- ROOM C (FEMALE WARD) ---
  // C1: MRM(1st POD)
  const bC1 = findBed('C1');
  if (bC1) {
    bC1.patient = {
      id: 'pat-C1',
      name: 'Fatima Bibi',
      age: 58,
      sex: 'F',
      mrn: 'SRG-88321',
      admissionDate: 'Yesterday',
      status: 'post_op_stable',
      diagnosis: 'Carcinoma of Left Breast (cT2N1M0)',
      operationName: 'Left Modified Radical Mastectomy (MRM)',
      postOpDay: '1st POD',
      currentComplaints: 'Axillary drain in situ, pain controlled (3/10), eating breakfast',
      managementPlan: 'MRM 1st POD. Measure 24h axillary drain output, physiotherapy for left arm mobilization, oral analgesia.',
      fastingStatus: 'regular',
      vitals: { bp: '130/80', hr: 76, temp: 36.8, spo2: 98, painScore: 3 },
      drainOutput: 'Axillary Redivac: 65ml serosanguinous',
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'Consultant Rounds'
    };
  }

  // C2: PUH onlist
  const bC2 = findBed('C2');
  if (bC2) {
    bC2.patient = {
      id: 'pat-C2',
      name: 'Nasreen Akhtar',
      age: 49,
      sex: 'F',
      mrn: 'SRG-88322',
      admissionDate: 'Today, 06:30',
      status: 'er_op_today',
      diagnosis: 'Incarcerated Paraumbilical Hernia (PUH)',
      operationName: 'Emergency Mayo Herniorrhaphy / Mesh Repair',
      postOpDay: 'Pre-Op (On-List)',
      currentComplaints: 'Tender umbilical swelling, colicky peri-umbilical pain (7/10), nausea',
      managementPlan: 'PUH on-list. Strict NPO, IV cannula, baseline labs & consent ready for emergency OR list today.',
      fastingStatus: 'npo',
      fastingSince: '01:00',
      vitals: { bp: '136/84', hr: 88, temp: 37.4, spo2: 99, painScore: 7 },
      emergencyORDetails: {
        priority: 'cat2_urgent',
        queuePosition: 2,
        fastingHoursChecked: true,
        consentSigned: true,
        bloodCrossmatched: true,
        anesthesiaEvaluated: true,
        antibioticsGiven: true,
        bookedTime: '11:00 AM',
        otRoom: 'Emergency OR 2'
      },
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'Dr. Hassan'
    };
  }

  // C3: orthopedics old Patient admitted for Shortness of Breath Under name of Dr Ishaq....
  const bC3 = findBed('C3');
  if (bC3) {
    bC3.patient = {
      id: 'pat-C3',
      name: 'Salma Begum',
      age: 68,
      sex: 'F',
      mrn: 'SRG-88323',
      admissionDate: 'Today, 01:15',
      status: 'er_conservative',
      diagnosis: 'Post-Trauma Orthopedic Patient with Acute Shortness of Breath (Rule out Pulmonary Embolism)',
      operationName: 'Conservative / Cross-Consultation',
      postOpDay: 'Non-Op',
      currentComplaints: 'Sudden dyspnea, pleuritic chest tightness, immobilized for femur fracture',
      managementPlan: 'Orthopedics old patient admitted for shortness of breath under name of Dr. Ishaq. Urgent CT-PA (CT Pulmonary Angiogram), O2 via face mask, ECG, D-dimer, cardiology & pulmonology urgent call.',
      fastingStatus: 'sips',
      vitals: { bp: '144/90', hr: 110, temp: 37.5, spo2: 94, painScore: 4, respiratoryRate: 24 },
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'Dr. Hassan'
    };
  }

  // C5: Right Gluteal Abscess
  const bC5 = findBed('C5');
  if (bC5) {
    bC5.patient = {
      id: 'pat-C5',
      name: 'Khadija Bibi',
      age: 33,
      sex: 'F',
      mrn: 'SRG-88325',
      admissionDate: 'Today, 07:00',
      status: 'er_op_today',
      diagnosis: 'Large Fluctuant Right Gluteal Abscess (Post-Injection)',
      operationName: 'Emergency Examination under Anesthesia & Incision & Drainage (I&D)',
      postOpDay: 'Pre-Op (On-List)',
      currentComplaints: 'Exquisite throbbing right buttock pain (9/10), unable to lie flat or sit, fever 38.4°C',
      managementPlan: 'Right gluteal abscess on list for emergency I&D. Keep NPO, send CBC & Coags, IV analgesia, IV Augmentin 1.2g.',
      fastingStatus: 'npo',
      fastingSince: '03:00',
      vitals: { bp: '124/80', hr: 98, temp: 38.4, spo2: 99, painScore: 9 },
      emergencyORDetails: {
        priority: 'cat2_urgent',
        queuePosition: 3,
        fastingHoursChecked: true,
        consentSigned: true,
        bloodCrossmatched: false,
        anesthesiaEvaluated: true,
        antibioticsGiven: true,
        bookedTime: '12:30 PM'
      },
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'Dr. Hassan'
    };
  }

  // C6: Appendectomy Immediate POD
  const bC6 = findBed('C6');
  if (bC6) {
    bC6.patient = {
      id: 'pat-C6',
      name: 'Ayesha Noor',
      age: 21,
      sex: 'F',
      mrn: 'SRG-88326',
      admissionDate: 'Today, 03:00',
      status: 'post_op_stable',
      diagnosis: 'Acute Perforated Appendicitis (Operated)',
      operationName: 'Laparoscopic Appendectomy (Just Completed)',
      postOpDay: 'Immediate POD',
      currentComplaints: 'Drowsy post-anesthesia, port site pain 4/10, vitals stable',
      managementPlan: 'Appendectomy Immediate POD. IV fluids 100ml/hr, monitor vitals Q30min x 2 hours, keep NPO until fully awake, then trial sips.',
      fastingStatus: 'npo',
      vitals: { bp: '112/68', hr: 84, temp: 37.1, spo2: 98, painScore: 4 },
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'Dr. Hassan'
    };
  }

  // C8: Breast Abscess Incision and Drainage done
  const bC8 = findBed('C8');
  if (bC8) {
    bC8.patient = {
      id: 'pat-C8',
      name: 'Zainab Bibi',
      age: 29,
      sex: 'F',
      mrn: 'SRG-88328',
      admissionDate: 'Yesterday',
      status: 'post_op_stable',
      diagnosis: 'Lactational Right Breast Abscess',
      operationName: 'Incision and Drainage Done (Yesterday)',
      postOpDay: '1st POD (I&D Done)',
      currentComplaints: 'Wound ribbon gauze packing in situ, pain decreased to 2/10, fever resolved',
      managementPlan: 'Breast Abscess Incision & Drainage done. Remove ribbon gauze packing today, warm saline soak, re-pack with Betadine gauze, continue oral antibiotics.',
      fastingStatus: 'regular',
      vitals: { bp: '118/74', hr: 72, temp: 36.8, spo2: 100, painScore: 2 },
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'Resident'
    };
  }

  // --- ROOM D (FEMALE WARD) ---
  // D1: Cholelithiasis...Has DM Manage According To Medicine Call
  const bD1 = findBed('D1');
  if (bD1) {
    bD1.patient = {
      id: 'pat-D1',
      name: 'Parveen Bibi',
      age: 54,
      sex: 'F',
      mrn: 'SRG-88331',
      admissionDate: 'Yesterday',
      status: 'er_conservative',
      diagnosis: 'Symptomatic Cholelithiasis + Type 2 Diabetes Mellitus',
      operationName: 'Medical Optimization for Elective Cholecystectomy',
      postOpDay: 'Non-Op',
      currentComplaints: 'Occasional RUQ dyspepsia, random blood glucose 240 mg/dL',
      managementPlan: 'Cholelithiasis. Has DM — Manage according to Medicine call. Sliding scale regular insulin, diabetic diet, plan elective list once HbA1c controlled.',
      fastingStatus: 'regular',
      vitals: { bp: '138/85', hr: 78, temp: 36.7, spo2: 98, painScore: 1 },
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'Dr. Hassan'
    };
  }

  // D3: Acute Cholecystitis
  const bD3 = findBed('D3');
  if (bD3) {
    bD3.patient = {
      id: 'pat-D3',
      name: 'Razia Sultana',
      age: 46,
      sex: 'F',
      mrn: 'SRG-88333',
      admissionDate: 'Today, 02:45',
      status: 'er_op_today',
      diagnosis: 'Acute Calculous Cholecystitis with Positive Murphy’s Sign',
      operationName: 'Urgent Laparoscopic Cholecystectomy (Hot Gallbladder)',
      postOpDay: 'Pre-Op (ER Acute)',
      currentComplaints: 'Severe RUQ pain radiating to back (7/10), nausea, fever 38.2°C',
      managementPlan: 'Acute Cholecystitis on ER call. NPO, IV Ampicillin-Sulbactam 1.5g Q6H, IV fluids, prepare for hot lap chole list today.',
      fastingStatus: 'npo',
      fastingSince: '01:00',
      vitals: { bp: '132/86', hr: 92, temp: 38.2, spo2: 98, painScore: 7 },
      emergencyORDetails: {
        priority: 'cat2_urgent',
        queuePosition: 5,
        fastingHoursChecked: true,
        consentSigned: true,
        bloodCrossmatched: true,
        anesthesiaEvaluated: true,
        antibioticsGiven: true,
        bookedTime: '14:00 PM'
      },
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'Dr. Hassan'
    };
  }

  // D4: Appendectomy
  const bD4 = findBed('D4');
  if (bD4) {
    bD4.patient = {
      id: 'pat-D4',
      name: 'Nadia Qasim',
      age: 23,
      sex: 'F',
      mrn: 'SRG-88334',
      admissionDate: 'Yesterday',
      status: 'post_op_stable',
      diagnosis: 'Acute Appendicitis',
      operationName: 'Laparoscopic Appendectomy POD #1',
      postOpDay: '1st POD',
      currentComplaints: 'Minimal umbilical port soreness (2/10), eating light porridge, mobile',
      managementPlan: 'Appendectomy 1st POD. Oral analgesia, wound clean, discharge counseling for evening or tomorrow.',
      fastingStatus: 'soft_diet',
      vitals: { bp: '116/70', hr: 70, temp: 36.9, spo2: 99, painScore: 2 },
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'Intern'
    };
  }

  // D5: Anal Fissure...Was supposed to be done today but Anesthesia team deferred To under case and asked for Cardiac fitness.....Kindly Prepare for List If Needed
  const bD5 = findBed('D5');
  if (bD5) {
    bD5.patient = {
      id: 'pat-D5',
      name: 'Shamim Akhtar',
      age: 60,
      sex: 'F',
      mrn: 'SRG-88335',
      admissionDate: 'Yesterday',
      status: 'elective',
      diagnosis: 'Chronic Anal Fissure with Hypertension',
      operationName: 'Deferred Lateral Internal Sphincterotomy',
      postOpDay: 'Pre-Op (Elective Deferred)',
      currentComplaints: 'Anal pain on bowel movement (5/10), awaiting cardiac clearance',
      managementPlan: 'Anal Fissure. Was supposed to be done today but Anesthesia team deferred and asked for CARDIAC FITNESS. Kindly prepare for list once fitness clearance signed.',
      fastingStatus: 'regular',
      vitals: { bp: '152/94', hr: 84, temp: 36.7, spo2: 97, painScore: 5 },
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'Dr. Hassan'
    };
  }

  // D6: DCIS of Left Breat....Patient was admitted through OPD for list but Was forgotten at the time of list making....
  const bD6 = findBed('D6');
  if (bD6) {
    bD6.patient = {
      id: 'pat-D6',
      name: 'Tahira Jabeen',
      age: 47,
      sex: 'F',
      mrn: 'SRG-88336',
      admissionDate: 'Yesterday',
      status: 'elective',
      diagnosis: 'Ductal Carcinoma In Situ (DCIS) of Left Breast',
      operationName: 'Left Wide Local Excision (Lumpectomy) & Sentinel Node Biopsy',
      postOpDay: 'Pre-Op (Elective OPD List)',
      currentComplaints: 'No acute pain, fasting since midnight, anxious regarding list inclusion',
      managementPlan: 'DCIS of Left Breast. Patient was admitted through OPD for list but was forgotten at time of list making! Liaise with OT coordinator to add as add-on elective case today.',
      fastingStatus: 'npo',
      fastingSince: '00:00',
      vitals: { bp: '126/80', hr: 78, temp: 36.6, spo2: 99, painScore: 1 },
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'Dr. Hassan'
    };
  }

  // D7: Right BREAST Abscess...Incision and Drainage done
  const bD7 = findBed('D7');
  if (bD7) {
    bD7.patient = {
      id: 'pat-D7',
      name: 'Kulsoom Bibi',
      age: 32,
      sex: 'F',
      mrn: 'SRG-88337',
      admissionDate: 'Yesterday',
      status: 'post_op_stable',
      diagnosis: 'Right Breast Abscess',
      operationName: 'Incision and Drainage Done (Yesterday)',
      postOpDay: '1st POD (I&D Done)',
      currentComplaints: 'Wound packing intact, minimal pain 2/10, no active bleeding',
      managementPlan: 'Right Breast Abscess: Incision and Drainage done. Inspect dressing, change packing, continue oral antibiotics, analgesia.',
      fastingStatus: 'regular',
      vitals: { bp: '120/76', hr: 72, temp: 36.8, spo2: 100, painScore: 2 },
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'Resident'
    };
  }

  // D8: Stoma Reversal 1st POD...
  const bD8 = findBed('D8');
  if (bD8) {
    bD8.patient = {
      id: 'pat-D8',
      name: 'Shahida Perveen',
      age: 53,
      sex: 'F',
      mrn: 'SRG-88338',
      admissionDate: '2 days ago',
      status: 'post_op_stable',
      diagnosis: 'Status Post Stoma Reversal (Ileostomy Closure)',
      operationName: 'Exploratory Laparotomy & Ileostomy Closure (Yesterday)',
      postOpDay: '1st POD',
      currentComplaints: 'Midline incision and peristomal wound mild pain (3/10), no nausea, flatus not yet passed',
      managementPlan: 'Stoma Reversal 1st POD. IV maintenance fluids 100ml/hr, trial sips of water, incentive spirometry, mobilize with nurse.',
      fastingStatus: 'sips',
      vitals: { bp: '124/78', hr: 80, temp: 37.1, spo2: 98, painScore: 3 },
      updatedAt: new Date().toISOString(),
      lastUpdatedBy: 'Consultant Rounds'
    };
  }

  return beds;
}

export function createInitialWardState(): WardState {
  return {
    beds: generateInitialBeds(),
    shiftDate: new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    onCallTeam: {
      consultant: 'Dr. Ishaq (Surgical Consultant)',
      registrar: 'Dr. Tariq (Senior Registrar)',
      resident: 'Dr. Hassan (On-Call ER Ward Resident)',
      intern: 'Dr. Maya (Surgical Intern)'
    },
    lastSyncTimestamp: Date.now(),
    announcement: '🚨 ER Call Active: Rooms A & B (Male), Rooms C & D (Female) · 32 Beds (A1–D8) · 12 Vacant Beds for ER Intake'
  };
}
