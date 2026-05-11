// P3 Finance coverage: F192-F236.
import { getOwnerById, getPatientById, getVisitById } from "./clinic-core.mjs";

export const financeFeatureCoverage = [
  {
    range: "F192-F206",
    area: "Billing",
    description:
      "Estimates, invoices, multi-currency, VAT, discounts, bundles, e-invoicing placeholders and refunds.",
  },
  {
    range: "F207-F222",
    area: "Payments & Receivables",
    description:
      "Payment providers, manual capture, split payments, plans, aging signals and debt workflow indicators.",
  },
  {
    range: "F223-F236",
    area: "Insurance & Wellness Plans",
    description:
      "Claims, pre-authorization, direct settlement and recurring wellness subscription programs.",
  },
];

function collection(state, key) {
  return Array.isArray(state?.[key]) ? state[key] : [];
}

function lineTotalCents(line) {
  return Number(line.quantity || 0) * Number(line.unitPriceCents || 0);
}

function invoiceSubtotalCents(record) {
  return collection(record, "lineItems").reduce(
    (sum, line) => sum + lineTotalCents(line),
    0,
  );
}

function discountCents(record) {
  const subtotal = invoiceSubtotalCents(record);
  if (record.discountType === "percent") {
    return Math.round(subtotal * (Number(record.discountValue || 0) / 100));
  }
  return Number(record.discountValue || 0);
}

function vatCents(record) {
  const taxable = Math.max(
    0,
    invoiceSubtotalCents(record) - discountCents(record),
  );
  return Math.round(taxable * (Number(record.vatRate || 0) / 100));
}

function invoiceTotalCents(record) {
  return Math.max(
    0,
    invoiceSubtotalCents(record) - discountCents(record) + vatCents(record),
  );
}

export function invoiceRiskStatus(record) {
  if (record.invoiceType === "estimate" && record.status !== "approved")
    return "approval";
  if (record.paymentStatus === "overdue") return "overdue";
  if (record.paymentStatus === "partial") return "partial";
  if (collection(record, "creditNotes").length) return "credit-note";
  return record.status === "issued" ? "issued" : "draft";
}

export function paymentRiskStatus(record) {
  if (record.installmentPlan) return "plan";
  if (record.status !== "captured") return "pending";
  if (Number(record.splitCount || 1) > 1) return "split";
  return "captured";
}

export function claimRiskStatus(record) {
  if (record.status === "needs-info") return "needs-info";
  if (record.preAuthorization && record.status !== "approved")
    return "pre-auth";
  if (record.directSettlement) return "direct-settlement";
  return "submitted";
}

export function planRiskStatus(record) {
  if (record.pauseRequested) return "pause-requested";
  if (record.status === "paused") return "paused";
  if (!record.autoBilling) return "manual-billing";
  if (
    Number(record.redemptionUsed || 0) >= Number(record.redemptionTotal || 0)
  ) {
    return "redeemed";
  }
  return "active";
}

export function listInvoices(state) {
  return collection(state, "invoices")
    .map((record) => ({
      ...record,
      patient: getPatientById(state, record.patientId),
      owner: getOwnerById(state, record.ownerId),
      visit: getVisitById(state, record.visitId),
      subtotalCents: invoiceSubtotalCents(record),
      discountCents: discountCents(record),
      vatCents: vatCents(record),
      totalCents: invoiceTotalCents(record),
      riskStatus: invoiceRiskStatus(record),
    }))
    .sort((a, b) => String(b.issueDate).localeCompare(String(a.issueDate)));
}

export function listPayments(state) {
  return collection(state, "payments")
    .map((record) => ({
      ...record,
      patient: getPatientById(state, record.patientId),
      owner: getOwnerById(state, record.ownerId),
      invoice: collection(state, "invoices").find(
        (entry) => entry.id === record.invoiceId,
      ),
      riskStatus: paymentRiskStatus(record),
    }))
    .sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)));
}

export function listInsuranceClaims(state) {
  return collection(state, "insuranceClaims")
    .map((record) => ({
      ...record,
      patient: getPatientById(state, record.patientId),
      owner: getOwnerById(state, record.ownerId),
      visit: getVisitById(state, record.visitId),
      riskStatus: claimRiskStatus(record),
    }))
    .sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));
}

export function listWellnessPlans(state) {
  return collection(state, "wellnessPlans")
    .map((record) => ({
      ...record,
      patient: getPatientById(state, record.patientId),
      owner: getOwnerById(state, record.ownerId),
      remainingRedemptions: Math.max(
        0,
        Number(record.redemptionTotal || 0) -
          Number(record.redemptionUsed || 0),
      ),
      riskStatus: planRiskStatus(record),
    }))
    .sort((a, b) =>
      String(a.nextBillingDate).localeCompare(String(b.nextBillingDate)),
    );
}

export function getFinanceSummary(state) {
  const invoices = listInvoices(state);
  const payments = listPayments(state);
  const claims = listInsuranceClaims(state);
  const plans = listWellnessPlans(state);
  const alerts = [
    ...invoices.filter((record) =>
      ["approval", "overdue", "partial", "credit-note"].includes(
        record.riskStatus,
      ),
    ),
    ...payments.filter((record) =>
      ["plan", "pending", "split"].includes(record.riskStatus),
    ),
    ...claims.filter((record) =>
      ["needs-info", "pre-auth", "direct-settlement"].includes(
        record.riskStatus,
      ),
    ),
    ...plans.filter((record) =>
      ["pause-requested", "paused", "manual-billing"].includes(
        record.riskStatus,
      ),
    ),
  ];

  return {
    featureCoverage: financeFeatureCoverage,
    counts: {
      invoices: invoices.length,
      openReceivables: invoices.filter(
        (record) => record.paymentStatus !== "paid",
      ).length,
      payments: payments.length,
      partialPayments: payments.filter(
        (record) => record.riskStatus === "split",
      ).length,
      claims: claims.length,
      activePlans: plans.filter((record) => record.status === "active").length,
      totalBilledCents: invoices.reduce(
        (sum, record) => sum + Number(record.totalCents || 0),
        0,
      ),
    },
    alerts,
    nextBuildTargets: [
      "Jurisdiction-specific e-invoicing adapters",
      "Aging buckets with collection workflows",
      "Subscription auto-billing and redemption automation",
    ],
  };
}
