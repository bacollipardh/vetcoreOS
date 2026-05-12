// P1 Clinic Core MVP coverage: F001-F018 patients, F019-F029 owners, F030-F045 visits.
export const clinicCoreFeatureCoverage = [
  {
    range: "F001-F018",
    area: "Patients",
    description:
      "Animal profile, identifiers, status, tags, weight, allergies and owner relationships.",
  },
  {
    range: "F019-F029",
    area: "Owners",
    description:
      "Client identity, address, contact channels, preferences, balance, tags and interaction history.",
  },
  {
    range: "F030-F045",
    area: "Visits",
    description:
      "Visit type, anamnesis, physical exam, diagnosis, treatment plan, procedures, signature and continuity.",
  },
];

export const seedOwners = [
  {
    id: "own_001",
    displayName: "Arta Krasniqi",
    documentId: "EU-KS-102938",
    language: "sq",
    preferredChannel: "WhatsApp",
    phone: "+38344111222",
    email: "arta.krasniqi@example.com",
    address: {
      line1: "Rruga B, 14",
      city: "Prishtine",
      region: "Kosove",
      country: "XK",
      postalCode: "10000",
    },
    marketingConsent: true,
    balanceCents: 4500,
    tags: ["VIP", "multi-pet"],
    privateNote: "Preferon njoftime pas ores 17:00.",
    interactionTimeline: [
      {
        at: "2026-05-01T09:10:00.000Z",
        channel: "Phone",
        summary: "Konfirmoi kontrollin vjetor.",
      },
      {
        at: "2026-05-03T15:30:00.000Z",
        channel: "WhatsApp",
        summary: "Kerkoi kopje te certifikates se vaksines.",
      },
    ],
  },
  {
    id: "own_002",
    displayName: "Lukas Schneider",
    documentId: "DE-778811",
    language: "de",
    preferredChannel: "Email",
    phone: "+4915112345678",
    email: "lukas.schneider@example.de",
    address: {
      line1: "Hauptstrasse 22",
      city: "Berlin",
      region: "Berlin",
      country: "DE",
      postalCode: "10115",
    },
    marketingConsent: false,
    balanceCents: 0,
    tags: ["EU-passport"],
    privateNote: "Kerkon dokumente ne gjermanisht.",
    interactionTimeline: [
      {
        at: "2026-04-22T10:00:00.000Z",
        channel: "Email",
        summary: "Derguar udhezimet per EU Pet Passport.",
      },
    ],
  },
];

export const seedPatients = [
  {
    id: "pat_001",
    name: "Rex",
    species: "Dog",
    breed: "Golden Retriever",
    sex: "Male",
    birthDate: "2021-04-12",
    neutered: true,
    color: "Golden",
    microchip: "900113000001111",
    passportNumber: "XK-PET-2026-0001",
    status: "active",
    ownerIds: ["own_001"],
    tags: ["friendly", "annual-plan"],
    allergies: [
      {
        substance: "Penicillin",
        severity: "critical",
        note: "Avoid beta-lactam antibiotics.",
      },
    ],
    behaviorNotes: [
      "Fear-free profile: responds well to treats.",
      "Mild stress around clippers.",
    ],
    weightHistory: [
      { date: "2025-12-01", weightKg: 28.4 },
      { date: "2026-05-03", weightKg: 29.1 },
    ],
    bcs: { scale: "1-9", score: 5, recordedAt: "2026-05-03" },
    photoGallery: [],
  },
  {
    id: "pat_002",
    name: "Mila",
    species: "Cat",
    breed: "European Shorthair",
    sex: "Female",
    birthDate: "2022-09-18",
    neutered: true,
    color: "Grey tabby",
    microchip: "276098108888888",
    passportNumber: "DE-PET-2026-1842",
    status: "active",
    ownerIds: ["own_002"],
    tags: ["indoor", "EU-passport"],
    allergies: [],
    behaviorNotes: ["Shy during exam; use towel handling."],
    weightHistory: [
      { date: "2026-01-10", weightKg: 4.1 },
      { date: "2026-04-22", weightKg: 4.3 },
    ],
    bcs: { scale: "1-9", score: 6, recordedAt: "2026-04-22" },
    photoGallery: [],
  },
];

export const seedVisits = [
  {
    id: "vis_001",
    patientId: "pat_001",
    ownerId: "own_001",
    visitType: "Annual wellness",
    status: "signed",
    startedAt: "2026-05-03T08:30:00.000Z",
    clinician: "Dr. Elira Hoxha",
    anamnesis:
      "Owner reports normal appetite and activity. Mild itching after spring walks.",
    physicalExam: {
      temperatureC: 38.5,
      pulseBpm: 88,
      respirationRpm: 24,
      mucousMembranes: "Pink, moist",
      lymphNodes: "Normal",
    },
    diagnoses: [
      { system: "VeNom", code: "SKIN-PRURITUS", label: "Seasonal pruritus" },
    ],
    differentialDiagnoses: ["Atopy", "Flea allergy dermatitis"],
    treatmentPlan: [
      "Start parasite prevention refill.",
      "Recheck skin if itching persists beyond 14 days.",
    ],
    procedures: [
      { name: "Wellness exam", costCents: 3500 },
      { name: "Nail trim", costCents: 800 },
    ],
    signedBy: "Dr. Elira Hoxha",
    signedAt: "2026-05-03T09:05:00.000Z",
    continuityFromVisitId: null,
    amendments: [],
  },
  {
    id: "vis_002",
    patientId: "pat_002",
    ownerId: "own_002",
    visitType: "EU passport review",
    status: "draft",
    startedAt: "2026-04-22T11:20:00.000Z",
    clinician: "Dr. Nora Berisha",
    anamnesis:
      "Travel planned within EU. Owner requested microchip and passport verification.",
    physicalExam: {
      temperatureC: 38.2,
      pulseBpm: 132,
      respirationRpm: 28,
      mucousMembranes: "Pink",
      lymphNodes: "Normal",
    },
    diagnoses: [],
    differentialDiagnoses: [],
    treatmentPlan: [
      "Confirm rabies vaccine record.",
      "Prepare downloadable passport PDF in later phase.",
    ],
    procedures: [{ name: "Microchip scan", costCents: 1200 }],
    signedBy: null,
    signedAt: null,
    continuityFromVisitId: null,
    amendments: [],
  },
];

