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
