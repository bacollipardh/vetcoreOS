import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { clinicCoreSeed } from "../../../packages/shared/clinic-core.mjs";

const dataFile = fileURLToPath(
  new URL("../data/clinic-core.json", import.meta.url),
);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeTags(value) {
  if (Array.isArray(value))
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  if (typeof value === "string")
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  return [];
}

function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeState(state) {
  return {
    owners: Array.isArray(state.owners) ? state.owners : [],
    patients: Array.isArray(state.patients) ? state.patients : [],
    visits: Array.isArray(state.visits) ? state.visits : [],
    vaccinations: Array.isArray(state.vaccinations) ? state.vaccinations : [],
    prescriptions: Array.isArray(state.prescriptions)
      ? state.prescriptions
      : [],
    surgeries: Array.isArray(state.surgeries) ? state.surgeries : [],
    hospitalizations: Array.isArray(state.hospitalizations)
      ? state.hospitalizations
      : [],
    diagnostics: Array.isArray(state.diagnostics) ? state.diagnostics : [],
    labs: Array.isArray(state.labs)
      ? state.labs
      : clone(clinicCoreSeed.labs || []),
    specialties: Array.isArray(state.specialties)
      ? state.specialties
      : clone(clinicCoreSeed.specialties || []),
    appointments: Array.isArray(state.appointments)
      ? state.appointments
      : clone(clinicCoreSeed.appointments || []),
    clientMessages: Array.isArray(state.clientMessages)
      ? state.clientMessages
      : clone(clinicCoreSeed.clientMessages || []),
    staffRoster: Array.isArray(state.staffRoster)
      ? state.staffRoster
      : clone(clinicCoreSeed.staffRoster || []),
    inventoryItems: Array.isArray(state.inventoryItems)
      ? state.inventoryItems
      : clone(clinicCoreSeed.inventoryItems || []),
    purchaseOrders: Array.isArray(state.purchaseOrders)
      ? state.purchaseOrders
      : clone(clinicCoreSeed.purchaseOrders || []),
    controlledLog: Array.isArray(state.controlledLog)
      ? state.controlledLog
      : clone(clinicCoreSeed.controlledLog || []),
    invoices: Array.isArray(state.invoices)
      ? state.invoices
      : clone(clinicCoreSeed.invoices || []),
    payments: Array.isArray(state.payments)
      ? state.payments
      : clone(clinicCoreSeed.payments || []),
    insuranceClaims: Array.isArray(state.insuranceClaims)
      ? state.insuranceClaims
      : clone(clinicCoreSeed.insuranceClaims || []),
    wellnessPlans: Array.isArray(state.wellnessPlans)
      ? state.wellnessPlans
      : clone(clinicCoreSeed.wellnessPlans || []),
    auditEvents: Array.isArray(state.auditEvents) ? state.auditEvents : [],
  };
}

function appendAudit(state, action, entityType, entityId, summary) {
  state.auditEvents.push({
    id: makeId("audit"),
    at: nowIso(),
    actor: "Dr. Demo",
    action,
    entityType,
    entityId,
    summary,
  });
}
export async function readClinicState() {
  try {
    return normalizeState(JSON.parse(await readFile(dataFile, "utf8")));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const seeded = normalizeState(clone(clinicCoreSeed));
    await writeClinicState(seeded);
    return seeded;
  }
}