export const seedVaccinations = [
  {
    id: "vac_001",
    patientId: "pat_001",
    vaccineName: "Rabies",
    protocol: "EU Pet Passport core",
    manufacturer: "VetBio EU",
    lotNumber: "RB-2026-001",
    expiresAt: "2027-04-30",
    administeredAt: "2026-05-03",
    nextDueAt: "2027-05-03",
    status: "current",
    inventoryReduced: true,
    certificateStatus: "ready-for-pdf",
  },
  {
    id: "vac_002",
    patientId: "pat_002",
    vaccineName: "FVRCP",
    protocol: "Cat core annual",
    manufacturer: "FelineCare",
    lotNumber: "FC-2025-778",
    expiresAt: "2026-03-01",
    administeredAt: "2025-04-22",
    nextDueAt: "2026-04-22",
    status: "overdue",
    inventoryReduced: true,
    certificateStatus: "needs-review",
  },
];

export const seedPrescriptions = [
  {
    id: "rx_001",
    patientId: "pat_001",
    visitId: "vis_001",
    medicationName: "Apoquel",
    catalogCode: "ATCVET-QD11AH90",
    defaultDoseMgPerKg: 0.45,
    patientWeightKg: 29.1,
    calculatedDoseMg: 13.1,
    route: "PO",
    frequency: "BID",
    durationDays: 14,
    controlledSubstance: false,
    prescriptionRequired: true,
    safetyAlerts: [],
    refillDueAt: "2026-05-17",
    complianceStatus: "monitoring",
    signedBy: "Dr. Elira Hoxha",
    signedAt: "2026-05-03T09:06:00.000Z",
  },
  {
    id: "rx_002",
    patientId: "pat_002",
    visitId: "vis_002",
    medicationName: "Buprenorphine",
    catalogCode: "ATCVET-QN02AE01",
    defaultDoseMgPerKg: 0.02,
    patientWeightKg: 4.3,
    calculatedDoseMg: 0.09,
    route: "Buccal",
    frequency: "TID",
    durationDays: 3,
    controlledSubstance: true,
    prescriptionRequired: true,
    safetyAlerts: ["Controlled substance log required"],
    refillDueAt: null,
    complianceStatus: "clinic-administered",
    signedBy: null,
    signedAt: null,
  },
];

export const seedSurgeries = [
  {
    id: "surg_001",
    patientId: "pat_001",
    visitId: "vis_001",
    procedureName: "Dental cleaning under anesthesia",
    scheduledAt: "2026-05-20T08:00:00.000Z",
    surgeon: "Dr. Elira Hoxha",
    status: "planned",
    estimateCents: 18500,
    consentStatus: "signed",
    preOpChecklist: [
      { label: "Fasting confirmed", done: true },
      { label: "Bloodwork reviewed", done: true },
      { label: "Anesthesia risk discussed", done: true },
      { label: "IV catheter placed", done: false },
    ],
    anesthesiaRecord: [
      {
        minute: 0,
        heartRate: 92,
        respiration: 18,
        temperatureC: 38.2,
        note: "Induction started",
      },
      {
        minute: 5,
        heartRate: 88,
        respiration: 16,
        temperatureC: 38.1,
        note: "Stable",
      },
    ],
    drugsGiven: [{ name: "Propofol", amount: "4 mg/kg", atMinute: 0 }],
    recoveryStatus: "not-started",
    dischargeInstructions: "",
    followUpDueAt: "2026-05-27",
  },
  {
    id: "surg_002",
    patientId: "pat_002",
    visitId: "vis_002",
    procedureName: "Spay scar revision",
    scheduledAt: "2026-05-12T10:30:00.000Z",
    surgeon: "Dr. Nora Berisha",
    status: "recovery",
    estimateCents: 9500,
    consentStatus: "pending",
    preOpChecklist: [
      { label: "Fasting confirmed", done: true },
      { label: "Consent signed", done: false },
      { label: "Pain plan prepared", done: true },
    ],
    anesthesiaRecord: [
      {
        minute: 0,
        heartRate: 128,
        respiration: 22,
        temperatureC: 38.0,
        note: "Light sedation",
      },
    ],
    drugsGiven: [{ name: "Meloxicam", amount: "0.05 mg/kg", atMinute: 0 }],
    recoveryStatus: "monitoring",
    dischargeInstructions: "Keep collar on for 7 days. Check incision daily.",
    followUpDueAt: "2026-05-19",
  },
];

