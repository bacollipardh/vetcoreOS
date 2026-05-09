// P2 Surgery workflow coverage: F068-F077.
import { getPatientById, getVisitById } from './clinic-core.mjs';

export const surgeryFeatureCoverage = [
  { range: 'F068-F069', area: 'Planning & Anesthesia', description: 'Pre-op planning checklist and anesthesia observations.' },
  { range: 'F070-F073', area: 'Intra-op Record', description: 'Drugs given, structured surgery notes and media-ready metadata.' },
  { range: 'F074-F077', area: 'Recovery & Consent', description: 'Discharge instructions, follow-up scheduling, safety checklist, estimate and consent.' }
];

function collection(state, key) {
  return Array.isArray(state?.[key]) ? state[key] : [];
}

export function checklistProgress(surgery) {
  const items = Array.isArray(surgery.preOpChecklist) ? surgery.preOpChecklist : [];
  if (!items.length) return 0;
  return Math.round((items.filter((item) => item.done).length / items.length) * 100);
}

export function surgeryRiskStatus(surgery) {
  if (surgery.consentStatus !== 'signed') return 'consent-needed';
  if (checklistProgress(surgery) < 100) return 'checklist-open';
  if (surgery.recoveryStatus === 'monitoring') return 'recovery-monitoring';
  return 'ready';
}

export function listSurgeries(state) {
  return collection(state, 'surgeries').map((surgery) => ({
    ...surgery,
    patient: getPatientById(state, surgery.patientId),
    visit: getVisitById(state, surgery.visitId),
    checklistProgress: checklistProgress(surgery),
    riskStatus: surgeryRiskStatus(surgery)
  })).sort((a, b) => String(a.scheduledAt).localeCompare(String(b.scheduledAt)));
}

export function getSurgerySummary(state) {
  const surgeries = listSurgeries(state);
  const consentNeeded = surgeries.filter((surgery) => surgery.riskStatus === 'consent-needed');
  const checklistOpen = surgeries.filter((surgery) => surgery.riskStatus === 'checklist-open');
  const recoveryMonitoring = surgeries.filter((surgery) => surgery.riskStatus === 'recovery-monitoring');

  return {
    featureCoverage: surgeryFeatureCoverage,
    counts: {
      surgeries: surgeries.length,
      consentNeeded: consentNeeded.length,
      checklistOpen: checklistOpen.length,
      recoveryMonitoring: recoveryMonitoring.length
    },
    alerts: [...consentNeeded, ...checklistOpen, ...recoveryMonitoring],
    nextBuildTargets: ['Surgical media attachments', 'Anesthesia chart every 5 minutes', 'Discharge PDF templates']
  };
}
