import { rm } from "node:fs/promises";
import { createVetCoreApiServer } from "../apps/api/src/server.mjs";

await rm(new URL("../apps/api/data/clinic-core.json", import.meta.url), {
  force: true,
});

const server = createVetCoreApiServer();
await new Promise((resolve) => server.listen(0, resolve));
const { port } = server.address();

async function request(path, options = {}) {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    ...options,
    headers: { "content-type": "application/json", ...(options.headers || {}) },
  });
  const payload = await response.json();
  if (!response.ok)
    throw new Error(`${path} returned ${response.status}: ${payload.error}`);
  return payload;
}

await request("/health");
await request("/blueprint");
const initialSummary = await request("/clinic/summary");
if (
  initialSummary.counts.patients < 2 ||
  initialSummary.featureCoverage.length !== 3
)
  throw new Error("Unexpected initial clinic summary");

const owner = await request("/clinic/owners", {
  method: "POST",
  body: JSON.stringify({
    displayName: "Test Owner",
    phone: "+38344000000",
    email: "test@example.com",
    city: "Prishtine",
    tags: "test",
  }),
});
if (!owner.id) throw new Error("Owner create failed");

const patient = await request("/clinic/patients", {
  method: "POST",
  body: JSON.stringify({
    name: "Test Pet",
    ownerId: owner.id,
    species: "Dog",
    breed: "Mixed",
    microchip: "999000111222333",
    allergy: "Chicken",
  }),
});
if (!patient.id || patient.ownerIds[0] !== owner.id)
  throw new Error("Patient create failed");

const visit = await request("/clinic/visits", {
  method: "POST",
  body: JSON.stringify({
    patientId: patient.id,
    visitType: "Smoke consultation",
    clinician: "Dr. Smoke",
    anamnesis: "Smoke test anamnesis",
    procedureName: "Consult",
    procedureCost: 12.5,
  }),
});
if (!visit.id || visit.patientId !== patient.id)
  throw new Error("Visit create failed");

const vaccination = await request("/clinic/vaccinations", {
  method: "POST",
  body: JSON.stringify({
    patientId: patient.id,
    vaccineName: "Smoke rabies",
    protocol: "Smoke protocol",
    manufacturer: "SmokeLab",
    lotNumber: "SMOKE-1",
    administeredAt: "2026-05-09",
    nextDueAt: "2027-05-09",
  }),
});
if (
  !vaccination.id ||
  vaccination.patientId !== patient.id ||
  !vaccination.inventoryReduced
)
  throw new Error("Vaccination create failed");

const prescription = await request("/clinic/prescriptions", {
  method: "POST",
  body: JSON.stringify({
    patientId: patient.id,
    visitId: visit.id,
    medicationName: "Smoke med",
    catalogCode: "ATCVET-SMOKE",
    defaultDoseMgPerKg: 0.5,
    patientWeightKg: 12.4,
    route: "PO",
    frequency: "BID",
    durationDays: 5,
    refillDueAt: "2026-05-14",
  }),
});
if (!prescription.id || prescription.calculatedDoseMg <= 0)
  throw new Error("Prescription create failed");

const prescriptionSummary = await request("/clinic/prescriptions/summary");
if (
  prescriptionSummary.counts.prescriptions < 1 ||
  prescriptionSummary.featureCoverage.length !== 3
)
  throw new Error("Prescription summary failed");

const surgery = await request("/clinic/surgeries", {
  method: "POST",
  body: JSON.stringify({
    patientId: patient.id,
    visitId: visit.id,
    procedureName: "Smoke surgery",
    surgeon: "Dr. Smoke",
    estimate: 75,
    consentStatus: "pending",
    checklist: "Fasting confirmed, Consent signed",
  }),
});
if (
  !surgery.id ||
  surgery.patientId !== patient.id ||
  surgery.preOpChecklist.length < 2
)
  throw new Error("Surgery create failed");