export const seedHospitalizations = [
  {
    id: "hosp_001",
    patientId: "pat_001",
    visitId: "vis_001",
    stayType: "hospitalization",
    cage: "Ward A / Cage 3",
    admittedAt: "2026-05-20T11:30:00.000Z",
    dischargePlannedAt: "2026-05-21T15:00:00.000Z",
    status: "in-care",
    acuity: "post-op",
    ownerVisibleStatus: "Recovering well after anesthesia",
    photoUpdates: [
      {
        at: "2026-05-20T14:00:00.000Z",
        caption: "Resting after dental cleaning",
        sharedToPortal: true,
      },
    ],
    treatmentSheet: [
      {
        time: "2026-05-20T12:00:00.000Z",
        task: "Pain score and temperature",
        intervalHours: 4,
        completed: true,
      },
      {
        time: "2026-05-20T16:00:00.000Z",
        task: "Offer small meal",
        intervalHours: 0,
        completed: false,
      },
    ],
    vitals: [
      {
        at: "2026-05-20T12:00:00.000Z",
        temperatureC: 38.1,
        pulseBpm: 90,
        respirationRpm: 20,
        painScore: 2,
      },
      {
        at: "2026-05-20T14:00:00.000Z",
        temperatureC: 38.0,
        pulseBpm: 86,
        respirationRpm: 18,
        painScore: 1,
      },
    ],
    shiftNotes: [
      {
        at: "2026-05-20T14:15:00.000Z",
        shift: "Day",
        author: "Tech Ana",
        note: "Awake, calm, IV site clean.",
      },
    ],
    dischargePlan: [
      "Confirm eating before discharge",
      "Send dental home-care instructions",
      "Book 7-day follow-up",
    ],
  },
  {
    id: "hosp_002",
    patientId: "pat_002",
    visitId: "vis_002",
    stayType: "boarding",
    cage: "Cat Room / Condo 2",
    admittedAt: "2026-05-09T09:00:00.000Z",
    dischargePlannedAt: "2026-05-12T18:00:00.000Z",
    status: "boarding",
    acuity: "routine",
    ownerVisibleStatus: "Settled in cat condo",
    photoUpdates: [
      {
        at: "2026-05-09T13:00:00.000Z",
        caption: "Eating normally",
        sharedToPortal: true,
      },
    ],
    treatmentSheet: [
      {
        time: "2026-05-09T18:00:00.000Z",
        task: "Evening feeding",
        intervalHours: 24,
        completed: false,
      },
      {
        time: "2026-05-10T09:00:00.000Z",
        task: "Litter and comfort check",
        intervalHours: 12,
        completed: false,
      },
    ],
    vitals: [],
    shiftNotes: [
      {
        at: "2026-05-09T13:10:00.000Z",
        shift: "Day",
        author: "Tech Lira",
        note: "Hiding first hour, then ate wet food.",
      },
    ],
    dischargePlan: ["Confirm owner pickup time", "Prepare boarding invoice"],
  },
];

export const seedDiagnostics = [
  {
    id: "diag_001",
    patientId: "pat_001",
    visitId: "vis_001",
    modality: "X-ray",
    title: "Thoracic radiographs",
    capturedAt: "2026-05-03T10:15:00.000Z",
    status: "reported",
    storageType: "external-pacs",
    fileName: "rex-thorax-2view.dcm",
    thumbnailStatus: "generated",
    pacsLink: "pacs://vetcore/rex-thorax-2view",
    annotations: [
      {
        label: "Cardiac silhouette",
        note: "Within expected range",
        region: "thorax",
      },
    ],
    clinicalMedia: [],
    aiScreening: [
      {
        model: "fracture-detection-late-phase",
        result: "not-run",
        confidence: null,
      },
    ],
    report: {
      radiologist: "Dr. Ilir Gashi",
      impression: "No acute thoracic abnormality detected.",
      finalizedAt: "2026-05-03T13:00:00.000Z",
    },
  },
  {
    id: "diag_002",
    patientId: "pat_002",
    visitId: "vis_002",
    modality: "Clinical photo",
    title: "Skin lesion follow-up",
    capturedAt: "2026-04-22T12:00:00.000Z",
    status: "needs-review",
    storageType: "local-media",
    fileName: "mila-skin-lesion.jpg",
    thumbnailStatus: "queued",
    pacsLink: "",
    annotations: [
      {
        label: "Lesion edge",
        note: "Mild erythema around scar",
        region: "abdomen",
      },
    ],
    clinicalMedia: [
      { type: "photo", caption: "Abdominal scar photo", sharedToRecord: true },
    ],
    aiScreening: [
      {
        model: "skin-lesion-classification-late-phase",
        result: "queued",
        confidence: null,
      },
    ],
    report: {
      radiologist: "",
      impression: "",
      finalizedAt: null,
    },
  },
];

export const seedLabs = [
  {
    id: "lab_001",
    patientId: "pat_001",
    visitId: "vis_001",
    source: "in-house",
    provider: "Clinic Lab",
    country: "XK",
    testType: "Blood chemistry",
    panelName: "Senior wellness profile",
    sampleType: "serum",
    orderedAt: "2026-05-03T09:25:00.000Z",
    collectedAt: "2026-05-03T09:40:00.000Z",
    status: "received",
    externalOrderId: null,
    pdfFileName: null,
    parserStatus: "manual-entry",
    results: [
      {
        analyte: "ALT",
        value: 86,
        unit: "U/L",
        referenceLow: 10,
        referenceHigh: 100,
        flag: "normal",
      },
      {
        analyte: "Creatinine",
        value: 1.3,
        unit: "mg/dL",
        referenceLow: 0.5,
        referenceHigh: 1.8,
        flag: "normal",
      },
    ],
    criticalAlerts: [],
    trendNotes: ["Baseline established for senior wellness monitoring"],
    sharedWithOwner: true,
    interpretation: {
      summary:
        "No critical chemistry abnormalities. Continue annual senior panel.",
      aiStatus: "reviewed",
    },
  },
  {
    id: "lab_002",
    patientId: "pat_002",
    visitId: "vis_002",
    source: "external",
    provider: "Laboklin",
    country: "DE",
    testType: "Fecal",
    panelName: "GI parasite PCR",
    sampleType: "feces",
    orderedAt: "2026-05-04T10:15:00.000Z",
    collectedAt: "2026-05-04T10:25:00.000Z",
    status: "sent",
    externalOrderId: "LABOKLIN-2026-1842",
    pdfFileName: "mila-gi-pcr.pdf",
    parserStatus: "queued",
    results: [],
    criticalAlerts: [],
    trendNotes: [],
    sharedWithOwner: false,
    interpretation: {
      summary: "",
      aiStatus: "not-run",
    },
  },
];

