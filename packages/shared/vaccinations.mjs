// P2 Vaccination workflow coverage: F046-F055.
import { getPatientById } from './clinic-core.mjs';

export const vaccinationFeatureCoverage = [
  { range: 'F046-F047', area: 'Protocols', description: 'Species, age and country-aware vaccination protocol metadata.' },
  { range: 'F048-F052', area: 'Administration', description: 'Lot number, manufacturer, expiry, next dose scheduling and passport history.' },
  { range: 'F053-F055', area: 'Alerts & Inventory', description: 'Overdue vaccine alerts and automatic vaccine inventory reduction marker.' }
];

function collection(state, key) {
  return Array.isArray(state?.[key]) ? state[key] : [];
}

export function vaccineStatus(vaccination, today = new Date()) {
  if (!vaccination.nextDueAt) return 'current';
  const due = new Date(`${vaccination.nextDueAt}T00:00:00.000Z`);
  const current = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  return due < current ? 'overdue' : 'current';
}

export function listVaccinations(state) {
  return collection(state, 'vaccinations').map((vaccination) => ({
    ...vaccination,
    status: vaccineStatus(vaccination),
    patient: getPatientById(state, vaccination.patientId)
  })).sort((a, b) => a.nextDueAt.localeCompare(b.nextDueAt));
}

export function getVaccinationSummary(state) {
  const vaccinations = listVaccinations(state);
  const overdue = vaccinations.filter((vaccination) => vaccination.status === 'overdue');
  const inventoryReduced = vaccinations.filter((vaccination) => vaccination.inventoryReduced).length;
  return {
    featureCoverage: vaccinationFeatureCoverage,
    counts: {
      vaccinations: vaccinations.length,
      overdue: overdue.length,
      inventoryReduced
    },
    overdueItems: overdue,
    nextBuildTargets: ['PDF certificate generation', 'Per-country protocol rules', 'Inventory stock ledger integration']
  };
}
