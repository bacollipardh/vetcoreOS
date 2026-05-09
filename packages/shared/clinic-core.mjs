// P1 Clinic Core MVP coverage: F001-F018 patients, F019-F029 owners, F030-F045 visits.
export const clinicCoreFeatureCoverage = [
  { range: 'F001-F018', area: 'Patients', description: 'Animal profile, identifiers, status, tags, weight, allergies and owner relationships.' },
  { range: 'F019-F029', area: 'Owners', description: 'Client identity, address, contact channels, preferences, balance, tags and interaction history.' },
  { range: 'F030-F045', area: 'Visits', description: 'Visit type, anamnesis, physical exam, diagnosis, treatment plan, procedures, signature and continuity.' }
];

export const seedOwners = [
  {
    id: 'own_001',
    displayName: 'Arta Krasniqi',
    documentId: 'EU-KS-102938',
    language: 'sq',
    preferredChannel: 'WhatsApp',
    phone: '+38344111222',
    email: 'arta.krasniqi@example.com',
    address: { line1: 'Rruga B, 14', city: 'Prishtine', region: 'Kosove', country: 'XK', postalCode: '10000' },
    marketingConsent: true,
    balanceCents: 4500,
    tags: ['VIP', 'multi-pet'],
    privateNote: 'Preferon njoftime pas ores 17:00.',
    interactionTimeline: [
      { at: '2026-05-01T09:10:00.000Z', channel: 'Phone', summary: 'Konfirmoi kontrollin vjetor.' },
      { at: '2026-05-03T15:30:00.000Z', channel: 'WhatsApp', summary: 'Kerkoi kopje te certifikates se vaksines.' }
    ]
  },
  {
    id: 'own_002',
    displayName: 'Lukas Schneider',
    documentId: 'DE-778811',
    language: 'de',
    preferredChannel: 'Email',
    phone: '+4915112345678',
    email: 'lukas.schneider@example.de',
    address: { line1: 'Hauptstrasse 22', city: 'Berlin', region: 'Berlin', country: 'DE', postalCode: '10115' },
    marketingConsent: false,
    balanceCents: 0,
    tags: ['EU-passport'],
    privateNote: 'Kerkon dokumente ne gjermanisht.',
    interactionTimeline: [
      { at: '2026-04-22T10:00:00.000Z', channel: 'Email', summary: 'Derguar udhezimet per EU Pet Passport.' }
    ]
  }
];

export const seedPatients = [
  {
    id: 'pat_001',
    name: 'Rex',
    species: 'Dog',
    breed: 'Golden Retriever',
    sex: 'Male',
    birthDate: '2021-04-12',
    neutered: true,
    color: 'Golden',
    microchip: '900113000001111',
    passportNumber: 'XK-PET-2026-0001',
    status: 'active',
    ownerIds: ['own_001'],
    tags: ['friendly', 'annual-plan'],
    allergies: [{ substance: 'Penicillin', severity: 'critical', note: 'Avoid beta-lactam antibiotics.' }],
    behaviorNotes: ['Fear-free profile: responds well to treats.', 'Mild stress around clippers.'],
    weightHistory: [
      { date: '2025-12-01', weightKg: 28.4 },
      { date: '2026-05-03', weightKg: 29.1 }
    ],
    bcs: { scale: '1-9', score: 5, recordedAt: '2026-05-03' },
    photoGallery: []
  },
  {
    id: 'pat_002',
    name: 'Mila',
    species: 'Cat',
    breed: 'European Shorthair',
    sex: 'Female',
    birthDate: '2022-09-18',
    neutered: true,
    color: 'Grey tabby',
    microchip: '276098108888888',
    passportNumber: 'DE-PET-2026-1842',
    status: 'active',
    ownerIds: ['own_002'],
    tags: ['indoor', 'EU-passport'],
    allergies: [],
    behaviorNotes: ['Shy during exam; use towel handling.'],
    weightHistory: [
      { date: '2026-01-10', weightKg: 4.1 },
      { date: '2026-04-22', weightKg: 4.3 }
    ],
    bcs: { scale: '1-9', score: 6, recordedAt: '2026-04-22' },
    photoGallery: []
  }
];

export const seedVisits = [
  {
    id: 'vis_001',
    patientId: 'pat_001',
    ownerId: 'own_001',
    visitType: 'Annual wellness',
    status: 'signed',
    startedAt: '2026-05-03T08:30:00.000Z',
    clinician: 'Dr. Elira Hoxha',
    anamnesis: 'Owner reports normal appetite and activity. Mild itching after spring walks.',
    physicalExam: { temperatureC: 38.5, pulseBpm: 88, respirationRpm: 24, mucousMembranes: 'Pink, moist', lymphNodes: 'Normal' },
    diagnoses: [{ system: 'VeNom', code: 'SKIN-PRURITUS', label: 'Seasonal pruritus' }],
    differentialDiagnoses: ['Atopy', 'Flea allergy dermatitis'],
    treatmentPlan: ['Start parasite prevention refill.', 'Recheck skin if itching persists beyond 14 days.'],
    procedures: [{ name: 'Wellness exam', costCents: 3500 }, { name: 'Nail trim', costCents: 800 }],
    signedBy: 'Dr. Elira Hoxha',
    signedAt: '2026-05-03T09:05:00.000Z',
    continuityFromVisitId: null,
    amendments: []
  },
  {
    id: 'vis_002',
    patientId: 'pat_002',
    ownerId: 'own_002',
    visitType: 'EU passport review',
    status: 'draft',
    startedAt: '2026-04-22T11:20:00.000Z',
    clinician: 'Dr. Nora Berisha',
    anamnesis: 'Travel planned within EU. Owner requested microchip and passport verification.',
    physicalExam: { temperatureC: 38.2, pulseBpm: 132, respirationRpm: 28, mucousMembranes: 'Pink', lymphNodes: 'Normal' },
    diagnoses: [],
    differentialDiagnoses: [],
    treatmentPlan: ['Confirm rabies vaccine record.', 'Prepare downloadable passport PDF in later phase.'],
    procedures: [{ name: 'Microchip scan', costCents: 1200 }],
    signedBy: null,
    signedAt: null,
    continuityFromVisitId: null,
    amendments: []
  }
];