const surgerySummary = await request("/clinic/surgeries/summary");
if (
  surgerySummary.counts.surgeries < 1 ||
  surgerySummary.featureCoverage.length !== 3
)
  throw new Error("Surgery summary failed");

const hospitalization = await request("/clinic/hospitalizations", {
  method: "POST",
  body: JSON.stringify({
    patientId: patient.id,
    visitId: visit.id,
    stayType: "hospitalization",
    cage: "Smoke Ward / Cage 1",
    acuity: "routine",
    ownerVisibleStatus: "Smoke stable",
    tasks: "Nursing check, Feeding",
    shiftNote: "Smoke handover",
    photoCaption: "Smoke photo",
  }),
});
if (
  !hospitalization.id ||
  hospitalization.patientId !== patient.id ||
  hospitalization.treatmentSheet.length < 2
)
  throw new Error("Hospitalization create failed");

const hospitalizationSummary = await request(
  "/clinic/hospitalizations/summary",
);
if (
  hospitalizationSummary.counts.stays < 1 ||
  hospitalizationSummary.featureCoverage.length !== 3
)
  throw new Error("Hospitalization summary failed");

const diagnostic = await request("/clinic/diagnostics", {
  method: "POST",
  body: JSON.stringify({
    patientId: patient.id,
    visitId: visit.id,
    modality: "X-ray",
    title: "Smoke imaging",
    fileName: "smoke-study.dcm",
    pacsLink: "pacs://smoke/study",
    annotations: "Smoke annotation",
    impression: "Smoke diagnostic impression",
  }),
});
if (
  !diagnostic.id ||
  diagnostic.patientId !== patient.id ||
  diagnostic.annotations.length < 1
)
  throw new Error("Diagnostic create failed");

const diagnosticSummary = await request("/clinic/diagnostics/summary");
if (
  diagnosticSummary.counts.diagnostics < 1 ||
  diagnosticSummary.featureCoverage.length !== 3
)
  throw new Error("Diagnostic summary failed");

const lab = await request("/clinic/labs", {
  method: "POST",
  body: JSON.stringify({
    patientId: patient.id,
    visitId: visit.id,
    source: "external",
    provider: "Smoke Lab",
    country: "XK",
    testType: "Blood chemistry",
    panelName: "Smoke panel",
    sampleType: "serum",
    status: "ordered",
    analytes: "ALT, Creatinine",
    pdfFileName: "smoke-lab.pdf",
  }),
});
if (!lab.id || lab.patientId !== patient.id || lab.results.length < 2)
  throw new Error("Lab create failed");

const labSummary = await request("/clinic/labs/summary");
if (labSummary.counts.labs < 1 || labSummary.featureCoverage.length !== 3)
  throw new Error("Lab summary failed");

const specialty = await request("/clinic/specialties", {
  method: "POST",
  body: JSON.stringify({
    patientId: patient.id,
    visitId: visit.id,
    specialtyType: "dentistry",
    title: "Smoke dental chart",
    findings: "Calculus grade 1, Gingivitis",
    tasks: "Schedule dental follow-up",
    plan: "Home brushing, Recheck",
    attachmentType: "photo",
    attachmentLabel: "Smoke oral photo",
  }),
});
if (
  !specialty.id ||
  specialty.patientId !== patient.id ||
  specialty.tasks.length < 1
)
  throw new Error("Specialty create failed");

const specialtySummary = await request("/clinic/specialties/summary");
if (
  specialtySummary.counts.records < 1 ||
  specialtySummary.featureCoverage.length !== 3
)
  throw new Error("Specialty summary failed");

const appointment = await request("/clinic/appointments", {
  method: "POST",
  body: JSON.stringify({
    patientId: patient.id,
    visitId: visit.id,
    title: "Smoke follow-up booking",
    appointmentType: "recheck",
    channel: "phone",
    room: "Exam Room 1",
    assignedVet: "Dr. Smoke",
    assignedStaff: "Tech Smoke",
    startsAt: "2026-05-15T09:00:00.000Z",
    endsAt: "2026-05-15T09:20:00.000Z",
    status: "scheduled",
    noShowRisk: "medium",
  }),
});
if (!appointment.id || appointment.patientId !== patient.id)
  throw new Error("Appointment create failed");