export const seedSpecialties = [
  {
    id: "spec_001",
    patientId: "pat_001",
    visitId: "vis_001",
    specialtyType: "dentistry",
    title: "Dental chart and periodontal staging",
    startedAt: "2026-05-03T10:35:00.000Z",
    status: "active",
    clinician: "Dr. Elira Hoxha",
    findings: [
      {
        region: "Upper right P4",
        finding: "Calculus grade 2",
        stage: "periodontal-stage-2",
      },
      {
        region: "Lower incisors",
        finding: "Gingivitis",
        stage: "periodontal-stage-1",
      },
    ],
    tasks: [
      { label: "Schedule dental cleaning", dueAt: "2026-05-20", done: false },
      { label: "Send home-care plan", dueAt: "2026-05-03", done: true },
    ],
    plan: [
      "Dental cleaning estimate",
      "Home brushing plan",
      "Recheck oral pain in 30 days",
    ],
    qualityOfLifeScore: null,
    attachments: [{ type: "photo", label: "Pre-cleaning oral photo" }],
    genetics: [],
  },
  {
    id: "spec_002",
    patientId: "pat_002",
    visitId: "vis_002",
    specialtyType: "nutrition",
    title: "Weight management and GI nutrition",
    startedAt: "2026-05-04T10:45:00.000Z",
    status: "draft",
    clinician: "Dr. Arben Dervishi",
    findings: [
      {
        region: "BCS",
        finding: "Target 4.0 kg over 12 weeks",
        stage: "nutrition-plan",
      },
    ],
    tasks: [
      {
        label: "Confirm diet trial acceptance",
        dueAt: "2026-05-11",
        done: false,
      },
      { label: "Upload progress photo", dueAt: "2026-06-04", done: false },
    ],
    plan: [
      "Hydrolyzed protein diet trial",
      "Weekly weight checks",
      "Owner photo progress",
    ],
    qualityOfLifeScore: null,
    attachments: [],
    genetics: [],
  },
];

export const seedAppointments = [
  {
    id: "apt_001",
    patientId: "pat_001",
    ownerId: "own_001",
    visitId: "vis_001",
    title: "Dermatology recheck",
    appointmentType: "recheck",
    channel: "front-desk",
    room: "Exam Room 2",
    assignedVet: "Dr. Elira Hoxha",
    assignedStaff: ["Tech Arbnore Gashi"],
    startsAt: "2026-05-12T09:00:00.000Z",
    endsAt: "2026-05-12T09:20:00.000Z",
    status: "confirmed",
    colorCode: "consult",
    recurring: false,
    waitlistPriority: null,
    walkIn: false,
    surgeryBlock: false,
    bufferMinutes: 10,
    noShowRisk: "low",
    notes: "Prefer early morning slot before owner shift.",
  },
  {
    id: "apt_002",
    patientId: "pat_002",
    ownerId: "own_002",
    visitId: "vis_002",
    title: "Passport travel prep",
    appointmentType: "document",
    channel: "online-booking",
    room: "Reception Desk",
    assignedVet: "Dr. Nora Berisha",
    assignedStaff: ["Reception Lira Kelmendi"],
    startsAt: "2026-05-12T10:00:00.000Z",
    endsAt: "2026-05-12T10:30:00.000Z",
    status: "waitlist",
    colorCode: "travel",
    recurring: false,
    waitlistPriority: "high",
    walkIn: false,
    surgeryBlock: false,
    bufferMinutes: 0,
    noShowRisk: "medium",
    notes: "Owner requested first available opening this week.",
  },
  {
    id: "apt_003",
    patientId: "pat_001",
    ownerId: "own_001",
    visitId: null,
    title: "Urgent walk-in otitis check",
    appointmentType: "walk-in",
    channel: "phone",
    room: "Triage",
    assignedVet: "Dr. Arben Dervishi",
    assignedStaff: ["Tech Arbnore Gashi"],
    startsAt: "2026-05-11T13:40:00.000Z",
    endsAt: "2026-05-11T14:00:00.000Z",
    status: "checked-in",
    colorCode: "urgent",
    recurring: false,
    waitlistPriority: null,
    walkIn: true,
    surgeryBlock: false,
    bufferMinutes: 0,
    noShowRisk: "low",
    notes: "Ear scratching since yesterday evening.",
  },
  {
    id: "apt_004",
    patientId: "pat_001",
    ownerId: "own_001",
    visitId: null,
    title: "Surgery block: dental cleaning",
    appointmentType: "surgery-block",
    channel: "internal",
    room: "Surgery Suite",
    assignedVet: "Dr. Elira Hoxha",
    assignedStaff: ["Tech Arbnore Gashi", "Nurse Driton Maliqi"],
    startsAt: "2026-05-13T08:00:00.000Z",
    endsAt: "2026-05-13T10:00:00.000Z",
    status: "scheduled",
    colorCode: "surgery",
    recurring: false,
    waitlistPriority: null,
    walkIn: false,
    surgeryBlock: true,
    bufferMinutes: 20,
    noShowRisk: "medium",
    notes: "Reserve pre-op prep and recovery handoff buffer.",
  },
];

