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

function nextYearDate(dateText) {
  const date = new Date(`${dateText}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return nowIso().slice(0, 10);
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  return date.toISOString().slice(0, 10);
}