const clientMessage = await request("/clinic/client-messages", {
  method: "POST",
  body: JSON.stringify({
    patientId: patient.id,
    appointmentId: appointment.id,
    channel: "SMS",
    template: "visit-reminder",
    language: "sq",
    status: "queued",
    requiresReply: true,
    summary: "Smoke reminder message",
  }),
});
if (!clientMessage.id || clientMessage.patientId !== patient.id)
  throw new Error("Client message create failed");

const operationsSummary = await request("/clinic/operations/summary");
if (
  operationsSummary.counts.appointments < 1 ||
  operationsSummary.featureCoverage.length !== 3
)
  throw new Error("Operations summary failed");

const inventoryItem = await request("/clinic/inventory-items", {
  method: "POST",
  body: JSON.stringify({
    medicationName: "Smoke inventory item",
    atcvetCode: "SMOKE-INV",
    dosageForm: "tablet",
    concentration: "50 mg",
    countryAvailability: "XK,DE",
    restrictions: "prescription-required",
    prescriptionRequired: true,
    controlledSubstance: true,
    warehouseLocation: "Smoke Pharmacy",
    lotNumber: "SMOKE-LOT-1",
    expiresAt: "2026-12-31",
    onHandUnits: 8,
    reorderThreshold: 5,
    supplierName: "Smoke Supplier",
    fifoCost: 14.5,
    avcoCost: 14.0,
  }),
});
if (!inventoryItem.id || !inventoryItem.controlledSubstance)
  throw new Error("Inventory item create failed");

const purchaseOrder = await request("/clinic/purchase-orders", {
  method: "POST",
  body: JSON.stringify({
    supplierName: "Smoke Supplier",
    warehouse: "Smoke Pharmacy",
    medicationName: "Smoke inventory item",
    quantity: 12,
    unitCost: 13.2,
    approvalStatus: "pending",
    receivingStatus: "ordered",
    invoiceMatchStatus: "pending",
    costMethod: "FIFO",
  }),
});
if (!purchaseOrder.id || purchaseOrder.lines.length < 1)
  throw new Error("Purchase order create failed");

const inventorySummary = await request("/clinic/inventory/summary");
if (
  inventorySummary.counts.items < 1 ||
  inventorySummary.featureCoverage.length !== 3
)
  throw new Error("Inventory summary failed");

const invoice = await request("/clinic/invoices", {
  method: "POST",
  body: JSON.stringify({
    patientId: patient.id,
    visitId: visit.id,
    invoiceType: "invoice",
    documentNumber: "SMOKE-INV-001",
    currency: "EUR",
    country: "XK",
    status: "draft",
    paymentStatus: "unpaid",
    issueDate: "2026-05-11",
    dueDate: "2026-05-20",
    vatRate: 18,
    discountType: "percent",
    discountValue: 5,
    description: "Smoke consultation fee",
    quantity: 1,
    unitPrice: 25,
  }),
});
if (!invoice.id || invoice.patientId !== patient.id)
  throw new Error("Invoice create failed");

const payment = await request("/clinic/payments", {
  method: "POST",
  body: JSON.stringify({
    invoiceId: invoice.id,
    method: "cash",
    provider: "Manual",
    status: "pending",
    amount: 10,
    currency: "EUR",
    splitCount: 2,
  }),
});
if (!payment.id || payment.invoiceId !== invoice.id)
  throw new Error("Payment create failed");

const claim = await request("/clinic/insurance-claims", {
  method: "POST",
  body: JSON.stringify({
    patientId: patient.id,
    visitId: visit.id,
    provider: "Smoke Insurance",
    policyNumber: "SMOKE-POL-1",
    claimType: "submission",
    status: "draft",
    autofillFromEmr: true,
    note: "Smoke claim",
  }),
});
if (!claim.id || claim.patientId !== patient.id)
  throw new Error("Insurance claim create failed");