export const seedClientMessages = [
  {
    id: "msg_001",
    patientId: "pat_001",
    ownerId: "own_001",
    appointmentId: "apt_001",
    channel: "WhatsApp",
    direction: "outbound",
    template: "visit-reminder",
    language: "sq",
    status: "queued",
    scheduledAt: "2026-05-11T18:00:00.000Z",
    sentAt: null,
    requiresReply: false,
    translated: false,
    summary: "Reminder for dermatology recheck tomorrow at 09:00.",
  },
  {
    id: "msg_002",
    patientId: "pat_002",
    ownerId: "own_002",
    appointmentId: "apt_002",
    channel: "Email",
    direction: "outbound",
    template: "booking-follow-up",
    language: "de",
    status: "sent",
    scheduledAt: "2026-05-11T09:30:00.000Z",
    sentAt: "2026-05-11T09:31:00.000Z",
    requiresReply: true,
    translated: true,
    summary: "Offered first open slot and attached EU passport checklist.",
  },
  {
    id: "msg_003",
    patientId: "pat_001",
    ownerId: "own_001",
    appointmentId: null,
    channel: "SMS",
    direction: "outbound",
    template: "follow-up",
    language: "sq",
    status: "draft",
    scheduledAt: "2026-05-11T15:45:00.000Z",
    sentAt: null,
    requiresReply: true,
    translated: false,
    summary: "Check how Rex is doing after acute otitis walk-in.",
  },
];

export const seedStaffRoster = [
  {
    id: "staff_001",
    name: "Dr. Elira Hoxha",
    role: "Vet",
    specialty: "Internal medicine",
    shift: "08:00-16:00",
    room: "Exam 2 / Surgery",
    workloadScore: 82,
    timeOffRequested: false,
    activeAppointments: 2,
    pendingTasks: 4,
  },
  {
    id: "staff_002",
    name: "Dr. Nora Berisha",
    role: "Vet",
    specialty: "Travel documents",
    shift: "10:00-18:00",
    room: "Reception consult",
    workloadScore: 58,
    timeOffRequested: true,
    activeAppointments: 1,
    pendingTasks: 2,
  },
  {
    id: "staff_003",
    name: "Tech Arbnore Gashi",
    role: "Tech",
    specialty: "Surgery support",
    shift: "07:30-15:30",
    room: "Triage / Surgery",
    workloadScore: 76,
    timeOffRequested: false,
    activeAppointments: 3,
    pendingTasks: 5,
  },
];

export const seedInventoryItems = [
  {
    id: "inv_001",
    medicationName: "Apoquel 16 mg",
    atcvetCode: "QD11AH90",
    dosageForm: "tablet",
    names: { sq: "Apoquel", en: "Apoquel", de: "Apoquel" },
    concentration: "16 mg tablet",
    dosingInstructions: "0.4-0.6 mg/kg PO BID induction, then SID.",
    countryAvailability: ["XK", "DE", "PL"],
    restrictions: ["prescription-required"],
    prescriptionRequired: true,
    controlledSubstance: false,
    warehouses: [
      {
        location: "Prishtine Main Pharmacy",
        lotNumber: "APQ-2026-01",
        expiresAt: "2026-12-31",
        onHandUnits: 24,
      },
    ],
    reorderThreshold: 18,
    wastageUnits: 1,
    supplierId: "sup_001",
    supplierName: "VetPharm Europe",
    fifoCostCents: 5200,
    avcoCostCents: 5050,
    stocktakeVariance: -1,
    movements: [
      {
        at: "2026-05-03T09:10:00.000Z",
        type: "dispense",
        units: -2,
        warehouse: "Prishtine Main Pharmacy",
        reason: "Prescription rx_001",
      },
      {
        at: "2026-05-08T11:00:00.000Z",
        type: "stocktake",
        units: -1,
        warehouse: "Prishtine Main Pharmacy",
        reason: "Broken tablet blister",
      },
    ],
  },
  {
    id: "inv_002",
    medicationName: "Ketamine 100 mg/ml",
    atcvetCode: "QN01AX03",
    dosageForm: "injectable",
    names: { sq: "Ketamine", en: "Ketamine", de: "Ketamin" },
    concentration: "100 mg/ml",
    dosingInstructions: "Use per anesthesia protocol and controlled log.",
    countryAvailability: ["XK", "PL"],
    restrictions: ["controlled-register", "restricted-storage"],
    prescriptionRequired: true,
    controlledSubstance: true,
    warehouses: [
      {
        location: "Controlled Cabinet",
        lotNumber: "KET-2026-77",
        expiresAt: "2027-01-31",
        onHandUnits: 6,
      },
    ],
    reorderThreshold: 4,
    wastageUnits: 0,
    supplierId: "sup_002",
    supplierName: "SecureVet Supply",
    fifoCostCents: 2850,
    avcoCostCents: 2850,
    stocktakeVariance: 0,
    movements: [
      {
        at: "2026-05-09T08:10:00.000Z",
        type: "receive",
        units: 2,
        warehouse: "Controlled Cabinet",
        reason: "PO po_002 receipt",
      },
    ],
  },
  {
    id: "inv_003",
    medicationName: "Feline GI Diet Pouch",
    atcvetCode: "NUTR-GI-001",
    dosageForm: "nutrition",
    names: { sq: "GI Diet", en: "GI Diet", de: "GI Diat" },
    concentration: "85 g pouch",
    dosingInstructions: "Feed per nutrition plan.",
    countryAvailability: ["XK", "DE"],
    restrictions: [],
    prescriptionRequired: false,
    controlledSubstance: false,
    warehouses: [
      {
        location: "Ward Nutrition Shelf",
        lotNumber: "GID-2026-14",
        expiresAt: "2026-08-10",
        onHandUnits: 9,
      },
      {
        location: "Retail Shelf",
        lotNumber: "GID-2026-18",
        expiresAt: "2026-09-15",
        onHandUnits: 14,
      },
    ],
    reorderThreshold: 20,
    wastageUnits: 2,
    supplierId: "sup_001",
    supplierName: "VetPharm Europe",
    fifoCostCents: 190,
    avcoCostCents: 205,
    stocktakeVariance: -2,
    movements: [
      {
        at: "2026-05-10T14:15:00.000Z",
        type: "wastage",
        units: -2,
        warehouse: "Ward Nutrition Shelf",
        reason: "Packaging damaged",
      },
    ],
  },
];

