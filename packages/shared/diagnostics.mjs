// P2 Diagnostics & imaging coverage: F086-F094.
import { getPatientById, getVisitById } from './clinic-core.mjs';

export const diagnosticFeatureCoverage = [
  { range: 'F086-F088', area: 'Imaging Intake', description: 'X-ray, ultrasound, CT/DICOM records with image annotations.' },
  { range: 'F089-F091', area: 'Clinical Media & PACS', description: 'Clinical photos, video references and external PACS links.' },
  { range: 'F092-F094', area: 'AI & Thumbnails', description: 'Late-phase AI screening placeholders plus compression and thumbnail status.' }
];

function collection(state, key) {
  return Array.isArray(state?.[key]) ? state[key] : [];
}

export function diagnosticRiskStatus(record) {
  if (record.status === 'needs-review') return 'review-needed';
  if (record.thumbnailStatus !== 'generated') return 'thumbnail-pending';
  if (!record.report?.impression) return 'report-open';
  return 'complete';
}

export function listDiagnostics(state) {
  return collection(state, 'diagnostics').map((record) => ({
    ...record,
    patient: getPatientById(state, record.patientId),
    visit: getVisitById(state, record.visitId),
    annotationCount: collection(record, 'annotations').length,
    mediaCount: collection(record, 'clinicalMedia').length,
    aiPending: collection(record, 'aiScreening').filter((screening) => ['queued', 'not-run'].includes(screening.result)).length,
    riskStatus: diagnosticRiskStatus(record)
  })).sort((a, b) => String(b.capturedAt).localeCompare(String(a.capturedAt)));
}

export function getDiagnosticSummary(state) {
  const diagnostics = listDiagnostics(state);
  const alerts = diagnostics.filter((record) => ['review-needed', 'thumbnail-pending', 'report-open'].includes(record.riskStatus));

  return {
    featureCoverage: diagnosticFeatureCoverage,
    counts: {
      diagnostics: diagnostics.length,
      reviewNeeded: diagnostics.filter((record) => record.riskStatus === 'review-needed').length,
      pacsLinked: diagnostics.filter((record) => record.pacsLink).length,
      annotations: diagnostics.reduce((sum, record) => sum + record.annotationCount, 0),
      aiPending: diagnostics.reduce((sum, record) => sum + record.aiPending, 0)
    },
    alerts,
    nextBuildTargets: ['Real binary upload storage', 'DICOM viewer canvas', 'Sharp thumbnail pipeline']
  };
}
