// P3 Operations coverage: F133-F168.
import { getOwnerById, getPatientById, getVisitById } from "./clinic-core.mjs";

export const operationsFeatureCoverage = [
  {
    range: "F133-F150",
    area: "Calendar & Booking",
    description:
      "Multi-vet scheduling, waitlist, walk-in queue, surgery blocks, recurring visits and booking controls.",
  },
  {
    range: "F151-F161",
    area: "Client Communication",
    description:
      "SMS, WhatsApp, email reminders, multilingual templates and follow-up workflows.",
  },
  {
    range: "F162-F168",
    area: "Staff Operations",
    description:
      "Roles, specialties, shifts, working hours, workload tracking and operational equity signals.",
  },
];

function collection(state, key) {
  return Array.isArray(state?.[key]) ? state[key] : [];
}

function asDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function appointmentRiskStatus(record) {
  if (record.status === "waitlist") return "waitlist";
  if (record.status === "no-show") return "no-show";
  if (record.walkIn && record.status !== "completed") return "walk-in";
  if (record.noShowRisk === "high") return "high-risk";
  if (record.surgeryBlock) return "surgery-block";
  if (record.status === "checked-in") return "checked-in";
  return "scheduled";
}

export function messageRiskStatus(record) {
  if (record.status === "draft") return "draft";
  if (record.status === "queued") return "queued";
  if (record.requiresReply && record.status === "sent") return "awaiting-reply";
  return "complete";
}

export function listAppointments(state) {
  return collection(state, "appointments")
    .map((record) => ({
      ...record,
      patient: getPatientById(state, record.patientId),
      owner: getOwnerById(state, record.ownerId),
      visit: getVisitById(state, record.visitId),
      riskStatus: appointmentRiskStatus(record),
    }))
    .sort((a, b) => String(a.startsAt).localeCompare(String(b.startsAt)));
}

export function listClientMessages(state) {
  return collection(state, "clientMessages")
    .map((record) => ({
      ...record,
      patient: getPatientById(state, record.patientId),
      owner: getOwnerById(state, record.ownerId),
      appointment: collection(state, "appointments").find(
        (entry) => entry.id === record.appointmentId,
      ),
      riskStatus: messageRiskStatus(record),
    }))
    .sort((a, b) => String(b.scheduledAt).localeCompare(String(a.scheduledAt)));
}

export function listStaffRoster(state) {
  return collection(state, "staffRoster")
    .map((record) => ({
      ...record,
      capacityState:
        Number(record.workloadScore || 0) >= 80
          ? "loaded"
          : Number(record.workloadScore || 0) >= 60
            ? "busy"
            : "balanced",
    }))
    .sort(
      (a, b) => Number(b.workloadScore || 0) - Number(a.workloadScore || 0),
    );
}

export function getOperationsSummary(state, now = new Date()) {
  const appointments = listAppointments(state);
  const messages = listClientMessages(state);
  const staff = listStaffRoster(state);
  const todayKey = now.toISOString().slice(0, 10);
  const todayAppointments = appointments.filter(
    (record) =>
      asDate(record.startsAt)?.toISOString().slice(0, 10) === todayKey,
  );
  const alerts = [
    ...appointments.filter((record) =>
      ["waitlist", "no-show", "high-risk", "walk-in"].includes(
        record.riskStatus,
      ),
    ),
    ...messages.filter((record) =>
      ["draft", "queued", "awaiting-reply"].includes(record.riskStatus),
    ),
  ];

  return {
    featureCoverage: operationsFeatureCoverage,
    counts: {
      appointments: appointments.length,
      todayAppointments: todayAppointments.length,
      waitlist: appointments.filter((record) => record.status === "waitlist")
        .length,
      walkIns: appointments.filter((record) => record.walkIn).length,
      noShowRisk: appointments.filter((record) => record.noShowRisk === "high")
        .length,
      queuedMessages: messages.filter((record) => record.status === "queued")
        .length,
      staffOnShift: staff.length,
    },
    alerts,
    nextBuildTargets: [
      "Drag-and-drop calendar board",
      "Automated reminder delivery providers",
      "Shift planner with time-off approvals",
    ],
  };
}