export const seedPurchaseOrders = [
  {
    id: "po_001",
    supplierId: "sup_001",
    supplierName: "VetPharm Europe",
    warehouse: "Prishtine Main Pharmacy",
    approvalStatus: "approved",
    receivingStatus: "received",
    invoiceMatchStatus: "matched",
    costMethod: "AVCO",
    expectedAt: "2026-05-08T09:00:00.000Z",
    receivedAt: "2026-05-09T08:55:00.000Z",
    invoiceReference: "INV-VPE-2026-188",
    lines: [
      {
        medicationName: "Apoquel 16 mg",
        quantity: 20,
        unitCostCents: 5100,
      },
      {
        medicationName: "Feline GI Diet Pouch",
        quantity: 30,
        unitCostCents: 180,
      },
    ],
  },
  {
    id: "po_002",
    supplierId: "sup_002",
    supplierName: "SecureVet Supply",
    warehouse: "Controlled Cabinet",
    approvalStatus: "pending",
    receivingStatus: "ordered",
    invoiceMatchStatus: "pending",
    costMethod: "FIFO",
    expectedAt: "2026-05-14T10:00:00.000Z",
    receivedAt: null,
    invoiceReference: "",
    lines: [
      {
        medicationName: "Ketamine 100 mg/ml",
        quantity: 4,
        unitCostCents: 2850,
      },
    ],
  },
];

export const seedControlledLog = [
  {
    id: "ctl_001",
    inventoryItemId: "inv_002",
    patientId: "pat_001",
    actor: "Dr. Elira Hoxha",
    at: "2026-05-03T08:15:00.000Z",
    action: "dispense",
    units: 1,
    remainingUnits: 5,
    authorityReportStatus: "not-required",
    reconciliationStatus: "open",
    note: "Pre-med for dental anesthesia planning.",
  },
];

export const seedInvoices = [
  {
    id: "fin_001",
    patientId: "pat_001",
    ownerId: "own_001",
    visitId: "vis_001",
    invoiceType: "invoice",
    documentNumber: "INV-2026-0012",
    currency: "EUR",
    country: "XK",
    status: "issued",
    paymentStatus: "partial",
    issueDate: "2026-05-03",
    dueDate: "2026-05-17",
    vatRate: 18,
    reducedVatApplied: false,
    discountType: "percent",
    discountValue: 5,
    bundleName: "Annual wellness",
    eInvoicingChannel: "manual",
    fiscalPrinterStatus: "not-sent",
    lineItems: [
      { description: "Wellness exam", quantity: 1, unitPriceCents: 3500 },
      { description: "Nail trim", quantity: 1, unitPriceCents: 800 },
      { description: "Apoquel 16 mg", quantity: 1, unitPriceCents: 5200 },
    ],
    creditNotes: [],
  },
  {
    id: "fin_002",
    patientId: "pat_002",
    ownerId: "own_002",
    visitId: "vis_002",
    invoiceType: "estimate",
    documentNumber: "EST-2026-0005",
    currency: "EUR",
    country: "DE",
    status: "pending-approval",
    paymentStatus: "unpaid",
    issueDate: "2026-05-04",
    dueDate: "2026-05-20",
    vatRate: 7,
    reducedVatApplied: true,
    discountType: "fixed",
    discountValue: 300,
    bundleName: "",
    eInvoicingChannel: "manual",
    fiscalPrinterStatus: "not-applicable",
    lineItems: [
      { description: "EU passport review", quantity: 1, unitPriceCents: 1200 },
      {
        description: "Rabies certificate package",
        quantity: 1,
        unitPriceCents: 1800,
      },
    ],
    creditNotes: [],
  },
];

export const seedPayments = [
  {
    id: "pay_001",
    invoiceId: "fin_001",
    patientId: "pat_001",
    ownerId: "own_001",
    method: "stripe-card",
    provider: "Stripe",
    status: "captured",
    amountCents: 4000,
    currency: "EUR",
    splitCount: 1,
    installmentPlan: false,
    receivedAt: "2026-05-03T09:15:00.000Z",
    reference: "pi_2026_demo_001",
  },
  {
    id: "pay_002",
    invoiceId: "fin_001",
    patientId: "pat_001",
    ownerId: "own_001",
    method: "cash",
    provider: "Manual",
    status: "pending",
    amountCents: 1500,
    currency: "EUR",
    splitCount: 2,
    installmentPlan: false,
    receivedAt: "2026-05-11T10:00:00.000Z",
    reference: "cash-desk-12",
  },
];

export const seedInsuranceClaims = [
  {
    id: "clm_001",
    patientId: "pat_001",
    ownerId: "own_001",
    visitId: "vis_001",
    provider: "Agria",
    policyNumber: "AGR-REX-2201",
    claimType: "submission",
    status: "submitted",
    preAuthorization: false,
    directSettlement: false,
    autofillFromEmr: true,
    submittedAt: "2026-05-04T12:00:00.000Z",
    approvedAmountCents: 0,
    note: "Dermatology invoice package submitted.",
  },
  {
    id: "clm_002",
    patientId: "pat_002",
    ownerId: "own_002",
    visitId: "vis_002",
    provider: "Petplan",
    policyNumber: "PET-MILA-883",
    claimType: "pre-auth",
    status: "needs-info",
    preAuthorization: true,
    directSettlement: true,
    autofillFromEmr: true,
    submittedAt: "2026-05-05T08:30:00.000Z",
    approvedAmountCents: 0,
    note: "Awaiting travel documents and microchip proof.",
  },
];

