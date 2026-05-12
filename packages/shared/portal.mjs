// P4 Portal & Telemedicine coverage: F237-F261.
import { getOwnerById, getPatientById } from "./clinic-core.mjs";

export const portalFeatureCoverage = [
  {
    range: "F237-F245",
    area: "Portal Access",
    description:
      "Magic link and OTP login, invites, multi-pet and multi-clinic owner access patterns.",
  },
  {
    range: "F246-F255",
    area: "Owner Portal",
    description:
      "Booking, documents, invoices, subscriptions, health timeline, reminders and async uploads.",
  },
  {
    range: "F256-F261",
    area: "Telemedicine",
    description:
      "Video booking, async consults, AI triage placeholders, group calls and recording consent states.",
  },
];

function collection(state, key) {
  return Array.isArray(state?.[key]) ? state[key] : [];
}

export function portalAccountRiskStatus(record) {
  if (record.inviteStatus !== "accepted") return "invite-pending";
  if (Number(record.unreadMessages || 0) > 0) return "unread";
  if (!record.paymentCardsOnFile) return "payment-setup";
  return "active";
}

export function telemedicineRiskStatus(record) {
  if (record.bookingStatus === "needs-response") return "needs-response";
  if (record.aiTriageStatus === "queued") return "triage-queued";
  if (record.sessionType === "video-call" && !record.recordingConsent)
    return "consent-check";
  return "scheduled";
}

export function asyncConsultRiskStatus(record) {
  if (record.status === "awaiting-clinician") return "awaiting-clinician";
  if (record.photoCount > 0 && record.status !== "closed") return "open-media";
  return "closed";
}

export function listPortalAccounts(state) {
  return collection(state, "portalAccounts")
    .map((record) => ({
      ...record,
      owner: getOwnerById(state, record.ownerId),
      riskStatus: portalAccountRiskStatus(record),
      patients: collection(state, "patients").filter((patient) =>
        collection(patient, "ownerIds").includes(record.ownerId),
      ),
    }))
    .sort((a, b) =>
      String(a.owner?.displayName || "").localeCompare(
        String(b.owner?.displayName || ""),
      ),
    );
}

export function listPortalDocuments(state) {
  return collection(state, "portalDocuments")
    .map((record) => ({
      ...record,
      patient: getPatientById(state, record.patientId),
      owner: getOwnerById(state, record.ownerId),
    }))
    .sort((a, b) => String(b.uploadedAt).localeCompare(String(a.uploadedAt)));
}

export function listTelemedicineSessions(state) {
  return collection(state, "telemedicineSessions")
    .map((record) => ({
      ...record,
      patient: getPatientById(state, record.patientId),
      owner: getOwnerById(state, record.ownerId),
      riskStatus: telemedicineRiskStatus(record),
    }))
    .sort((a, b) => String(a.startsAt).localeCompare(String(b.startsAt)));
}

export function listAsyncConsults(state) {
  return collection(state, "asyncConsults")
    .map((record) => ({
      ...record,
      patient: getPatientById(state, record.patientId),
      owner: getOwnerById(state, record.ownerId),
      riskStatus: asyncConsultRiskStatus(record),
    }))
    .sort((a, b) => String(b.status).localeCompare(String(a.status)));
}

export function getPortalSummary(state) {
  const accounts = listPortalAccounts(state);
  const documents = listPortalDocuments(state);
  const telemedicineSessions = listTelemedicineSessions(state);
  const asyncConsults = listAsyncConsults(state);
  const alerts = [
    ...accounts.filter((record) =>
      ["invite-pending", "unread", "payment-setup"].includes(record.riskStatus),
    ),
    ...telemedicineSessions.filter((record) =>
      ["needs-response", "triage-queued", "consent-check"].includes(
        record.riskStatus,
      ),
    ),
    ...asyncConsults.filter((record) =>
      ["awaiting-clinician", "open-media"].includes(record.riskStatus),
    ),
  ];

  return {
    featureCoverage: portalFeatureCoverage,
    counts: {
      accounts: accounts.length,
      documents: documents.length,
      telemedicine: telemedicineSessions.length,
      asyncConsults: asyncConsults.length,
      sharedDocuments: documents.filter((record) => record.sharedInPortal)
        .length,
      activePortalOwners: accounts.filter(
        (record) => record.riskStatus === "active",
      ).length,
    },
    alerts,
    nextBuildTargets: [
      "Owner-facing portal shell",
      "Live video and async media delivery",
      "Payments, bookings and reminders in a dedicated owner experience",
    ],
  };
}
