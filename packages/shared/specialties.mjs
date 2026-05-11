// P2 Specialty modules coverage: F109-F132.
import { getPatientById, getVisitById } from "./clinic-core.mjs";

export const specialtyFeatureCoverage = [
  {
    range: "F109-F116",
    area: "Companion Specialty Care",
    description:
      "Dentistry, reproduction, behavior, nutrition and weight management programs.",
  },
  {
    range: "F117-F128",
    area: "Species & Organization Modules",
    description:
      "Equine, livestock, exotic, shelter/rescue and breeder workflows.",
  },
  {
    range: "F129-F132",
    area: "Advanced Records",
    description:
      "End-of-life scoring, hospice planning, necropsy reports and genetic test links.",
  },
];

function collection(state, key) {
  return Array.isArray(state?.[key]) ? state[key] : [];
}

export function specialtyRiskStatus(record) {
  if (
    record.status === "active" &&
    collection(record, "tasks").some((task) => !task.done)
  ) {
    return "tasks-open";
  }
  if (
    record.specialtyType === "end-of-life" &&
    Number(record.qualityOfLifeScore || 0) <= 35
  ) {
    return "qol-review";
  }
  if (record.status === "draft") return "draft";
  if (record.status === "completed") return "completed";
  return "monitoring";
}

export function listSpecialties(state) {
  return collection(state, "specialties")
    .map((record) => ({
      ...record,
      patient: getPatientById(state, record.patientId),
      visit: getVisitById(state, record.visitId),
      taskCount: collection(record, "tasks").length,
      openTaskCount: collection(record, "tasks").filter((task) => !task.done)
        .length,
      attachmentCount: collection(record, "attachments").length,
      riskStatus: specialtyRiskStatus(record),
    }))
    .sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)));
}

export function getSpecialtySummary(state) {
  const records = listSpecialties(state);
  const alerts = records.filter((record) =>
    ["tasks-open", "qol-review", "draft"].includes(record.riskStatus),
  );

  return {
    featureCoverage: specialtyFeatureCoverage,
    counts: {
      records: records.length,
      active: records.filter((record) => record.status === "active").length,
      openTasks: records.reduce((sum, record) => sum + record.openTaskCount, 0),
      endOfLife: records.filter(
        (record) => record.specialtyType === "end-of-life",
      ).length,
      speciesModules: records.filter((record) =>
        ["equine", "livestock", "exotic"].includes(record.specialtyType),
      ).length,
    },
    alerts,
    nextBuildTargets: [
      "Dental chart canvas",
      "Herd/batch treatment execution",
      "Quality-of-life longitudinal scoring",
    ],
  };
}