export const seedWellnessPlans = [
  {
    id: "wlp_001",
    patientId: "pat_001",
    ownerId: "own_001",
    planName: "Canine Wellness Plus",
    programType: "wellness",
    billingProvider: "Stripe Subscriptions",
    status: "active",
    monthlyFeeCents: 2900,
    autoBilling: true,
    startDate: "2026-01-01",
    nextBillingDate: "2026-06-01",
    redemptionUsed: 2,
    redemptionTotal: 6,
    pauseRequested: false,
    notes: "Includes parasite prevention and annual wellness.",
  },
  {
    id: "wlp_002",
    patientId: "pat_002",
    ownerId: "own_002",
    planName: "Kitten Welcome",
    programType: "kitten",
    billingProvider: "Manual",
    status: "paused",
    monthlyFeeCents: 1800,
    autoBilling: false,
    startDate: "2026-02-15",
    nextBillingDate: "2026-05-15",
    redemptionUsed: 1,
    redemptionTotal: 4,
    pauseRequested: true,
    notes: "Paused while travel paperwork is pending.",
  },
];

export const seedPortalAccounts = [
  {
    id: "prt_001",
    ownerId: "own_001",
    loginMethod: "magic-link",
    inviteStatus: "accepted",
    multiFactorEnabled: false,
    multiPetEnabled: true,
    multiClinicEnabled: false,
    preferredLanguage: "sq",
    documentAccessCount: 6,
    unreadMessages: 1,
    paymentCardsOnFile: 1,
    photoUploads: 2,
  },
  {
    id: "prt_002",
    ownerId: "own_002",
    loginMethod: "phone-otp",
    inviteStatus: "invited",
    multiFactorEnabled: true,
    multiPetEnabled: false,
    multiClinicEnabled: true,
    preferredLanguage: "de",
    documentAccessCount: 4,
    unreadMessages: 0,
    paymentCardsOnFile: 0,
    photoUploads: 1,
  },
];

export const seedPortalDocuments = [
  {
    id: "doc_001",
    patientId: "pat_001",
    ownerId: "own_001",
    category: "vaccine-certificate",
    title: "Rabies certificate",
    status: "available",
    sourceModule: "vaccinations",
    uploadedAt: "2026-05-03T09:20:00.000Z",
    sharedInPortal: true,
    qrEnabled: true,
  },
  {
    id: "doc_002",
    patientId: "pat_002",
    ownerId: "own_002",
    category: "invoice",
    title: "Travel review estimate",
    status: "available",
    sourceModule: "finance",
    uploadedAt: "2026-05-04T10:00:00.000Z",
    sharedInPortal: true,
    qrEnabled: false,
  },
  {
    id: "doc_003",
    patientId: "pat_001",
    ownerId: "own_001",
    category: "lab-report",
    title: "CBC + chemistry",
    status: "processing",
    sourceModule: "labs",
    uploadedAt: "2026-05-10T13:00:00.000Z",
    sharedInPortal: false,
    qrEnabled: false,
  },
];

export const seedTelemedicineSessions = [
  {
    id: "tel_001",
    patientId: "pat_001",
    ownerId: "own_001",
    sessionType: "video-call",
    platform: "Jitsi",
    bookingStatus: "scheduled",
    startsAt: "2026-05-13T16:00:00.000Z",
    clinician: "Dr. Elira Hoxha",
    asyncPhotoReview: false,
    aiTriageStatus: "screened",
    recordingConsent: false,
    groupCall: false,
    note: "Follow-up for pruritus flare.",
  },
  {
    id: "tel_002",
    patientId: "pat_002",
    ownerId: "own_002",
    sessionType: "async-consult",
    platform: "Portal",
    bookingStatus: "needs-response",
    startsAt: "2026-05-12T12:30:00.000Z",
    clinician: "Dr. Nora Berisha",
    asyncPhotoReview: true,
    aiTriageStatus: "queued",
    recordingConsent: false,
    groupCall: false,
    note: "Owner uploaded travel document photos.",
  },
];

export const seedAsyncConsults = [
  {
    id: "asc_001",
    patientId: "pat_001",
    ownerId: "own_001",
    status: "awaiting-clinician",
    responseDueHours: 4,
    symptomSummary: "Itching around ears after evening walk.",
    photoCount: 2,
    medicationReminderEnabled: true,
    triageRecommendation: "Schedule tele-follow-up if persists.",
  },
  {
    id: "asc_002",
    patientId: "pat_002",
    ownerId: "own_002",
    status: "closed",
    responseDueHours: 4,
    symptomSummary: "Passport document clarification request.",
    photoCount: 1,
    medicationReminderEnabled: false,
    triageRecommendation: "Documents sufficient after microchip scan.",
  },
];

export const seedMobileDevices = [
  {
    id: "mob_001",
    ownerId: "own_001",
    mode: "owner",
    platform: "iPhone",
    deviceName: "Arta iPhone 15",
    staffName: "",
    pushEnabled: true,
    cameraEnabled: true,
    offlineSnapshotReady: true,
    biometricEnabled: true,
    microchipNfcEnabled: false,
    pendingNotifications: 0,
    lastSyncAt: "2026-05-12T05:40:00.000Z",
  },
  {
    id: "mob_002",
    ownerId: "",
    mode: "field-staff",
    platform: "iPad",
    deviceName: "Tech Field iPad",
    staffName: "Tech Arbnore Gashi",
    pushEnabled: false,
    cameraEnabled: true,
    offlineSnapshotReady: false,
    biometricEnabled: false,
    microchipNfcEnabled: true,
    pendingNotifications: 3,
    lastSyncAt: "2026-05-10T14:15:00.000Z",
  },
];

export const seedFieldSessions = [
  {
    id: "fld_001",
    patientId: "pat_001",
    visitId: "vis_001",
    assignedDeviceId: "mob_002",
    sessionType: "field-vet",
    location: "Prishtine outskirts kennel visit",
    status: "in-progress",
    syncStatus: "pending",
    scheduleViewReady: true,
    inventoryCheckPending: true,
    voiceNotesCaptured: 1,
    photoCount: 3,
    lastActivityAt: "2026-05-12T06:05:00.000Z",
  },
  {
    id: "fld_002",
    patientId: "pat_002",
    visitId: "vis_002",
    assignedDeviceId: "mob_002",
    sessionType: "travel-docs",
    location: "Reception desk mobile intake",
    status: "synced",
    syncStatus: "synced",
    scheduleViewReady: true,
    inventoryCheckPending: false,
    voiceNotesCaptured: 0,
    photoCount: 1,
    lastActivityAt: "2026-05-11T15:10:00.000Z",
  },
];

