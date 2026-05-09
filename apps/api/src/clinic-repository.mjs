import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { clinicCoreSeed } from '../../../packages/shared/clinic-core.mjs';

const dataFile = fileURLToPath(new URL('../data/clinic-core.json', import.meta.url));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeText(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizeTags(value) {
  if (Array.isArray(value)) return value.map((entry) => String(entry).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((entry) => entry.trim()).filter(Boolean);
  return [];
}

function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export async function readClinicState() {
  try {
    return JSON.parse(await readFile(dataFile, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const seeded = clone(clinicCoreSeed);
    await writeClinicState(seeded);
    return seeded;
  }
}

export async function writeClinicState(state) {
  await mkdir(dirname(dataFile), { recursive: true });
  await writeFile(dataFile, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  return state;
}

export async function createOwner(input) {
  const state = await readClinicState();
  const owner = {
    id: makeId('own'),
    displayName: normalizeText(input.displayName),
    documentId: normalizeText(input.documentId),
    language: normalizeText(input.language, 'sq'),
    preferredChannel: normalizeText(input.preferredChannel, 'Phone'),
    phone: normalizeText(input.phone),
    email: normalizeText(input.email),
    address: {
      line1: normalizeText(input.address?.line1 || input.addressLine1),
      city: normalizeText(input.address?.city || input.city),
      region: normalizeText(input.address?.region || input.region),
      country: normalizeText(input.address?.country || input.country, 'XK'),
      postalCode: normalizeText(input.address?.postalCode || input.postalCode)
    },
    marketingConsent: Boolean(input.marketingConsent),
    balanceCents: Number(input.balanceCents || 0),
    tags: normalizeTags(input.tags),
    privateNote: normalizeText(input.privateNote),
    interactionTimeline: [{ at: nowIso(), channel: 'System', summary: 'Owner profile created.' }]
  };

  if (!owner.displayName) throw new Error('displayName is required');
  state.owners.push(owner);
  await writeClinicState(state);
  return owner;
}

export async function updateOwner(id, input) {
  const state = await readClinicState();
  const index = state.owners.findIndex((owner) => owner.id === id);
  if (index === -1) return null;
  state.owners[index] = { ...state.owners[index], ...input, id };
  await writeClinicState(state);
  return state.owners[index];
}

export async function createPatient(input) {
  const state = await readClinicState();
  const ownerIds = normalizeTags(input.ownerIds || input.ownerId).filter((ownerId) => state.owners.some((owner) => owner.id === ownerId));
  const patient = {
    id: makeId('pat'),
    name: normalizeText(input.name),
    species: normalizeText(input.species, 'Dog'),
    breed: normalizeText(input.breed),
    sex: normalizeText(input.sex, 'Unknown'),
    birthDate: normalizeText(input.birthDate),
    neutered: Boolean(input.neutered),
    color: normalizeText(input.color),
    microchip: normalizeText(input.microchip),
    passportNumber: normalizeText(input.passportNumber),
    status: normalizeText(input.status, 'active'),
    ownerIds,
    tags: normalizeTags(input.tags),
    allergies: normalizeText(input.allergy)
      ? [{ substance: normalizeText(input.allergy), severity: 'critical', note: normalizeText(input.allergyNote) }]
      : [],
    behaviorNotes: normalizeTags(input.behaviorNotes || input.behaviorNote),
    weightHistory: Number(input.weightKg) > 0 ? [{ date: nowIso().slice(0, 10), weightKg: Number(input.weightKg) }] : [],
    bcs: Number(input.bcsScore) > 0 ? { scale: '1-9', score: Number(input.bcsScore), recordedAt: nowIso().slice(0, 10) } : { scale: '1-9', score: null, recordedAt: null },
    photoGallery: []
  };

  if (!patient.name) throw new Error('name is required');
  if (!patient.ownerIds.length) throw new Error('valid ownerId is required');
  state.patients.push(patient);
  await writeClinicState(state);
  return patient;
}

export async function updatePatient(id, input) {
  const state = await readClinicState();
  const index = state.patients.findIndex((patient) => patient.id === id);
  if (index === -1) return null;
  state.patients[index] = { ...state.patients[index], ...input, id };
  await writeClinicState(state);
  return state.patients[index];
}

export async function createVisit(input) {
  const state = await readClinicState();
  const patient = state.patients.find((entry) => entry.id === input.patientId);
  if (!patient) throw new Error('valid patientId is required');
  const ownerId = normalizeText(input.ownerId, patient.ownerIds[0]);
  const visit = {
    id: makeId('vis'),
    patientId: patient.id,
    ownerId,
    visitType: normalizeText(input.visitType, 'Consultation'),
    status: normalizeText(input.status, 'draft'),
    startedAt: normalizeText(input.startedAt, nowIso()),
    clinician: normalizeText(input.clinician, 'Dr. Demo'),
    anamnesis: normalizeText(input.anamnesis),
    physicalExam: {
      temperatureC: Number(input.temperatureC || 0),
      pulseBpm: Number(input.pulseBpm || 0),
      respirationRpm: Number(input.respirationRpm || 0),
      mucousMembranes: normalizeText(input.mucousMembranes),
      lymphNodes: normalizeText(input.lymphNodes)
    },
    diagnoses: normalizeText(input.diagnosis) ? [{ system: 'free-text', code: '', label: normalizeText(input.diagnosis) }] : [],
    differentialDiagnoses: normalizeTags(input.differentialDiagnoses),
    treatmentPlan: normalizeTags(input.treatmentPlan || input.treatmentStep),
    procedures: normalizeText(input.procedureName)
      ? [{ name: normalizeText(input.procedureName), costCents: Math.round(Number(input.procedureCost || 0) * 100) }]
      : [],
    signedBy: null,
    signedAt: null,
    continuityFromVisitId: normalizeText(input.continuityFromVisitId) || null,
    amendments: []
  };

  state.visits.push(visit);
  await writeClinicState(state);
  return visit;
}

export async function updateVisit(id, input) {
  const state = await readClinicState();
  const index = state.visits.findIndex((visit) => visit.id === id);
  if (index === -1) return null;
  state.visits[index] = { ...state.visits[index], ...input, id };
  await writeClinicState(state);
  return state.visits[index];
}