const plan = await request("/clinic/wellness-plans", {
  method: "POST",
  body: JSON.stringify({
    patientId: patient.id,
    planName: "Smoke Wellness",
    programType: "wellness",
    billingProvider: "Manual",
    status: "draft",
    monthlyFee: 15,
    autoBilling: false,
    redemptionUsed: 0,
    redemptionTotal: 4,
  }),
});
if (!plan.id || plan.patientId !== patient.id)
  throw new Error("Wellness plan create failed");

const financeSummary = await request("/clinic/finance/summary");
if (
  financeSummary.counts.invoices < 1 ||
  financeSummary.featureCoverage.length !== 3
)
  throw new Error("Finance summary failed");

const portalAccount = await request("/clinic/portal-accounts", {
  method: "POST",
  body: JSON.stringify({
    ownerId: owner.id,
    loginMethod: "magic-link",
    inviteStatus: "invited",
    preferredLanguage: "sq",
    multiPetEnabled: true,
  }),
});
if (!portalAccount.id || portalAccount.ownerId !== owner.id)
  throw new Error("Portal account create failed");

const portalDocument = await request("/clinic/portal-documents", {
  method: "POST",
  body: JSON.stringify({
    patientId: patient.id,
    category: "invoice",
    title: "Smoke portal document",
    sourceModule: "finance",
    sharedInPortal: false,
  }),
});
if (!portalDocument.id || portalDocument.patientId !== patient.id)
  throw new Error("Portal document create failed");

const telemedicine = await request("/clinic/telemedicine-sessions", {
  method: "POST",
  body: JSON.stringify({
    patientId: patient.id,
    visitId: visit.id,
    sessionType: "video-call",
    platform: "Jitsi",
    bookingStatus: "scheduled",
    clinician: "Dr. Smoke",
  }),
});
if (!telemedicine.id || telemedicine.patientId !== patient.id)
  throw new Error("Telemedicine create failed");

const asyncConsult = await request("/clinic/async-consults", {
  method: "POST",
  body: JSON.stringify({
    patientId: patient.id,
    status: "awaiting-clinician",
    symptomSummary: "Smoke async triage",
    photoCount: 1,
  }),
});
if (!asyncConsult.id || asyncConsult.patientId !== patient.id)
  throw new Error("Async consult create failed");

const portalSummary = await request("/clinic/portal/summary");
if (
  portalSummary.counts.accounts < 1 ||
  portalSummary.featureCoverage.length !== 3
)
  throw new Error("Portal summary failed");

const mobileDevice = await request("/clinic/mobile-devices", {
  method: "POST",
  body: JSON.stringify({
    ownerId: owner.id,
    mode: "owner",
    platform: "iPhone",
    deviceName: "Smoke mobile",
    pushEnabled: true,
    cameraEnabled: true,
  }),
});
if (!mobileDevice.id || mobileDevice.deviceName !== "Smoke mobile")
  throw new Error("Mobile device create failed");

const fieldSession = await request("/clinic/field-sessions", {
  method: "POST",
  body: JSON.stringify({
    patientId: patient.id,
    visitId: visit.id,
    assignedDeviceId: mobileDevice.id,
    sessionType: "field-vet",
    location: "Smoke field round",
    status: "in-progress",
    syncStatus: "pending",
    inventoryCheckPending: true,
  }),
});
if (!fieldSession.id || fieldSession.patientId !== patient.id)
  throw new Error("Field session create failed");

const mobileConsult = await request("/clinic/mobile-consults", {
  method: "POST",
  body: JSON.stringify({
    patientId: patient.id,
    visitId: visit.id,
    source: "field-mode",
    status: "draft",
    quickSummary: "Smoke quick consult",
  }),
});
if (!mobileConsult.id || mobileConsult.patientId !== patient.id)
  throw new Error("Mobile consult create failed");