export const seedMobileConsults = [
  {
    id: "mco_001",
    patientId: "pat_001",
    visitId: "vis_001",
    source: "field-mode",
    status: "draft",
    quickSummary: "Owner reported recurrent ear scratching during field check.",
    transcriptionStatus: "pending",
    photoCount: 2,
    inventoryCheckStatus: "requested",
    microchipScanned: false,
    scheduleLinked: true,
    createdAt: "2026-05-12T05:55:00.000Z",
  },
  {
    id: "mco_002",
    patientId: "pat_002",
    visitId: "vis_002",
    source: "owner-mobile",
    status: "synced",
    quickSummary: "Travel docs recheck captured on mobile and synced.",
    transcriptionStatus: "complete",
    photoCount: 1,
    inventoryCheckStatus: "complete",
    microchipScanned: true,
    scheduleLinked: true,
    createdAt: "2026-05-11T14:10:00.000Z",
  },
];

export const seedMobileScans = [
  {
    id: "msc_001",
    patientId: "pat_001",
    deviceId: "mob_002",
    scanType: "microchip-nfc",
    source: "field-mode",
    status: "manual-review",
    lookupResult: "Offline cache used; registry verification still pending.",
    scannedAt: "2026-05-12T05:58:00.000Z",
  },
  {
    id: "msc_002",
    patientId: "pat_002",
    deviceId: "mob_002",
    scanType: "microchip-nfc",
    source: "clinic-mobile",
    status: "matched",
    lookupResult: "Microchip matched with passport workflow record.",
    scannedAt: "2026-05-11T14:05:00.000Z",
  },
];

export const clinicCoreSeed = {
  owners: seedOwners,
  patients: seedPatients,
  visits: seedVisits,
  vaccinations: seedVaccinations,
  prescriptions: seedPrescriptions,
  surgeries: seedSurgeries,
  hospitalizations: seedHospitalizations,
  diagnostics: seedDiagnostics,
  labs: seedLabs,
  specialties: seedSpecialties,
  appointments: seedAppointments,
  clientMessages: seedClientMessages,
  staffRoster: seedStaffRoster,
  inventoryItems: seedInventoryItems,
  purchaseOrders: seedPurchaseOrders,
  controlledLog: seedControlledLog,
  invoices: seedInvoices,
  payments: seedPayments,
  insuranceClaims: seedInsuranceClaims,
  wellnessPlans: seedWellnessPlans,
  portalAccounts: seedPortalAccounts,
  portalDocuments: seedPortalDocuments,
  telemedicineSessions: seedTelemedicineSessions,
  asyncConsults: seedAsyncConsults,
  mobileDevices: seedMobileDevices,
  fieldSessions: seedFieldSessions,
  mobileConsults: seedMobileConsults,
  mobileScans: seedMobileScans,
};

function collection(state, key) {
  return Array.isArray(state?.[key]) ? state[key] : [];
}

export function moneyFromCents(cents) {
  return Number(cents || 0) / 100;
}

export function getOwnerById(state, id) {
  return collection(state, "owners").find((owner) => owner.id === id) || null;
}

export function getPatientById(state, id) {
  return (
    collection(state, "patients").find((patient) => patient.id === id) || null
  );
}

export function getVisitById(state, id) {
  return collection(state, "visits").find((visit) => visit.id === id) || null;
}

export function listPatients(state) {
  const visits = collection(state, "visits");
  return collection(state, "patients").map((patient) => ({
    ...patient,
    owners: patient.ownerIds
      .map((ownerId) => getOwnerById(state, ownerId))
      .filter(Boolean),
    lastVisit:
      visits
        .filter((visit) => visit.patientId === patient.id)
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0] || null,
  }));
}

export function listOwners(state) {
  const patients = collection(state, "patients");
  return collection(state, "owners").map((owner) => ({
    ...owner,
    patients: patients.filter((patient) => patient.ownerIds.includes(owner.id)),
  }));
}

export function listVisits(state) {
  return collection(state, "visits").map((visit) => ({
    ...visit,
    patient: getPatientById(state, visit.patientId),
    owner: getOwnerById(state, visit.ownerId),
    totalCents: visit.procedures.reduce(
      (sum, procedure) => sum + procedure.costCents,
      0,
    ),
  }));
}

export function getClinicCoreSummary(state) {
  const patients = collection(state, "patients");
  const owners = collection(state, "owners");
  const visits = collection(state, "visits");
  const criticalAllergyCount = patients.reduce(
    (sum, patient) =>
      sum +
      patient.allergies.filter((allergy) => allergy.severity === "critical")
        .length,
    0,
  );
  const signedVisits = visits.filter(
    (visit) => visit.status === "signed",
  ).length;
  const draftVisits = visits.filter((visit) => visit.status === "draft").length;
  const openBalanceCents = owners.reduce(
    (sum, owner) => sum + owner.balanceCents,
    0,
  );

  return {
    featureCoverage: clinicCoreFeatureCoverage,
    counts: {
      owners: owners.length,
      patients: patients.length,
      visits: visits.length,
      signedVisits,
      draftVisits,
      criticalAllergies: criticalAllergyCount,
    },
    openBalance: moneyFromCents(openBalanceCents),
    nextBuildTargets: [
      "Add database migrations",
      "Add patient detail timeline",
      "Add critical allergy banner across clinical screens",
    ],
  };
}