export async function writeClinicState(state) {
  await mkdir(dirname(dataFile), { recursive: true });
  await writeFile(dataFile, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  return state;
}

export async function createOwner(input) {
  const state = await readClinicState();
  const owner = {
    id: makeId("own"),
    displayName: normalizeText(input.displayName),
    documentId: normalizeText(input.documentId),
    language: normalizeText(input.language, "sq"),
    preferredChannel: normalizeText(input.preferredChannel, "Phone"),
    phone: normalizeText(input.phone),
    email: normalizeText(input.email),
    address: {
      line1: normalizeText(input.address?.line1 || input.addressLine1),
      city: normalizeText(input.address?.city || input.city),
      region: normalizeText(input.address?.region || input.region),
      country: normalizeText(input.address?.country || input.country, "XK"),
      postalCode: normalizeText(input.address?.postalCode || input.postalCode),
    },
    marketingConsent: Boolean(input.marketingConsent),
    balanceCents: Number(input.balanceCents || 0),
    tags: normalizeTags(input.tags),
    privateNote: normalizeText(input.privateNote),
    interactionTimeline: [
      { at: nowIso(), channel: "System", summary: "Owner profile created." },
    ],
  };

  if (!owner.displayName) throw new Error("displayName is required");
  state.owners.push(owner);
  appendAudit(
    state,
    "created",
    "owner",
    owner.id,
    `Created owner ${owner.displayName}`,
  );
  await writeClinicState(state);
  return owner;
}

export async function updateOwner(id, input) {
  const state = await readClinicState();
  const index = state.owners.findIndex((owner) => owner.id === id);
  if (index === -1) return null;
  state.owners[index] = { ...state.owners[index], ...input, id };
  appendAudit(
    state,
    "updated",
    "owner",
    id,
    `Updated owner ${state.owners[index].displayName}`,
  );
  await writeClinicState(state);
  return state.owners[index];
}

export async function createPatient(input) {
  const state = await readClinicState();
  const ownerIds = normalizeTags(input.ownerIds || input.ownerId).filter(
    (ownerId) => state.owners.some((owner) => owner.id === ownerId),
  );
  const patient = {
    id: makeId("pat"),
    name: normalizeText(input.name),
    species: normalizeText(input.species, "Dog"),
    breed: normalizeText(input.breed),
    sex: normalizeText(input.sex, "Unknown"),
    birthDate: normalizeText(input.birthDate),
    neutered: Boolean(input.neutered),
    color: normalizeText(input.color),
    microchip: normalizeText(input.microchip),
    passportNumber: normalizeText(input.passportNumber),
    status: normalizeText(input.status, "active"),
    ownerIds,
    tags: normalizeTags(input.tags),
    allergies: normalizeText(input.allergy)
      ? [
          {
            substance: normalizeText(input.allergy),
            severity: "critical",
            note: normalizeText(input.allergyNote),
          },
        ]
      : [],
    behaviorNotes: normalizeTags(input.behaviorNotes || input.behaviorNote),
    weightHistory:
      Number(input.weightKg) > 0
        ? [{ date: nowIso().slice(0, 10), weightKg: Number(input.weightKg) }]
        : [],
    bcs:
      Number(input.bcsScore) > 0
        ? {
            scale: "1-9",
            score: Number(input.bcsScore),
            recordedAt: nowIso().slice(0, 10),
          }
        : { scale: "1-9", score: null, recordedAt: null },
    photoGallery: [],
  };

  if (!patient.name) throw new Error("name is required");
  if (!patient.ownerIds.length) throw new Error("valid ownerId is required");
  state.patients.push(patient);
  appendAudit(
    state,
    "created",
    "patient",
    patient.id,
    `Created patient ${patient.name}`,
  );
  await writeClinicState(state);
  return patient;
}

export async function updatePatient(id, input) {
  const state = await readClinicState();
  const index = state.patients.findIndex((patient) => patient.id === id);
  if (index === -1) return null;
  state.patients[index] = { ...state.patients[index], ...input, id };
  appendAudit(
    state,
    "updated",
    "patient",
    id,
    `Updated patient ${state.patients[index].name}`,
  );
  await writeClinicState(state);
  return state.patients[index];
}

export async function createVisit(input) {
  const state = await readClinicState();
  const patient = state.patients.find((entry) => entry.id === input.patientId);
  if (!patient) throw new Error("valid patientId is required");
  const ownerId = normalizeText(input.ownerId, patient.ownerIds[0]);
  const visit = {
    id: makeId("vis"),
    patientId: patient.id,
    ownerId,
    visitType: normalizeText(input.visitType, "Consultation"),
    status: normalizeText(input.status, "draft"),
    startedAt: normalizeText(input.startedAt, nowIso()),
    clinician: normalizeText(input.clinician, "Dr. Demo"),
    anamnesis: normalizeText(input.anamnesis),
    physicalExam: {
      temperatureC: Number(input.temperatureC || 0),
      pulseBpm: Number(input.pulseBpm || 0),
      respirationRpm: Number(input.respirationRpm || 0),
      mucousMembranes: normalizeText(input.mucousMembranes),
      lymphNodes: normalizeText(input.lymphNodes),
    },
    diagnoses: normalizeText(input.diagnosis)
      ? [
          {
            system: "free-text",
            code: "",
            label: normalizeText(input.diagnosis),
          },
        ]
      : [],
    differentialDiagnoses: normalizeTags(input.differentialDiagnoses),
    treatmentPlan: normalizeTags(input.treatmentPlan || input.treatmentStep),
    procedures: normalizeText(input.procedureName)
      ? [
          {
            name: normalizeText(input.procedureName),
            costCents: Math.round(Number(input.procedureCost || 0) * 100),
          },
        ]
      : [],
    signedBy: null,
    signedAt: null,
    continuityFromVisitId: normalizeText(input.continuityFromVisitId) || null,
    amendments: [],
  };

  state.visits.push(visit);
  appendAudit(
    state,
    "created",
    "visit",
    visit.id,
    `Created visit ${visit.visitType}`,
  );
  await writeClinicState(state);
  return visit;
}

export async function updateVisit(id, input) {
  const state = await readClinicState();
  const index = state.visits.findIndex((visit) => visit.id === id);
  if (index === -1) return null;
  state.visits[index] = { ...state.visits[index], ...input, id };
  appendAudit(
    state,
    "updated",
    "visit",
    id,
    `Updated visit ${state.visits[index].visitType}`,
  );
  await writeClinicState(state);
  return state.visits[index];
}

export async function createVaccination(input) {
  const state = await readClinicState();
  const patient = state.patients.find((entry) => entry.id === input.patientId);
  if (!patient) throw new Error("valid patientId is required");
  const administeredAt = normalizeText(
    input.administeredAt,
    nowIso().slice(0, 10),
  );
  const nextDueAt = normalizeText(
    input.nextDueAt,
    nextYearDate(administeredAt),
  );
  const vaccination = {
    id: makeId("vac"),
    patientId: patient.id,
    vaccineName: normalizeText(input.vaccineName, "Rabies"),
    protocol: normalizeText(input.protocol, `${patient.species} core`),
    manufacturer: normalizeText(input.manufacturer),
    lotNumber: normalizeText(input.lotNumber),
    expiresAt: normalizeText(input.expiresAt),
    administeredAt,
    nextDueAt,
    status: "current",
    inventoryReduced: input.inventoryReduced === false ? false : true,
    certificateStatus: normalizeText(input.certificateStatus, "ready-for-pdf"),
  };
  state.vaccinations.push(vaccination);
  appendAudit(
    state,
    "created",
    "vaccination",
    vaccination.id,
    `Recorded vaccine ${vaccination.vaccineName}`,
  );
  await writeClinicState(state);
  return vaccination;
}

export async function updateVaccination(id, input) {
  const state = await readClinicState();
  const index = state.vaccinations.findIndex(
    (vaccination) => vaccination.id === id,
  );
  if (index === -1) return null;
  state.vaccinations[index] = { ...state.vaccinations[index], ...input, id };
  appendAudit(
    state,
    "updated",
    "vaccination",
    id,
    `Updated vaccine ${state.vaccinations[index].vaccineName}`,
  );
  await writeClinicState(state);
  return state.vaccinations[index];
}

export async function createPrescription(input) {
  const state = await readClinicState();
  const patient = state.patients.find((entry) => entry.id === input.patientId);
  if (!patient) throw new Error("valid patientId is required");
  const latestWeight =
    patient.weightHistory?.at(-1)?.weightKg || input.patientWeightKg || 0;
  const defaultDoseMgPerKg = Number(input.defaultDoseMgPerKg || 0);
  const calculatedDoseMg =
    Math.round(Number(latestWeight) * defaultDoseMgPerKg * 100) / 100;
  const safetyAlerts = [];
  const medicationName = normalizeText(input.medicationName, "Medication");
  const controlledSubstance =
    Boolean(input.controlledSubstance) ||
    ["buprenorphine", "methadone", "ketamine"].includes(
      medicationName.toLowerCase(),
    );

  if (controlledSubstance)
    safetyAlerts.push("Controlled substance log required");
  if (
    patient.allergies?.some((allergy) =>
      medicationName.toLowerCase().includes(allergy.substance.toLowerCase()),
    )
  ) {
    safetyAlerts.push(
      `Allergy alert: ${patient.allergies.map((allergy) => allergy.substance).join(", ")}`,
    );
  }

  const prescription = {
    id: makeId("rx"),
    patientId: patient.id,
    visitId: normalizeText(input.visitId) || null,
    medicationName,
    catalogCode: normalizeText(input.catalogCode),
    defaultDoseMgPerKg,
    patientWeightKg: Number(latestWeight || 0),
    calculatedDoseMg,
    route: normalizeText(input.route, "PO"),
    frequency: normalizeText(input.frequency, "BID"),
    durationDays: Number(input.durationDays || 0),
    controlledSubstance,
    prescriptionRequired: input.prescriptionRequired === false ? false : true,
    safetyAlerts,
    refillDueAt: normalizeText(input.refillDueAt) || null,
    complianceStatus: normalizeText(input.complianceStatus, "monitoring"),
    signedBy: normalizeText(input.signedBy) || null,
    signedAt: normalizeText(input.signedAt) || null,
  };

  state.prescriptions.push(prescription);
  appendAudit(
    state,
    "created",
    "prescription",
    prescription.id,
    `Created prescription ${prescription.medicationName}`,
  );
  await writeClinicState(state);
  return prescription;
}

export async function updatePrescription(id, input) {
  const state = await readClinicState();
  const index = state.prescriptions.findIndex(
    (prescription) => prescription.id === id,
  );
  if (index === -1) return null;
  state.prescriptions[index] = { ...state.prescriptions[index], ...input, id };
  appendAudit(
    state,
    "updated",
    "prescription",
    id,
    `Updated prescription ${state.prescriptions[index].medicationName}`,
  );
  await writeClinicState(state);
  return state.prescriptions[index];
}

export async function createSurgery(input) {
  const state = await readClinicState();
  const patient = state.patients.find((entry) => entry.id === input.patientId);
  if (!patient) throw new Error("valid patientId is required");
  const checklist = normalizeTags(input.checklist || input.preOpChecklist).map(
    (label) => ({ label, done: false }),
  );
  const surgery = {
    id: makeId("surg"),
    patientId: patient.id,
    visitId: normalizeText(input.visitId) || null,
    procedureName: normalizeText(input.procedureName, "Surgery"),
    scheduledAt: normalizeText(input.scheduledAt, nowIso()),
    surgeon: normalizeText(input.surgeon, "Dr. Demo"),
    status: normalizeText(input.status, "planned"),
    estimateCents: Math.round(Number(input.estimate || 0) * 100),
    consentStatus: normalizeText(input.consentStatus, "pending"),
    preOpChecklist: checklist.length
      ? checklist
      : [
          { label: "Fasting confirmed", done: false },
          { label: "Consent signed", done: false },
          { label: "Anesthesia risk discussed", done: false },
        ],
    anesthesiaRecord: [],
    drugsGiven: [],
    recoveryStatus: normalizeText(input.recoveryStatus, "not-started"),
    dischargeInstructions: normalizeText(input.dischargeInstructions),
    followUpDueAt: normalizeText(input.followUpDueAt) || null,
  };
  state.surgeries.push(surgery);
  appendAudit(
    state,
    "created",
    "surgery",
    surgery.id,
    `Planned surgery ${surgery.procedureName}`,
  );
  await writeClinicState(state);
  return surgery;
}

export async function updateSurgery(id, input) {
  const state = await readClinicState();
  const index = state.surgeries.findIndex((surgery) => surgery.id === id);
  if (index === -1) return null;
  state.surgeries[index] = { ...state.surgeries[index], ...input, id };
  appendAudit(
    state,
    "updated",
    "surgery",
    id,
    `Updated surgery ${state.surgeries[index].procedureName}`,
  );
  await writeClinicState(state);
  return state.surgeries[index];
}

export async function createHospitalization(input) {
  const state = await readClinicState();
  const patient = state.patients.find((entry) => entry.id === input.patientId);
  if (!patient) throw new Error("valid patientId is required");
  const tasks = normalizeTags(input.tasks || input.treatmentSheet).map(
    (task, index) => ({
      time: new Date(Date.now() + index * 60 * 60 * 1000).toISOString(),
      task,
      intervalHours: 0,
      completed: false,
    }),
  );
  const vitals = Number(
    input.temperatureC ||
      input.pulseBpm ||
      input.respirationRpm ||
      input.painScore,
  )
    ? [
        {
          at: nowIso(),
          temperatureC: Number(input.temperatureC || 0),
          pulseBpm: Number(input.pulseBpm || 0),
          respirationRpm: Number(input.respirationRpm || 0),
          painScore: Number(input.painScore || 0),
        },
      ]
    : [];
  const stay = {
    id: makeId("hosp"),
    patientId: patient.id,
    visitId: normalizeText(input.visitId) || null,
    stayType: normalizeText(input.stayType, "hospitalization"),
    cage: normalizeText(input.cage, "Unassigned"),
    admittedAt: normalizeText(input.admittedAt, nowIso()),
    dischargePlannedAt: normalizeText(input.dischargePlannedAt) || null,
    status: normalizeText(input.status, "in-care"),
    acuity: normalizeText(input.acuity, "routine"),
    ownerVisibleStatus: normalizeText(
      input.ownerVisibleStatus,
      "Admitted and monitored",
    ),
    photoUpdates: normalizeText(input.photoCaption)
      ? [
          {
            at: nowIso(),
            caption: normalizeText(input.photoCaption),
            sharedToPortal: true,
          },
        ]
      : [],
    treatmentSheet: tasks.length
      ? tasks
      : [
          {
            time: nowIso(),
            task: "Initial nursing check",
            intervalHours: 0,
            completed: false,
          },
        ],
    vitals,
    shiftNotes: normalizeText(input.shiftNote)
      ? [
          {
            at: nowIso(),
            shift: normalizeText(input.shift, "Day"),
            author: normalizeText(input.author, "Care team"),
            note: normalizeText(input.shiftNote),
          },
        ]
      : [],
    dischargePlan: normalizeTags(input.dischargePlan),
  };
  state.hospitalizations.push(stay);
  appendAudit(
    state,
    "created",
    "hospitalization",
    stay.id,
    `Admitted patient to ${stay.cage}`,
  );
  await writeClinicState(state);
  return stay;
}

export async function updateHospitalization(id, input) {
  const state = await readClinicState();
  const index = state.hospitalizations.findIndex((stay) => stay.id === id);
  if (index === -1) return null;
  state.hospitalizations[index] = {
    ...state.hospitalizations[index],
    ...input,
    id,
  };
  appendAudit(
    state,
    "updated",
    "hospitalization",
    id,
    `Updated stay ${state.hospitalizations[index].cage}`,
  );
  await writeClinicState(state);
  return state.hospitalizations[index];
}

export async function createDiagnostic(input) {
  const state = await readClinicState();
  const patient = state.patients.find((entry) => entry.id === input.patientId);
  if (!patient) throw new Error("valid patientId is required");
  const modality = normalizeText(input.modality, "X-ray");
  const annotationLabels = normalizeTags(input.annotations || input.annotation);
  const diagnostic = {
    id: makeId("diag"),
    patientId: patient.id,
    visitId: normalizeText(input.visitId) || null,
    modality,
    title: normalizeText(input.title, `${modality} study`),
    capturedAt: normalizeText(input.capturedAt, nowIso()),
    status: normalizeText(input.status, "needs-review"),
    storageType: normalizeText(input.storageType, "local-media"),
    fileName: normalizeText(
      input.fileName,
      `${patient.name}-${modality}`.toLowerCase().replace(/\s+/g, "-"),
    ),
    thumbnailStatus: normalizeText(input.thumbnailStatus, "queued"),
    pacsLink: normalizeText(input.pacsLink),
    annotations: annotationLabels.map((label) => ({
      label,
      note: normalizeText(input.annotationNote),
      region: normalizeText(input.region, "general"),
    })),
    clinicalMedia: normalizeText(input.mediaCaption)
      ? [
          {
            type: normalizeText(input.mediaType, "photo"),
            caption: normalizeText(input.mediaCaption),
            sharedToRecord: true,
          },
        ]
      : [],
    aiScreening: [
      {
        model: modality.toLowerCase().includes("photo")
          ? "skin-lesion-classification-late-phase"
          : "fracture-detection-late-phase",
        result: "queued",
        confidence: null,
      },
    ],
    report: {
      radiologist: normalizeText(input.radiologist),
      impression: normalizeText(input.impression),
      finalizedAt: normalizeText(input.impression) ? nowIso() : null,
    },
  };
  state.diagnostics.push(diagnostic);
  appendAudit(
    state,
    "created",
    "diagnostic",
    diagnostic.id,
    `Recorded diagnostic ${diagnostic.title}`,
  );
  await writeClinicState(state);
  return diagnostic;
}

export async function updateDiagnostic(id, input) {
  const state = await readClinicState();
  const index = state.diagnostics.findIndex((record) => record.id === id);
  if (index === -1) return null;
  state.diagnostics[index] = { ...state.diagnostics[index], ...input, id };
  appendAudit(
    state,
    "updated",
    "diagnostic",
    id,
    `Updated diagnostic ${state.diagnostics[index].title}`,
  );
  await writeClinicState(state);
  return state.diagnostics[index];
}

export async function createLab(input) {
  const state = await readClinicState();
  const patient = state.patients.find((entry) => entry.id === input.patientId);
  if (!patient) throw new Error("valid patientId is required");
  const resultLabels = normalizeTags(input.results || input.analytes);
  const criticalAlerts = normalizeTags(input.criticalAlerts);
  const lab = {
    id: makeId("lab"),
    patientId: patient.id,
    visitId: normalizeText(input.visitId) || null,
    source: normalizeText(input.source, "in-house"),
    provider: normalizeText(input.provider, "Clinic Lab"),
    country: normalizeText(input.country, "XK"),
    testType: normalizeText(input.testType, "Blood chemistry"),
    panelName: normalizeText(input.panelName, "Lab panel"),
    sampleType: normalizeText(input.sampleType, "blood"),
    orderedAt: normalizeText(input.orderedAt, nowIso()),
    collectedAt: normalizeText(input.collectedAt) || null,
    status: normalizeText(input.status, "ordered"),
    externalOrderId: normalizeText(input.externalOrderId) || null,
    pdfFileName: normalizeText(input.pdfFileName) || null,
    parserStatus: normalizeText(
      input.parserStatus,
      input.pdfFileName ? "queued" : "manual-entry",
    ),
    results: resultLabels.map((label) => ({
      analyte: label,
      value: null,
      unit: "",
      referenceLow: null,
      referenceHigh: null,
      flag: "pending",
    })),
    criticalAlerts,
    trendNotes: normalizeTags(input.trendNotes || input.trendNote),
    sharedWithOwner: Boolean(input.sharedWithOwner),
    interpretation: {
      summary: normalizeText(input.interpretation || input.summary),
      aiStatus: normalizeText(
        input.aiStatus,
        normalizeText(input.interpretation || input.summary)
          ? "reviewed"
          : "not-run",
      ),
    },
  };
  state.labs.push(lab);
  appendAudit(state, "created", "lab", lab.id, `Created lab ${lab.panelName}`);
  await writeClinicState(state);
  return lab;
}

export async function updateLab(id, input) {
  const state = await readClinicState();
  const index = state.labs.findIndex((record) => record.id === id);
  if (index === -1) return null;
  state.labs[index] = { ...state.labs[index], ...input, id };
  appendAudit(
    state,
    "updated",
    "lab",
    id,
    `Updated lab ${state.labs[index].panelName}`,
  );
  await writeClinicState(state);
  return state.labs[index];
}

export async function createSpecialty(input) {
  const state = await readClinicState();
  const patient = state.patients.find((entry) => entry.id === input.patientId);
  if (!patient) throw new Error("valid patientId is required");
  const specialty = {
    id: makeId("spec"),
    patientId: patient.id,
    visitId: normalizeText(input.visitId) || null,
    specialtyType: normalizeText(input.specialtyType, "dentistry"),
    title: normalizeText(input.title, "Specialty record"),
    startedAt: normalizeText(input.startedAt, nowIso()),
    status: normalizeText(input.status, "active"),
    clinician: normalizeText(input.clinician, "Dr. Demo"),
    findings: normalizeTags(input.findings || input.finding).map((finding) => ({
      region: normalizeText(input.region, "general"),
      finding,
      stage: normalizeText(input.stage),
    })),
    tasks: normalizeTags(input.tasks || input.task).map((label) => ({
      label,
      dueAt: normalizeText(input.taskDueAt) || null,
      done: false,
    })),
    plan: normalizeTags(input.plan || input.planStep),
    qualityOfLifeScore:
      Number(input.qualityOfLifeScore) > 0
        ? Number(input.qualityOfLifeScore)
        : null,
    attachments: normalizeText(input.attachmentLabel)
      ? [
          {
            type: normalizeText(input.attachmentType, "note"),
            label: normalizeText(input.attachmentLabel),
          },
        ]
      : [],
    genetics: normalizeText(input.geneticTest)
      ? [
          {
            provider: normalizeText(input.geneticProvider, "external"),
            test: normalizeText(input.geneticTest),
            status: normalizeText(input.geneticStatus, "linked"),
          },
        ]
      : [],
  };
  state.specialties.push(specialty);
  appendAudit(
    state,
    "created",
    "specialty",
    specialty.id,
    `Created specialty record ${specialty.title}`,
  );
  await writeClinicState(state);
  return specialty;
}

export async function updateSpecialty(id, input) {
  const state = await readClinicState();
  const index = state.specialties.findIndex((record) => record.id === id);
  if (index === -1) return null;
  state.specialties[index] = { ...state.specialties[index], ...input, id };
  appendAudit(
    state,
    "updated",
    "specialty",
    id,
    `Updated specialty record ${state.specialties[index].title}`,
  );
  await writeClinicState(state);
  return state.specialties[index];
}

export async function createAppointment(input) {
  const state = await readClinicState();
  const patient = state.patients.find((entry) => entry.id === input.patientId);
  if (!patient) throw new Error("valid patientId is required");
  const ownerId =
    normalizeText(input.ownerId) ||
    patient.ownerIds.find((id) =>
      state.owners.some((owner) => owner.id === id),
    );
  if (!ownerId) throw new Error("valid ownerId is required");
  const appointment = {
    id: makeId("apt"),
    patientId: patient.id,
    ownerId,
    visitId: normalizeText(input.visitId) || null,
    title: normalizeText(input.title, "Appointment"),
    appointmentType: normalizeText(input.appointmentType, "consult"),
    channel: normalizeText(input.channel, "front-desk"),
    room: normalizeText(input.room, "Exam Room 1"),
    assignedVet: normalizeText(input.assignedVet, "Dr. Demo"),
    assignedStaff: normalizeTags(
      input.assignedStaff || input.assignedStaffName,
    ),
    startsAt: normalizeText(input.startsAt, nowIso()),
    endsAt: normalizeText(input.endsAt, nowIso()),
    status: normalizeText(input.status, "scheduled"),
    colorCode: normalizeText(input.colorCode, "consult"),
    recurring: Boolean(input.recurring),
    waitlistPriority: normalizeText(input.waitlistPriority) || null,
    walkIn: Boolean(input.walkIn),
    surgeryBlock: Boolean(input.surgeryBlock),
    bufferMinutes: Number(input.bufferMinutes || 0),
    noShowRisk: normalizeText(input.noShowRisk, "low"),
    notes: normalizeText(input.notes),
  };
  state.appointments.push(appointment);
  appendAudit(
    state,
    "created",
    "appointment",
    appointment.id,
    `Created appointment ${appointment.title}`,
  );
  await writeClinicState(state);
  return appointment;
}

export async function updateAppointment(id, input) {
  const state = await readClinicState();
  const index = state.appointments.findIndex((record) => record.id === id);
  if (index === -1) return null;
  state.appointments[index] = { ...state.appointments[index], ...input, id };
  appendAudit(
    state,
    "updated",
    "appointment",
    id,
    `Updated appointment ${state.appointments[index].title}`,
  );
  await writeClinicState(state);
  return state.appointments[index];
}

export async function createClientMessage(input) {
  const state = await readClinicState();
  const patient = state.patients.find((entry) => entry.id === input.patientId);
  if (!patient) throw new Error("valid patientId is required");
  const ownerId =
    normalizeText(input.ownerId) ||
    patient.ownerIds.find((id) =>
      state.owners.some((owner) => owner.id === id),
    );
  if (!ownerId) throw new Error("valid ownerId is required");
  const message = {
    id: makeId("msg"),
    patientId: patient.id,
    ownerId,
    appointmentId: normalizeText(input.appointmentId) || null,
    channel: normalizeText(input.channel, "WhatsApp"),
    direction: normalizeText(input.direction, "outbound"),
    template: normalizeText(input.template, "custom"),
    language: normalizeText(input.language, "sq"),
    status: normalizeText(input.status, "draft"),
    scheduledAt: normalizeText(input.scheduledAt, nowIso()),
    sentAt: normalizeText(input.sentAt) || null,
    requiresReply: Boolean(input.requiresReply),
    translated: Boolean(input.translated),
    summary: normalizeText(input.summary, "Client message"),
  };
  state.clientMessages.push(message);
  appendAudit(
    state,
    "created",
    "message",
    message.id,
    `Created client message ${message.template}`,
  );
  await writeClinicState(state);
  return message;
}

export async function updateClientMessage(id, input) {
  const state = await readClinicState();
  const index = state.clientMessages.findIndex((record) => record.id === id);
  if (index === -1) return null;
  state.clientMessages[index] = {
    ...state.clientMessages[index],
    ...input,
    id,
  };
  appendAudit(
    state,
    "updated",
    "message",
    id,
    `Updated client message ${state.clientMessages[index].template}`,
  );
  await writeClinicState(state);
  return state.clientMessages[index];
}

export async function createInventoryItem(input) {
  const state = await readClinicState();
  const warehouseLocation = normalizeText(
    input.warehouseLocation || input.warehouse,
    "Main Pharmacy",
  );
  const lotNumber = normalizeText(input.lotNumber, `LOT-${Date.now()}`);
  const onHandUnits = Number(input.onHandUnits || 0);
  const item = {
    id: makeId("inv"),
    medicationName: normalizeText(input.medicationName, "Inventory item"),
    atcvetCode: normalizeText(input.atcvetCode),
    dosageForm: normalizeText(input.dosageForm, "tablet"),
    names: {
      sq: normalizeText(input.nameSq || input.medicationName, "Medication"),
      en: normalizeText(input.nameEn || input.medicationName, "Medication"),
      de: normalizeText(input.nameDe || input.medicationName, "Medication"),
    },
    concentration: normalizeText(input.concentration),
    dosingInstructions: normalizeText(input.dosingInstructions),
    countryAvailability: normalizeTags(
      input.countryAvailability || input.country,
    ),
    restrictions: normalizeTags(input.restrictions),
    prescriptionRequired: Boolean(input.prescriptionRequired),
    controlledSubstance: Boolean(input.controlledSubstance),
    warehouses: [
      {
        location: warehouseLocation,
        lotNumber,
        expiresAt: normalizeText(input.expiresAt) || null,
        onHandUnits,
      },
    ],
    reorderThreshold: Number(input.reorderThreshold || 0),
    wastageUnits: Number(input.wastageUnits || 0),
    supplierId: normalizeText(input.supplierId, "sup_manual"),
    supplierName: normalizeText(input.supplierName, "Manual supplier"),
    fifoCostCents: Math.round(Number(input.fifoCost || 0) * 100),
    avcoCostCents: Math.round(
      Number(input.avcoCost || input.fifoCost || 0) * 100,
    ),
    stocktakeVariance: Number(input.stocktakeVariance || 0),
    movements: onHandUnits
      ? [
          {
            at: nowIso(),
            type: "receive",
            units: onHandUnits,
            warehouse: warehouseLocation,
            reason: "Initial stock entry",
          },
        ]
      : [],
  };
  state.inventoryItems.push(item);
  appendAudit(
    state,
    "created",
    "inventory",
    item.id,
    `Created inventory item ${item.medicationName}`,
  );
  await writeClinicState(state);
  return item;
}

export async function updateInventoryItem(id, input) {
  const state = await readClinicState();
  const index = state.inventoryItems.findIndex((record) => record.id === id);
  if (index === -1) return null;
  const { controlledEntry, ...patch } = input;
  state.inventoryItems[index] = {
    ...state.inventoryItems[index],
    ...patch,
    id,
  };
  if (state.inventoryItems[index].controlledSubstance && controlledEntry) {
    state.controlledLog.push({
      id: makeId("ctl"),
      inventoryItemId: id,
      patientId: normalizeText(controlledEntry.patientId) || null,
      actor: normalizeText(controlledEntry.actor, "Dr. Demo"),
      at: nowIso(),
      action: normalizeText(controlledEntry.action, "adjustment"),
      units: Number(controlledEntry.units || 0),
      remainingUnits: Number(controlledEntry.remainingUnits || 0),
      authorityReportStatus: normalizeText(
        controlledEntry.authorityReportStatus,
        "not-required",
      ),
      reconciliationStatus: normalizeText(
        controlledEntry.reconciliationStatus,
        "open",
      ),
      note: normalizeText(controlledEntry.note),
    });
  }
  appendAudit(
    state,
    "updated",
    "inventory",
    id,
    `Updated inventory item ${state.inventoryItems[index].medicationName}`,
  );
  await writeClinicState(state);
  return state.inventoryItems[index];
}

export async function createPurchaseOrder(input) {
  const state = await readClinicState();
  const purchaseOrder = {
    id: makeId("po"),
    supplierId: normalizeText(input.supplierId, "sup_manual"),
    supplierName: normalizeText(input.supplierName, "Manual supplier"),
    warehouse: normalizeText(input.warehouse, "Main Pharmacy"),
    approvalStatus: normalizeText(input.approvalStatus, "pending"),
    receivingStatus: normalizeText(input.receivingStatus, "ordered"),
    invoiceMatchStatus: normalizeText(input.invoiceMatchStatus, "pending"),
    costMethod: normalizeText(input.costMethod, "AVCO"),
    expectedAt: normalizeText(input.expectedAt, nowIso()),
    receivedAt: normalizeText(input.receivedAt) || null,
    invoiceReference: normalizeText(input.invoiceReference),
    lines: [
      {
        medicationName: normalizeText(input.medicationName, "Inventory item"),
        quantity: Number(input.quantity || 0),
        unitCostCents: Math.round(Number(input.unitCost || 0) * 100),
      },
    ],
  };
  state.purchaseOrders.push(purchaseOrder);
  appendAudit(
    state,
    "created",
    "purchase-order",
    purchaseOrder.id,
    `Created purchase order ${purchaseOrder.id}`,
  );
  await writeClinicState(state);
  return purchaseOrder;
}

export async function updatePurchaseOrder(id, input) {
  const state = await readClinicState();
  const index = state.purchaseOrders.findIndex((record) => record.id === id);
  if (index === -1) return null;
  state.purchaseOrders[index] = {
    ...state.purchaseOrders[index],
    ...input,
    id,
  };
  appendAudit(
    state,
    "updated",
    "purchase-order",
    id,
    `Updated purchase order ${state.purchaseOrders[index].id}`,
  );
  await writeClinicState(state);
  return state.purchaseOrders[index];
}

export async function createInvoice(input) {
  const state = await readClinicState();
  const patient = state.patients.find((entry) => entry.id === input.patientId);
  if (!patient) throw new Error("valid patientId is required");
  const ownerId =
    normalizeText(input.ownerId) ||
    patient.ownerIds.find((id) =>
      state.owners.some((owner) => owner.id === id),
    );
  if (!ownerId) throw new Error("valid ownerId is required");
  const invoice = {
    id: makeId("fin"),
    patientId: patient.id,
    ownerId,
    visitId: normalizeText(input.visitId) || null,
    invoiceType: normalizeText(input.invoiceType, "invoice"),
    documentNumber: normalizeText(
      input.documentNumber,
      `DOC-${Date.now().toString(36).toUpperCase()}`,
    ),
    currency: normalizeText(input.currency, "EUR"),
    country: normalizeText(input.country, "XK"),
    status: normalizeText(input.status, "draft"),
    paymentStatus: normalizeText(input.paymentStatus, "unpaid"),
    issueDate: normalizeText(input.issueDate, nowIso().slice(0, 10)),
    dueDate: normalizeText(input.dueDate, nowIso().slice(0, 10)),
    vatRate: Number(input.vatRate || 0),
    reducedVatApplied: Boolean(input.reducedVatApplied),
    discountType: normalizeText(input.discountType, "percent"),
    discountValue: Number(input.discountValue || 0),
    bundleName: normalizeText(input.bundleName),
    eInvoicingChannel: normalizeText(input.eInvoicingChannel, "manual"),
    fiscalPrinterStatus: normalizeText(input.fiscalPrinterStatus, "not-sent"),
    lineItems: [
      {
        description: normalizeText(input.description, "Service line"),
        quantity: Number(input.quantity || 1),
        unitPriceCents: Math.round(Number(input.unitPrice || 0) * 100),
      },
    ],
    creditNotes: [],
  };
  state.invoices.push(invoice);
  appendAudit(
    state,
    "created",
    "invoice",
    invoice.id,
    `Created ${invoice.invoiceType} ${invoice.documentNumber}`,
  );
  await writeClinicState(state);
  return invoice;
}

export async function updateInvoice(id, input) {
  const state = await readClinicState();
  const index = state.invoices.findIndex((record) => record.id === id);
  if (index === -1) return null;
  state.invoices[index] = { ...state.invoices[index], ...input, id };
  appendAudit(
    state,
    "updated",
    "invoice",
    id,
    `Updated invoice ${state.invoices[index].documentNumber}`,
  );
  await writeClinicState(state);
  return state.invoices[index];
}

export async function createPayment(input) {
  const state = await readClinicState();
  const invoice = state.invoices.find((entry) => entry.id === input.invoiceId);
  if (!invoice) throw new Error("valid invoiceId is required");
  const payment = {
    id: makeId("pay"),
    invoiceId: invoice.id,
    patientId: invoice.patientId,
    ownerId: invoice.ownerId,
    method: normalizeText(input.method, "cash"),
    provider: normalizeText(input.provider, "Manual"),
    status: normalizeText(input.status, "pending"),
    amountCents: Math.round(Number(input.amount || 0) * 100),
    currency: normalizeText(input.currency, invoice.currency || "EUR"),
    splitCount: Number(input.splitCount || 1),
    installmentPlan: Boolean(input.installmentPlan),
    receivedAt: normalizeText(input.receivedAt, nowIso()),
    reference: normalizeText(input.reference),
  };
  state.payments.push(payment);
  appendAudit(
    state,
    "created",
    "payment",
    payment.id,
    `Created payment for ${invoice.documentNumber}`,
  );
  await writeClinicState(state);
  return payment;
}

export async function updatePayment(id, input) {
  const state = await readClinicState();
  const index = state.payments.findIndex((record) => record.id === id);
  if (index === -1) return null;
  state.payments[index] = { ...state.payments[index], ...input, id };
  appendAudit(
    state,
    "updated",
    "payment",
    id,
    `Updated payment ${state.payments[index].reference || state.payments[index].id}`,
  );
  await writeClinicState(state);
  return state.payments[index];
}

export async function createInsuranceClaim(input) {
  const state = await readClinicState();
  const patient = state.patients.find((entry) => entry.id === input.patientId);
  if (!patient) throw new Error("valid patientId is required");
  const ownerId =
    normalizeText(input.ownerId) ||
    patient.ownerIds.find((id) =>
      state.owners.some((owner) => owner.id === id),
    );
  if (!ownerId) throw new Error("valid ownerId is required");
  const claim = {
    id: makeId("clm"),
    patientId: patient.id,
    ownerId,
    visitId: normalizeText(input.visitId) || null,
    provider: normalizeText(input.provider, "Insurance provider"),
    policyNumber: normalizeText(input.policyNumber),
    claimType: normalizeText(input.claimType, "submission"),
    status: normalizeText(input.status, "draft"),
    preAuthorization: Boolean(input.preAuthorization),
    directSettlement: Boolean(input.directSettlement),
    autofillFromEmr: Boolean(input.autofillFromEmr),
    submittedAt: normalizeText(input.submittedAt, nowIso()),
    approvedAmountCents: Math.round(Number(input.approvedAmount || 0) * 100),
    note: normalizeText(input.note),
  };
  state.insuranceClaims.push(claim);
  appendAudit(
    state,
    "created",
    "insurance-claim",
    claim.id,
    `Created insurance claim ${claim.provider}`,
  );
  await writeClinicState(state);
  return claim;
}

export async function updateInsuranceClaim(id, input) {
  const state = await readClinicState();
  const index = state.insuranceClaims.findIndex((record) => record.id === id);
  if (index === -1) return null;
  state.insuranceClaims[index] = {
    ...state.insuranceClaims[index],
    ...input,
    id,
  };
  appendAudit(
    state,
    "updated",
    "insurance-claim",
    id,
    `Updated insurance claim ${state.insuranceClaims[index].provider}`,
  );
  await writeClinicState(state);
  return state.insuranceClaims[index];
}

export async function createWellnessPlan(input) {
  const state = await readClinicState();
  const patient = state.patients.find((entry) => entry.id === input.patientId);
  if (!patient) throw new Error("valid patientId is required");
  const ownerId =
    normalizeText(input.ownerId) ||
    patient.ownerIds.find((id) =>
      state.owners.some((owner) => owner.id === id),
    );
  if (!ownerId) throw new Error("valid ownerId is required");
  const plan = {
    id: makeId("wlp"),
    patientId: patient.id,
    ownerId,
    planName: normalizeText(input.planName, "Wellness plan"),
    programType: normalizeText(input.programType, "wellness"),
    billingProvider: normalizeText(input.billingProvider, "Manual"),
    status: normalizeText(input.status, "draft"),
    monthlyFeeCents: Math.round(Number(input.monthlyFee || 0) * 100),
    autoBilling: Boolean(input.autoBilling),
    startDate: normalizeText(input.startDate, nowIso().slice(0, 10)),
    nextBillingDate: normalizeText(
      input.nextBillingDate,
      nowIso().slice(0, 10),
    ),
    redemptionUsed: Number(input.redemptionUsed || 0),
    redemptionTotal: Number(input.redemptionTotal || 0),
    pauseRequested: Boolean(input.pauseRequested),
    notes: normalizeText(input.notes),
  };
  state.wellnessPlans.push(plan);
  appendAudit(
    state,
    "created",
    "wellness-plan",
    plan.id,
    `Created wellness plan ${plan.planName}`,
  );
  await writeClinicState(state);
  return plan;
}

export async function updateWellnessPlan(id, input) {
  const state = await readClinicState();
  const index = state.wellnessPlans.findIndex((record) => record.id === id);
  if (index === -1) return null;
  state.wellnessPlans[index] = { ...state.wellnessPlans[index], ...input, id };
  appendAudit(
    state,
    "updated",
    "wellness-plan",
    id,
    `Updated wellness plan ${state.wellnessPlans[index].planName}`,
  );
  await writeClinicState(state);
  return state.wellnessPlans[index];
}

function nextYearDate(dateText) {
  const date = new Date(`${dateText}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return nowIso().slice(0, 10);
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  return date.toISOString().slice(0, 10);
}