const mobileScan = await request("/clinic/mobile-scans", {
  method: "POST",
  body: JSON.stringify({
    patientId: patient.id,
    deviceId: mobileDevice.id,
    scanType: "microchip-nfc",
    status: "queued-sync",
    lookupResult: "Smoke lookup pending",
  }),
});
if (!mobileScan.id || mobileScan.patientId !== patient.id)
  throw new Error("Mobile scan create failed");

const mobileSummary = await request("/clinic/mobile/summary");
if (
  mobileSummary.counts.devices < 1 ||
  mobileSummary.featureCoverage.length !== 3
)
  throw new Error("Mobile summary failed");

const currentVaccination = await request(
  `/clinic/vaccinations/${vaccination.id}`,
  {
    method: "PATCH",
    body: JSON.stringify({
      status: "current",
      certificateStatus: "issued",
      inventoryReduced: false,
    }),
  },
);
if (
  currentVaccination.status !== "current" ||
  currentVaccination.certificateStatus !== "issued" ||
  currentVaccination.inventoryReduced
)
  throw new Error("Vaccination workflow action failed");

const updatedOwner = await request(`/clinic/owners/${owner.id}`, {
  method: "PATCH",
  body: JSON.stringify({
    displayName: "Test Owner Updated",
    preferredChannel: "email",
    address: { ...owner.address, city: "Prishtina" },
    tags: ["test", "portal"],
    privateNote: "Smoke owner note",
  }),
});
if (
  updatedOwner.displayName !== "Test Owner Updated" ||
  updatedOwner.address.city !== "Prishtina" ||
  !updatedOwner.tags.includes("portal")
)
  throw new Error("Owner detail update failed");

const updatedPrescription = await request(
  `/clinic/prescriptions/${prescription.id}`,
  {
    method: "PATCH",
    body: JSON.stringify({
      complianceStatus: "owner confirmed",
      durationDays: 7,
      controlledSubstance: true,
      safetyAlerts: ["Controlled substance log required"],
    }),
  },
);
if (
  !updatedPrescription.controlledSubstance ||
  updatedPrescription.durationDays !== 7 ||
  !updatedPrescription.safetyAlerts.includes(
    "Controlled substance log required",
  )
)
  throw new Error("Prescription detail update failed");

const readySurgery = await request(`/clinic/surgeries/${surgery.id}`, {
  method: "PATCH",
  body: JSON.stringify({
    consentStatus: "signed",
    preOpChecklist: surgery.preOpChecklist.map((item) => ({
      ...item,
      done: true,
    })),
    status: "ready",
  }),
});
if (
  readySurgery.consentStatus !== "signed" ||
  !readySurgery.preOpChecklist.every((item) => item.done)
)
  throw new Error("Surgery checklist workflow action failed");

const dischargedStay = await request(
  `/clinic/hospitalizations/${hospitalization.id}`,
  {
    method: "PATCH",
    body: JSON.stringify({
      status: "discharged",
      treatmentSheet: [
        ...hospitalization.treatmentSheet.map((task) => ({
          ...task,
          completed: true,
        })),
        {
          time: new Date().toISOString(),
          task: "Smoke discharge task",
          intervalHours: 0,
          completed: false,
        },
      ],
      vitals: [
        {
          at: new Date().toISOString(),
          temperatureC: 38.1,
          pulseBpm: 90,
          respirationRpm: 24,
          painScore: 1,
        },
      ],
      ownerVisibleStatus: "Patient discharged",
      dischargePlan: ["home meds"],
    }),
  },
);
if (
  dischargedStay.status !== "discharged" ||
  dischargedStay.vitals.length < 1 ||
  !dischargedStay.dischargePlan.includes("home meds")
)
  throw new Error("Hospitalization workflow action failed");