export const seedVaccinations = [
  {
    id: 'vac_001',
    patientId: 'pat_001',
    vaccineName: 'Rabies',
    protocol: 'EU Pet Passport core',
    manufacturer: 'VetBio EU',
    lotNumber: 'RB-2026-001',
    expiresAt: '2027-04-30',
    administeredAt: '2026-05-03',
    nextDueAt: '2027-05-03',
    status: 'current',
    inventoryReduced: true,
    certificateStatus: 'ready-for-pdf'
  },
  {
    id: 'vac_002',
    patientId: 'pat_002',
    vaccineName: 'FVRCP',
    protocol: 'Cat core annual',
    manufacturer: 'FelineCare',
    lotNumber: 'FC-2025-778',
    expiresAt: '2026-03-01',
    administeredAt: '2025-04-22',
    nextDueAt: '2026-04-22',
    status: 'overdue',
    inventoryReduced: true,
    certificateStatus: 'needs-review'
  }
];

export const seedPrescriptions = [
  {
    id: 'rx_001',
    patientId: 'pat_001',
    visitId: 'vis_001',
    medicationName: 'Apoquel',
    catalogCode: 'ATCVET-QD11AH90',
    defaultDoseMgPerKg: 0.45,
    patientWeightKg: 29.1,
    calculatedDoseMg: 13.1,
    route: 'PO',
    frequency: 'BID',
    durationDays: 14,
    controlledSubstance: false,
    prescriptionRequired: true,
    safetyAlerts: [],
    refillDueAt: '2026-05-17',
    complianceStatus: 'monitoring',
    signedBy: 'Dr. Elira Hoxha',
    signedAt: '2026-05-03T09:06:00.000Z'
  },
  {
    id: 'rx_002',
    patientId: 'pat_002',
    visitId: 'vis_002',
    medicationName: 'Buprenorphine',
    catalogCode: 'ATCVET-QN02AE01',
    defaultDoseMgPerKg: 0.02,
    patientWeightKg: 4.3,
    calculatedDoseMg: 0.09,
    route: 'Buccal',
    frequency: 'TID',
    durationDays: 3,
    controlledSubstance: true,
    prescriptionRequired: true,
    safetyAlerts: ['Controlled substance log required'],
    refillDueAt: null,
    complianceStatus: 'clinic-administered',
    signedBy: null,
    signedAt: null
  }
];

export const clinicCoreSeed = {
  owners: seedOwners,
  patients: seedPatients,
  visits: seedVisits,
  vaccinations: seedVaccinations,
  prescriptions: seedPrescriptions
};

function collection(state, key) {
  return Array.isArray(state?.[key]) ? state[key] : [];
}

export function moneyFromCents(cents) {
  return Number(cents || 0) / 100;
}

export function getOwnerById(state, id) {
  return collection(state, 'owners').find((owner) => owner.id === id) || null;
}

export function getPatientById(state, id) {
  return collection(state, 'patients').find((patient) => patient.id === id) || null;
}

export function getVisitById(state, id) {
  return collection(state, 'visits').find((visit) => visit.id === id) || null;
}

export function listPatients(state) {
  const visits = collection(state, 'visits');
  return collection(state, 'patients').map((patient) => ({
    ...patient,
    owners: patient.ownerIds.map((ownerId) => getOwnerById(state, ownerId)).filter(Boolean),
    lastVisit: visits.filter((visit) => visit.patientId === patient.id).sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0] || null
  }));
}

export function listOwners(state) {
  const patients = collection(state, 'patients');
  return collection(state, 'owners').map((owner) => ({
    ...owner,
    patients: patients.filter((patient) => patient.ownerIds.includes(owner.id))
  }));
}

export function listVisits(state) {
  return collection(state, 'visits').map((visit) => ({
    ...visit,
    patient: getPatientById(state, visit.patientId),
    owner: getOwnerById(state, visit.ownerId),
    totalCents: visit.procedures.reduce((sum, procedure) => sum + procedure.costCents, 0)
  }));
}

export function getClinicCoreSummary(state) {
  const patients = collection(state, 'patients');
  const owners = collection(state, 'owners');
  const visits = collection(state, 'visits');
  const criticalAllergyCount = patients.reduce((sum, patient) => sum + patient.allergies.filter((allergy) => allergy.severity === 'critical').length, 0);
  const signedVisits = visits.filter((visit) => visit.status === 'signed').length;
  const draftVisits = visits.filter((visit) => visit.status === 'draft').length;
  const openBalanceCents = owners.reduce((sum, owner) => sum + owner.balanceCents, 0);

  return {
    featureCoverage: clinicCoreFeatureCoverage,
    counts: {
      owners: owners.length,
      patients: patients.length,
      visits: visits.length,
      signedVisits,
      draftVisits,
      criticalAllergies: criticalAllergyCount
    },
    openBalance: moneyFromCents(openBalanceCents),
    nextBuildTargets: ['Add database migrations', 'Add patient detail timeline', 'Add critical allergy banner across clinical screens']
  };
}

