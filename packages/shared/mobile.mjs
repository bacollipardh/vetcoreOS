// P4 Mobile coverage: F262-F274.
import { getOwnerById, getPatientById, getVisitById } from "./clinic-core.mjs";

export const mobileFeatureCoverage = [
  {
    range: "F262-F266",
    area: "Owner Mobile Access",
    description:
      "Portal functions on mobile, push notifications, camera upload, offline snapshots and NFC microchip lookup.",
  },
  {
    range: "F267-F271",
    area: "Field Vet Workflow",
    description:
      "Field mode, offline sync, quick consultation entry, voice notes and photo capture during visits.",
  },
  {
    range: "F272-F274",
    area: "Mobile Clinical Utilities",
    description:
      "Inventory checks, mobile schedule view and dedicated microchip scan workflows.",
  },
];

function collection(state, key) {
  return Array.isArray(state?.[key]) ? state[key] : [];
}

export function mobileDeviceRiskStatus(record) {
  if (!record.pushEnabled) return "push-disabled";
  if (!record.offlineSnapshotReady) return "offline-stale";
  if (Number(record.pendingNotifications || 0) > 0) return "queue-pending";
  return "active";
}

export function fieldSessionRiskStatus(record) {
  if (record.syncStatus !== "synced") return "sync-pending";
  if (record.inventoryCheckPending) return "inventory-check";
  if (record.status === "in-progress") return "field-active";
  return "stable";
}

export function mobileConsultRiskStatus(record) {
  if (record.status === "draft") return "draft";
  if (record.transcriptionStatus !== "complete") return "transcription-pending";
  if (record.inventoryCheckStatus === "requested") return "inventory-check";
  return "synced";
}

export function mobileScanRiskStatus(record) {
  if (record.status === "manual-review") return "manual-review";
  if (record.status === "queued-sync") return "queued-sync";
  return "matched";
}

export function listMobileDevices(state) {
  return collection(state, "mobileDevices")
    .map((record) => ({
      ...record,
      owner: record.ownerId ? getOwnerById(state, record.ownerId) : null,
      riskStatus: mobileDeviceRiskStatus(record),
    }))
    .sort((a, b) => String(a.mode).localeCompare(String(b.mode)));
}

export function listFieldSessions(state) {
  return collection(state, "fieldSessions")
    .map((record) => ({
      ...record,
      patient: getPatientById(state, record.patientId),
      visit: getVisitById(state, record.visitId),
      device: collection(state, "mobileDevices").find(
        (entry) => entry.id === record.assignedDeviceId,
      ),
      riskStatus: fieldSessionRiskStatus(record),
    }))
    .sort((a, b) =>
      String(b.lastActivityAt).localeCompare(String(a.lastActivityAt)),
    );
}

export function listMobileConsults(state) {
  return collection(state, "mobileConsults")
    .map((record) => ({
      ...record,
      patient: getPatientById(state, record.patientId),
      visit: getVisitById(state, record.visitId),
      riskStatus: mobileConsultRiskStatus(record),
    }))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export function listMobileScans(state) {
  return collection(state, "mobileScans")
    .map((record) => ({
      ...record,
      patient: getPatientById(state, record.patientId),
      device: collection(state, "mobileDevices").find(
        (entry) => entry.id === record.deviceId,
      ),
      riskStatus: mobileScanRiskStatus(record),
    }))
    .sort((a, b) => String(b.scannedAt).localeCompare(String(a.scannedAt)));
}

export function getMobileSummary(state) {
  const devices = listMobileDevices(state);
  const fieldSessions = listFieldSessions(state);
  const consults = listMobileConsults(state);
  const scans = listMobileScans(state);
  const alerts = [
    ...devices.filter((record) => record.riskStatus !== "active"),
    ...fieldSessions.filter((record) => record.riskStatus !== "stable"),
    ...consults.filter((record) => record.riskStatus !== "synced"),
    ...scans.filter((record) => record.riskStatus !== "matched"),
  ];

  return {
    featureCoverage: mobileFeatureCoverage,
    counts: {
      devices: devices.length,
      fieldSessions: fieldSessions.length,
      consults: consults.length,
      scans: scans.length,
      pushReady: devices.filter((record) => record.pushEnabled).length,
      offlineReady: devices.filter((record) => record.offlineSnapshotReady)
        .length,
    },
    alerts,
    nextBuildTargets: [
      "Native push and background sync delivery",
      "True offline merge handling for field visits",
      "Camera, NFC and speech capture with device-grade permissions",
    ],
  };
}