const finalizedDiagnostic = await request(
  `/clinic/diagnostics/${diagnostic.id}`,
  {
    method: "PATCH",
    body: JSON.stringify({
      status: "reported",
      thumbnailStatus: "generated",
      annotations: [
        ...diagnostic.annotations,
        { label: "Smoke follow up", region: "thorax", note: "visible" },
      ],
      report: {
        radiologist: "Dr. Smoke",
        impression: "Smoke finalized report",
        finalizedAt: new Date().toISOString(),
      },
    }),
  },
);
if (
  finalizedDiagnostic.status !== "reported" ||
  finalizedDiagnostic.thumbnailStatus !== "generated" ||
  finalizedDiagnostic.annotations.length < 2
)
  throw new Error("Diagnostic workflow action failed");

const reviewedLab = await request(`/clinic/labs/${lab.id}`, {
  method: "PATCH",
  body: JSON.stringify({
    status: "reviewed",
    parserStatus: "parsed",
    results: [
      ...lab.results,
      {
        analyte: "Potassium",
        value: 6.2,
        unit: "mmol/L",
        referenceLow: 3.5,
        referenceHigh: 5.8,
        flag: "high",
      },
    ],
    criticalAlerts: ["Potassium high"],
    sharedWithOwner: true,
    interpretation: { summary: "Smoke lab reviewed", aiStatus: "reviewed" },
  }),
});
if (
  reviewedLab.status !== "reviewed" ||
  !reviewedLab.sharedWithOwner ||
  reviewedLab.criticalAlerts.length < 1
)
  throw new Error("Lab workflow action failed");

const completedSpecialty = await request(
  `/clinic/specialties/${specialty.id}`,
  {
    method: "PATCH",
    body: JSON.stringify({
      status: "completed",
      tasks: specialty.tasks.map((task) => ({ ...task, done: true })),
      qualityOfLifeScore: 62,
    }),
  },
);
if (
  completedSpecialty.status !== "completed" ||
  !completedSpecialty.tasks.every((task) => task.done)
)
  throw new Error("Specialty workflow action failed");

const confirmedAppointment = await request(
  `/clinic/appointments/${appointment.id}`,
  {
    method: "PATCH",
    body: JSON.stringify({
      status: "confirmed",
      assignedStaff: [...appointment.assignedStaff, "Reception Smoke"],
    }),
  },
);
if (
  confirmedAppointment.status !== "confirmed" ||
  confirmedAppointment.assignedStaff.length < 2
)
  throw new Error("Appointment workflow action failed");

const sentMessage = await request(
  `/clinic/client-messages/${clientMessage.id}`,
  {
    method: "PATCH",
    body: JSON.stringify({
      status: "sent",
      sentAt: new Date().toISOString(),
      translated: true,
    }),
  },
);
if (sentMessage.status !== "sent" || !sentMessage.translated)
  throw new Error("Client message workflow action failed");

const updatedInventory = await request(
  `/clinic/inventory-items/${inventoryItem.id}`,
  {
    method: "PATCH",
    body: JSON.stringify({
      reorderThreshold: 9,
      warehouses: inventoryItem.warehouses.map((warehouse) => ({
        ...warehouse,
        onHandUnits: warehouse.onHandUnits - 2,
      })),
      movements: [
        ...inventoryItem.movements,
        {
          at: new Date().toISOString(),
          type: "dispense",
          units: -2,
          warehouse: inventoryItem.warehouses[0].location,
          reason: "Smoke controlled dispense",
        },
      ],
      controlledEntry: {
        patientId: patient.id,
        action: "dispense",
        units: 2,
        remainingUnits: inventoryItem.warehouses[0].onHandUnits - 2,
        note: "Smoke controlled dispense",
      },
    }),
  },
);
if (
  updatedInventory.reorderThreshold !== 9 ||
  updatedInventory.warehouses[0].onHandUnits !== 6
)
  throw new Error("Inventory workflow action failed");

const updatedPurchaseOrder = await request(
  `/clinic/purchase-orders/${purchaseOrder.id}`,
  {
    method: "PATCH",
    body: JSON.stringify({
      approvalStatus: "approved",
      receivingStatus: "received",
      invoiceMatchStatus: "matched",
      invoiceReference: "SMOKE-INV-1",
      receivedAt: new Date().toISOString(),
    }),
  },
);
if (
  updatedPurchaseOrder.approvalStatus !== "approved" ||
  updatedPurchaseOrder.invoiceMatchStatus !== "matched"
)
  throw new Error("Purchase order workflow action failed");

