// P2 Prescription and dosing workflow coverage: F056-F067.
import { getPatientById, getVisitById } from './clinic-core.mjs';

export const prescriptionFeatureCoverage = [
  { range: 'F056-F058', area: 'Medication Catalog & Dose', description: 'ATCvet-style catalog metadata, mg/kg default dosing and weight-based calculation.' },
  { range: 'F059-F063', area: 'Safety & Controlled Drugs', description: 'Interaction and contraindication alert placeholders, controlled substance logging and e-prescription readiness.' },
  { range: 'F064-F067', area: 'PDF, Refill & Compliance', description: 'Printable prescription readiness, refill reminders and compliance tracking.' }
];

function collection(state, key) {
  return Array.isArray(state?.[key]) ? state[key] : [];
}

export function calculateDoseMg(weightKg, doseMgPerKg) {
  const weight = Number(weightKg || 0);
  const dose = Number(doseMgPerKg || 0);
  return Math.round(weight * dose * 100) / 100;
}

export function prescriptionStatus(prescription) {
  if (prescription.controlledSubstance && !prescription.signedAt) return 'controlled-review';
  if (prescription.signedAt) return 'signed';
  return 'draft';
}

export function listPrescriptions(state) {
  return collection(state, 'prescriptions').map((prescription) => ({
    ...prescription,
    status: prescriptionStatus(prescription),
    patient: getPatientById(state, prescription.patientId),
    visit: getVisitById(state, prescription.visitId)
  })).sort((a, b) => String(b.signedAt || b.id).localeCompare(String(a.signedAt || a.id)));
}

export function getPrescriptionSummary(state) {
  const prescriptions = listPrescriptions(state);
  const controlled = prescriptions.filter((prescription) => prescription.controlledSubstance);
  const unsignedControlled = controlled.filter((prescription) => prescription.status === 'controlled-review');
  const refillReminders = prescriptions.filter((prescription) => Boolean(prescription.refillDueAt));

  return {
    featureCoverage: prescriptionFeatureCoverage,
    counts: {
      prescriptions: prescriptions.length,
      controlled: controlled.length,
      unsignedControlled: unsignedControlled.length,
      refillReminders: refillReminders.length
    },
    controlledAlerts: unsignedControlled,
    refillReminders,
    nextBuildTargets: ['Drug interaction engine', 'Breed contraindication rules', 'Printable prescription PDF']
  };
}
