// P2 Laboratory coverage: F095-F108.
import { getPatientById, getVisitById } from "./clinic-core.mjs";

export const labFeatureCoverage = [
  {
    range: "F095-F101",
    area: "Lab Intake",
    description:
      "In-house tests, external orders and country/provider routing.",
  },
  {
    range: "F102-F105",
    area: "Results & Ranges",
    description:
      "Parsed results, species reference ranges, trend status and critical value alerts.",
  },
  {
    range: "F106-F108",
    area: "Reports & AI",
    description:
      "PDF parsing placeholder, owner sharing and AI-assisted interpretation.",
  },
];

function collection(state, key) {
  return Array.isArray(state?.[key]) ? state[key] : [];
}

function numericResults(record) {
  return collection(record, "results").filter(
    (result) => typeof result.value === "number" && result.analyte,
  );
}

export function labRiskStatus(record) {
  if (collection(record, "criticalAlerts").length) return "critical";
  if (record.status === "ordered" || record.status === "sent") return "pending";
  if (record.status === "received" && !record.interpretation?.summary)
    return "interpretation-needed";
  if (record.sharedWithOwner) return "shared";
  return "reviewed";
}

export function listLabs(state) {
  return collection(state, "labs")
    .map((record) => ({
      ...record,
      patient: getPatientById(state, record.patientId),
      visit: getVisitById(state, record.visitId),
      resultCount: collection(record, "results").length,
      numericResultCount: numericResults(record).length,
      criticalCount: collection(record, "criticalAlerts").length,
      riskStatus: labRiskStatus(record),
    }))
    .sort((a, b) =>
      String(b.collectedAt || b.orderedAt).localeCompare(
        String(a.collectedAt || a.orderedAt),
      ),
    );
}

export function getLabSummary(state) {
  const labs = listLabs(state);
  const alerts = labs.filter((record) =>
    ["critical", "pending", "interpretation-needed"].includes(
      record.riskStatus,
    ),
  );

  return {
    featureCoverage: labFeatureCoverage,
    counts: {
      labs: labs.length,
      pending: labs.filter((record) => record.riskStatus === "pending").length,
      critical: labs.filter((record) => record.riskStatus === "critical")
        .length,
      shared: labs.filter((record) => record.sharedWithOwner).length,
      externalOrders: labs.filter((record) => record.source === "external")
        .length,
    },
    alerts,
    nextBuildTargets: [
      "Provider API adapters",
      "PDF parsing worker",
      "Longitudinal charting by analyte",
    ],
  };
}