const updatedInvoice = await request(`/clinic/invoices/${invoice.id}`, {
  method: "PATCH",
  body: JSON.stringify({
    status: "issued",
    paymentStatus: "partial",
    creditNotes: [
      {
        at: new Date().toISOString(),
        reason: "Smoke refund",
        amountCents: 200,
      },
    ],
  }),
});
if (updatedInvoice.status !== "issued" || updatedInvoice.creditNotes.length < 1)
  throw new Error("Invoice workflow action failed");

const updatedPayment = await request(`/clinic/payments/${payment.id}`, {
  method: "PATCH",
  body: JSON.stringify({
    status: "captured",
    reference: "SMOKE-PAY-1",
  }),
});
if (updatedPayment.status !== "captured")
  throw new Error("Payment workflow action failed");

const updatedClaim = await request(`/clinic/insurance-claims/${claim.id}`, {
  method: "PATCH",
  body: JSON.stringify({
    status: "approved",
    approvedAmountCents: 1200,
  }),
});
if (updatedClaim.status !== "approved")
  throw new Error("Insurance claim workflow action failed");

const updatedPlan = await request(`/clinic/wellness-plans/${plan.id}`, {
  method: "PATCH",
  body: JSON.stringify({
    status: "active",
    autoBilling: true,
    pauseRequested: false,
    redemptionUsed: 1,
  }),
});
if (updatedPlan.status !== "active" || updatedPlan.redemptionUsed !== 1)
  throw new Error("Wellness plan workflow action failed");

const updatedPortalAccount = await request(
  `/clinic/portal-accounts/${portalAccount.id}`,
  {
    method: "PATCH",
    body: JSON.stringify({
      inviteStatus: "accepted",
      unreadMessages: 0,
      paymentCardsOnFile: 1,
    }),
  },
);
if (
  updatedPortalAccount.inviteStatus !== "accepted" ||
  updatedPortalAccount.paymentCardsOnFile !== 1
)
  throw new Error("Portal account workflow action failed");

const updatedPortalDocument = await request(
  `/clinic/portal-documents/${portalDocument.id}`,
  {
    method: "PATCH",
    body: JSON.stringify({
      sharedInPortal: true,
      status: "available",
    }),
  },
);
if (
  !updatedPortalDocument.sharedInPortal ||
  updatedPortalDocument.status !== "available"
)
  throw new Error("Portal document workflow action failed");

const updatedTelemedicine = await request(
  `/clinic/telemedicine-sessions/${telemedicine.id}`,
  {
    method: "PATCH",
    body: JSON.stringify({
      bookingStatus: "confirmed",
      aiTriageStatus: "screened",
    }),
  },
);
if (
  updatedTelemedicine.bookingStatus !== "confirmed" ||
  updatedTelemedicine.aiTriageStatus !== "screened"
)
  throw new Error("Telemedicine workflow action failed");

const updatedAsyncConsult = await request(
  `/clinic/async-consults/${asyncConsult.id}`,
  {
    method: "PATCH",
    body: JSON.stringify({
      status: "closed",
      triageRecommendation: "Monitor at home",
    }),
  },
);
if (updatedAsyncConsult.status !== "closed")
  throw new Error("Async consult workflow action failed");

const updatedMobileDevice = await request(
  `/clinic/mobile-devices/${mobileDevice.id}`,
  {
    method: "PATCH",
    body: JSON.stringify({
      pushEnabled: true,
      offlineSnapshotReady: true,
      pendingNotifications: 0,
    }),
  },
);
if (!updatedMobileDevice.offlineSnapshotReady)
  throw new Error("Mobile device workflow action failed");

