// P2 Hospitalization & boarding coverage: F078-F085.
import { getPatientById, getVisitById } from './clinic-core.mjs';

export const hospitalizationFeatureCoverage = [
  { range: 'F078-F080', area: 'Cage & Vitals', description: 'Cage assignment, treatment intervals and real-time vital sign snapshots.' },
  { range: 'F081-F082', area: 'Rounds & Discharge', description: 'Shift notes, handover context and discharge planning workflow.' },
  { range: 'F083-F085', area: 'Boarding & Portal', description: 'Boarding stays, owner-visible live status and photo updates for the client portal.' }
];

function collection(state, key) {
  return Array.isArray(state?.[key]) ? state[key] : [];
}

function openTasks(stay) {
  return collection(stay, 'treatmentSheet').filter((task) => !task.completed);
}

export function stayRiskStatus(stay) {
  if (stay.status === 'discharged') return 'discharged';
  if (openTasks(stay).length > 0) return 'tasks-open';
  if (!stay.dischargePlan?.length) return 'discharge-plan-needed';
  return stay.stayType === 'boarding' ? 'boarding-stable' : 'stable';
}

export function listHospitalizations(state) {
  return collection(state, 'hospitalizations').map((stay) => ({
    ...stay,
    patient: getPatientById(state, stay.patientId),
    visit: getVisitById(state, stay.visitId),
    openTaskCount: openTasks(stay).length,
    latestVitals: collection(stay, 'vitals').at(-1) || null,
    sharedPhotoCount: collection(stay, 'photoUpdates').filter((photo) => photo.sharedToPortal).length,
    riskStatus: stayRiskStatus(stay)
  })).sort((a, b) => String(a.dischargePlannedAt).localeCompare(String(b.dischargePlannedAt)));
}

export function getHospitalizationSummary(state) {
  const stays = listHospitalizations(state);
  const active = stays.filter((stay) => !['discharged', 'cancelled'].includes(stay.status));
  const boarding = stays.filter((stay) => stay.stayType === 'boarding');
  const alerts = stays.filter((stay) => ['tasks-open', 'discharge-plan-needed'].includes(stay.riskStatus));

  return {
    featureCoverage: hospitalizationFeatureCoverage,
    counts: {
      stays: stays.length,
      active: active.length,
      boarding: boarding.length,
      openTasks: stays.reduce((sum, stay) => sum + stay.openTaskCount, 0),
      sharedPhotos: stays.reduce((sum, stay) => sum + stay.sharedPhotoCount, 0)
    },
    alerts,
    nextBuildTargets: ['Drag-and-drop cage board', 'Owner portal live feed', 'Automated treatment task reminders']
  };
}