const updatedFieldSession = await request(
  `/clinic/field-sessions/${fieldSession.id}`,
  {
    method: "PATCH",
    body: JSON.stringify({
      syncStatus: "synced",
      status: "synced",
      inventoryCheckPending: false,
    }),
  },
);
if (updatedFieldSession.syncStatus !== "synced")
  throw new Error("Field session workflow action failed");

const updatedMobileConsult = await request(
  `/clinic/mobile-consults/${mobileConsult.id}`,
  {
    method: "PATCH",
    body: JSON.stringify({
      status: "synced",
      transcriptionStatus: "complete",
    }),
  },
);
if (updatedMobileConsult.status !== "synced")
  throw new Error("Mobile consult workflow action failed");

const updatedMobileScan = await request(
  `/clinic/mobile-scans/${mobileScan.id}`,
  {
    method: "PATCH",
    body: JSON.stringify({
      status: "matched",
      lookupResult: "Smoke lookup matched",
    }),
  },
);
if (updatedMobileScan.status !== "matched")
  throw new Error("Mobile scan workflow action failed");

const updatedVisit = await request(`/clinic/visits/${visit.id}`, {
  method: "PATCH",
  body: JSON.stringify({
    status: "signed",
    signedBy: "Dr. Smoke",
    signedAt: new Date().toISOString(),
  }),
});
if (updatedVisit.status !== "signed") throw new Error("Visit update failed");

const audit = await request("/clinic/audit");
if (
  audit.items.length < 12 ||
  !audit.items.some(
    (event) => event.entityType === "diagnostic" && event.action === "updated",
  ) ||
  !audit.items.some(
    (event) => event.entityType === "lab" && event.action === "updated",
  ) ||
  !audit.items.some(
    (event) => event.entityType === "specialty" && event.action === "updated",
  ) ||
  !audit.items.some(
    (event) => event.entityType === "appointment" && event.action === "updated",
  ) ||
  !audit.items.some(
    (event) => event.entityType === "message" && event.action === "updated",
  ) ||
  !audit.items.some(
    (event) => event.entityType === "inventory" && event.action === "updated",
  ) ||
  !audit.items.some(
    (event) =>
      event.entityType === "purchase-order" && event.action === "updated",
  ) ||
  !audit.items.some(
    (event) => event.entityType === "invoice" && event.action === "updated",
  ) ||
  !audit.items.some(
    (event) => event.entityType === "payment" && event.action === "updated",
  ) ||
  !audit.items.some(
    (event) =>
      event.entityType === "insurance-claim" && event.action === "updated",
  ) ||
  !audit.items.some(
    (event) =>
      event.entityType === "wellness-plan" && event.action === "updated",
  ) ||
  !audit.items.some(
    (event) =>
      event.entityType === "portal-account" && event.action === "updated",
  ) ||
  !audit.items.some(
    (event) =>
      event.entityType === "portal-document" && event.action === "updated",
  ) ||
  !audit.items.some(
    (event) =>
      event.entityType === "telemedicine" && event.action === "updated",
  ) ||
  !audit.items.some(
    (event) =>
      event.entityType === "async-consult" && event.action === "updated",
  ) ||
  !audit.items.some(
    (event) =>
      event.entityType === "mobile-device" && event.action === "updated",
  ) ||
  !audit.items.some(
    (event) =>
      event.entityType === "field-session" && event.action === "updated",
  ) ||
  !audit.items.some(
    (event) =>
      event.entityType === "mobile-consult" && event.action === "updated",
  ) ||
  !audit.items.some(
    (event) => event.entityType === "mobile-scan" && event.action === "updated",
  )
) {
  throw new Error("Audit trail did not capture create/update workflow events");
}

const finalSummary = await request("/clinic/summary");
if (finalSummary.counts.patients !== initialSummary.counts.patients + 1)
  throw new Error("Summary did not update after CRUD operations");

server.close();
await rm(new URL("../apps/api/data/clinic-core.json", import.meta.url), {
  force: true,
});
console.log("API CRUD smoke checks passed.");
