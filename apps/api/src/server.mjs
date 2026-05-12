import http from "node:http";
import { vetCoreBlueprint } from "../../../packages/shared/vetcore-blueprint.mjs";
import {
  getClinicCoreSummary,
  listOwners,
  listPatients,
  listVisits,
} from "../../../packages/shared/clinic-core.mjs";
import {
  getDiagnosticSummary,
  listDiagnostics,
} from "../../../packages/shared/diagnostics.mjs";
import {
  getFinanceSummary,
  listInsuranceClaims,
  listInvoices,
  listPayments,
  listWellnessPlans,
} from "../../../packages/shared/finance.mjs";
import {
  getHospitalizationSummary,
  listHospitalizations,
} from "../../../packages/shared/hospitalizations.mjs";
import {
  getInventorySummary,
  listControlledLog,
  listInventoryItems,
  listPurchaseOrders,
} from "../../../packages/shared/inventory.mjs";
import { getLabSummary, listLabs } from "../../../packages/shared/labs.mjs";
import {
  getOperationsSummary,
  listAppointments,
  listClientMessages,
  listStaffRoster,
} from "../../../packages/shared/operations.mjs";
import {
  getPrescriptionSummary,
  listPrescriptions,
} from "../../../packages/shared/prescriptions.mjs";
import {
  getPortalSummary,
  listAsyncConsults,
  listPortalAccounts,
  listPortalDocuments,
  listTelemedicineSessions,
} from "../../../packages/shared/portal.mjs";
import {
  getSpecialtySummary,
  listSpecialties,
} from "../../../packages/shared/specialties.mjs";
import {
  getSurgerySummary,
  listSurgeries,
} from "../../../packages/shared/surgeries.mjs";
import {
  getVaccinationSummary,
  listVaccinations,
} from "../../../packages/shared/vaccinations.mjs";
import {
  createDiagnostic,
  createInvoice,
  createInsuranceClaim,
  createHospitalization,
  createInventoryItem,
  createLab,
  createAppointment,
  createClientMessage,
  createOwner,
  createPatient,
  createPayment,
  createPortalAccount,
  createPortalDocument,
  createPurchaseOrder,
  createPrescription,
  createSurgery,
  createSpecialty,
  createTelemedicineSession,
  createVaccination,
  createVisit,
  createWellnessPlan,
  createAsyncConsult,
  readClinicState,
  updateDiagnostic,
  updateInvoice,
  updateInsuranceClaim,
  updateHospitalization,
  updateInventoryItem,
  updateLab,
  updateAppointment,
  updateClientMessage,
  updateOwner,
  updatePayment,
  updatePortalAccount,
  updatePortalDocument,
  updatePatient,
  updatePurchaseOrder,
  updatePrescription,
  updateSurgery,
  updateSpecialty,
  updateTelemedicineSession,
  updateVaccination,
  updateVisit,
  updateWellnessPlan,
  updateAsyncConsult,
} from "./clinic-repository.mjs";

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  response.end(JSON.stringify(payload, null, 2));
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function matchId(pathname, prefix) {
  if (!pathname.startsWith(`${prefix}/`)) return null;
  const id = pathname.slice(prefix.length + 1);
  return id && !id.includes("/") ? id : null;
}

async function sendClinicPayload(response, mapper) {
  const state = await readClinicState();
  sendJson(response, 200, mapper(state));
}

export function createVetCoreApiServer() {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);

    try {
      if (request.method === "OPTIONS") {
        sendJson(response, 204, {});
        return;
      }

      if (request.method === "GET" && url.pathname === "/health") {
        sendJson(response, 200, {
          status: "ok",
          product: vetCoreBlueprint.product,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (request.method === "GET" && url.pathname === "/blueprint") {
        sendJson(response, 200, vetCoreBlueprint);
        return;
      }

      if (request.method === "GET" && url.pathname === "/clinic/summary") {
        await sendClinicPayload(response, (state) =>
          getClinicCoreSummary(state),
        );
        return;
      }

      if (request.method === "GET" && url.pathname === "/clinic/owners") {
        await sendClinicPayload(response, (state) => ({
          items: listOwners(state),
        }));
        return;
      }

      if (request.method === "GET" && url.pathname === "/clinic/patients") {
        await sendClinicPayload(response, (state) => ({
          items: listPatients(state),
        }));
        return;
      }

      if (request.method === "GET" && url.pathname === "/clinic/visits") {
        await sendClinicPayload(response, (state) => ({
          items: listVisits(state),
        }));
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/clinic/vaccinations/summary"
      ) {
        await sendClinicPayload(response, (state) =>
          getVaccinationSummary(state),
        );
        return;
      }

      if (request.method === "GET" && url.pathname === "/clinic/vaccinations") {
        await sendClinicPayload(response, (state) => ({
          items: listVaccinations(state),
        }));
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/clinic/prescriptions/summary"
      ) {
        await sendClinicPayload(response, (state) =>
          getPrescriptionSummary(state),
        );
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/clinic/prescriptions"
      ) {
        await sendClinicPayload(response, (state) => ({
          items: listPrescriptions(state),
        }));
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/clinic/surgeries/summary"
      ) {
        await sendClinicPayload(response, (state) => getSurgerySummary(state));
        return;
      }

      if (request.method === "GET" && url.pathname === "/clinic/surgeries") {
        await sendClinicPayload(response, (state) => ({
          items: listSurgeries(state),
        }));
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/clinic/hospitalizations/summary"
      ) {
        await sendClinicPayload(response, (state) =>
          getHospitalizationSummary(state),
        );
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/clinic/hospitalizations"
      ) {
        await sendClinicPayload(response, (state) => ({
          items: listHospitalizations(state),
        }));
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/clinic/diagnostics/summary"
      ) {
        await sendClinicPayload(response, (state) =>
          getDiagnosticSummary(state),
        );
        return;
      }

      if (request.method === "GET" && url.pathname === "/clinic/diagnostics") {
        await sendClinicPayload(response, (state) => ({
          items: listDiagnostics(state),
        }));
        return;
      }

      if (request.method === "GET" && url.pathname === "/clinic/labs/summary") {
        await sendClinicPayload(response, (state) => getLabSummary(state));
        return;
      }

      if (request.method === "GET" && url.pathname === "/clinic/labs") {
        await sendClinicPayload(response, (state) => ({
          items: listLabs(state),
        }));
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/clinic/portal/summary"
      ) {
        await sendClinicPayload(response, (state) => getPortalSummary(state));
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/clinic/portal-accounts"
      ) {
        await sendClinicPayload(response, (state) => ({
          items: listPortalAccounts(state),
        }));
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/clinic/portal-documents"
      ) {
        await sendClinicPayload(response, (state) => ({
          items: listPortalDocuments(state),
        }));
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/clinic/telemedicine-sessions"
      ) {
        await sendClinicPayload(response, (state) => ({
          items: listTelemedicineSessions(state),
        }));
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/clinic/async-consults"
      ) {
        await sendClinicPayload(response, (state) => ({
          items: listAsyncConsults(state),
        }));
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/clinic/finance/summary"
      ) {
        await sendClinicPayload(response, (state) => getFinanceSummary(state));
        return;
      }

      if (request.method === "GET" && url.pathname === "/clinic/invoices") {
        await sendClinicPayload(response, (state) => ({
          items: listInvoices(state),
        }));
        return;
      }

      if (request.method === "GET" && url.pathname === "/clinic/payments") {
        await sendClinicPayload(response, (state) => ({
          items: listPayments(state),
        }));
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/clinic/insurance-claims"
      ) {
        await sendClinicPayload(response, (state) => ({
          items: listInsuranceClaims(state),
        }));
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/clinic/wellness-plans"
      ) {
        await sendClinicPayload(response, (state) => ({
          items: listWellnessPlans(state),
        }));
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/clinic/inventory/summary"
      ) {
        await sendClinicPayload(response, (state) =>
          getInventorySummary(state),
        );
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/clinic/inventory-items"
      ) {
        await sendClinicPayload(response, (state) => ({
          items: listInventoryItems(state),
        }));
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/clinic/purchase-orders"
      ) {
        await sendClinicPayload(response, (state) => ({
          items: listPurchaseOrders(state),
        }));
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/clinic/controlled-log"
      ) {
        await sendClinicPayload(response, (state) => ({
          items: listControlledLog(state),
        }));
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/clinic/operations/summary"
      ) {
        await sendClinicPayload(response, (state) =>
          getOperationsSummary(state),
        );
        return;
      }

      if (request.method === "GET" && url.pathname === "/clinic/appointments") {
        await sendClinicPayload(response, (state) => ({
          items: listAppointments(state),
        }));
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/clinic/client-messages"
      ) {
        await sendClinicPayload(response, (state) => ({
          items: listClientMessages(state),
        }));
        return;
      }

      if (request.method === "GET" && url.pathname === "/clinic/staff") {
        await sendClinicPayload(response, (state) => ({
          items: listStaffRoster(state),
        }));
        return;
      }

      if (
        request.method === "GET" &&
        url.pathname === "/clinic/specialties/summary"
      ) {
        await sendClinicPayload(response, (state) =>
          getSpecialtySummary(state),
        );
        return;
      }

      if (request.method === "GET" && url.pathname === "/clinic/specialties") {
        await sendClinicPayload(response, (state) => ({
          items: listSpecialties(state),
        }));
        return;
      }

      if (request.method === "GET" && url.pathname === "/clinic/audit") {
        await sendClinicPayload(response, (state) => ({
          items: [...state.auditEvents]
            .sort((a, b) => String(b.at).localeCompare(String(a.at)))
            .slice(0, 100),
        }));
        return;
      }

      if (request.method === "POST" && url.pathname === "/clinic/owners") {
        sendJson(response, 201, await createOwner(await readBody(request)));
        return;
      }

      if (request.method === "POST" && url.pathname === "/clinic/patients") {
        sendJson(response, 201, await createPatient(await readBody(request)));
        return;
      }

      if (request.method === "POST" && url.pathname === "/clinic/visits") {
        sendJson(response, 201, await createVisit(await readBody(request)));
        return;
      }

      if (
        request.method === "POST" &&
        url.pathname === "/clinic/vaccinations"
      ) {
        sendJson(
          response,
          201,
          await createVaccination(await readBody(request)),
        );
        return;
      }

      if (
        request.method === "POST" &&
        url.pathname === "/clinic/prescriptions"
      ) {
        sendJson(
          response,
          201,
          await createPrescription(await readBody(request)),
        );
        return;
      }

      if (request.method === "POST" && url.pathname === "/clinic/surgeries") {
        sendJson(response, 201, await createSurgery(await readBody(request)));
        return;
      }

      if (
        request.method === "POST" &&
        url.pathname === "/clinic/hospitalizations"
      ) {
        sendJson(
          response,
          201,
          await createHospitalization(await readBody(request)),
        );
        return;
      }

      if (request.method === "POST" && url.pathname === "/clinic/diagnostics") {
        sendJson(
          response,
          201,
          await createDiagnostic(await readBody(request)),
        );
        return;
      }

      if (request.method === "POST" && url.pathname === "/clinic/labs") {
        sendJson(response, 201, await createLab(await readBody(request)));
        return;
      }

      if (
        request.method === "POST" &&
        url.pathname === "/clinic/portal-accounts"
      ) {
        sendJson(
          response,
          201,
          await createPortalAccount(await readBody(request)),
        );
        return;
      }

      if (
        request.method === "POST" &&
        url.pathname === "/clinic/portal-documents"
      ) {
        sendJson(
          response,
          201,
          await createPortalDocument(await readBody(request)),
        );
        return;
      }

      if (
        request.method === "POST" &&
        url.pathname === "/clinic/telemedicine-sessions"
      ) {
        sendJson(
          response,
          201,
          await createTelemedicineSession(await readBody(request)),
        );
        return;
      }

      if (
        request.method === "POST" &&
        url.pathname === "/clinic/async-consults"
      ) {
        sendJson(
          response,
          201,
          await createAsyncConsult(await readBody(request)),
        );
        return;
      }

      if (request.method === "POST" && url.pathname === "/clinic/invoices") {
        sendJson(response, 201, await createInvoice(await readBody(request)));
        return;
      }

      if (request.method === "POST" && url.pathname === "/clinic/payments") {
        sendJson(response, 201, await createPayment(await readBody(request)));
        return;
      }

      if (
        request.method === "POST" &&
        url.pathname === "/clinic/insurance-claims"
      ) {
        sendJson(
          response,
          201,
          await createInsuranceClaim(await readBody(request)),
        );
        return;
      }

      if (
        request.method === "POST" &&
        url.pathname === "/clinic/wellness-plans"
      ) {
        sendJson(
          response,
          201,
          await createWellnessPlan(await readBody(request)),
        );
        return;
      }

      if (
        request.method === "POST" &&
        url.pathname === "/clinic/inventory-items"
      ) {
        sendJson(
          response,
          201,
          await createInventoryItem(await readBody(request)),
        );
        return;
      }

      if (
        request.method === "POST" &&
        url.pathname === "/clinic/purchase-orders"
      ) {
        sendJson(
          response,
          201,
          await createPurchaseOrder(await readBody(request)),
        );
        return;
      }

      if (
        request.method === "POST" &&
        url.pathname === "/clinic/appointments"
      ) {
        sendJson(
          response,
          201,
          await createAppointment(await readBody(request)),
        );
        return;
      }

      if (
        request.method === "POST" &&
        url.pathname === "/clinic/client-messages"
      ) {
        sendJson(
          response,
          201,
          await createClientMessage(await readBody(request)),
        );
        return;
      }

      if (request.method === "POST" && url.pathname === "/clinic/specialties") {
        sendJson(response, 201, await createSpecialty(await readBody(request)));
        return;
      }

      const ownerId = matchId(url.pathname, "/clinic/owners");
      if (request.method === "PATCH" && ownerId) {
        const owner = await updateOwner(ownerId, await readBody(request));
        sendJson(
          response,
          owner ? 200 : 404,
          owner || { error: "Owner not found" },
        );
        return;
      }

      const patientId = matchId(url.pathname, "/clinic/patients");
      if (request.method === "PATCH" && patientId) {
        const patient = await updatePatient(patientId, await readBody(request));
        sendJson(
          response,
          patient ? 200 : 404,
          patient || { error: "Patient not found" },
        );
        return;
      }

      const visitId = matchId(url.pathname, "/clinic/visits");
      if (request.method === "PATCH" && visitId) {
        const visit = await updateVisit(visitId, await readBody(request));
        sendJson(
          response,
          visit ? 200 : 404,
          visit || { error: "Visit not found" },
        );
        return;
      }

      const vaccinationId = matchId(url.pathname, "/clinic/vaccinations");
      if (request.method === "PATCH" && vaccinationId) {
        const vaccination = await updateVaccination(
          vaccinationId,
          await readBody(request),
        );
        sendJson(
          response,
          vaccination ? 200 : 404,
          vaccination || { error: "Vaccination not found" },
        );
        return;
      }

      const prescriptionId = matchId(url.pathname, "/clinic/prescriptions");
      if (request.method === "PATCH" && prescriptionId) {
        const prescription = await updatePrescription(
          prescriptionId,
          await readBody(request),
        );
        sendJson(
          response,
          prescription ? 200 : 404,
          prescription || { error: "Prescription not found" },
        );
        return;
      }

      const surgeryId = matchId(url.pathname, "/clinic/surgeries");
      if (request.method === "PATCH" && surgeryId) {
        const surgery = await updateSurgery(surgeryId, await readBody(request));
        sendJson(
          response,
          surgery ? 200 : 404,
          surgery || { error: "Surgery not found" },
        );
        return;
      }

      const hospitalizationId = matchId(
        url.pathname,
        "/clinic/hospitalizations",
      );
      if (request.method === "PATCH" && hospitalizationId) {
        const stay = await updateHospitalization(
          hospitalizationId,
          await readBody(request),
        );
        sendJson(
          response,
          stay ? 200 : 404,
          stay || { error: "Hospitalization not found" },
        );
        return;
      }

      const diagnosticId = matchId(url.pathname, "/clinic/diagnostics");
      if (request.method === "PATCH" && diagnosticId) {
        const diagnostic = await updateDiagnostic(
          diagnosticId,
          await readBody(request),
        );
        sendJson(
          response,
          diagnostic ? 200 : 404,
          diagnostic || { error: "Diagnostic not found" },
        );
        return;
      }

      const labId = matchId(url.pathname, "/clinic/labs");
      if (request.method === "PATCH" && labId) {
        const lab = await updateLab(labId, await readBody(request));
        sendJson(response, lab ? 200 : 404, lab || { error: "Lab not found" });
        return;
      }

      const portalAccountId = matchId(url.pathname, "/clinic/portal-accounts");
      if (request.method === "PATCH" && portalAccountId) {
        const account = await updatePortalAccount(
          portalAccountId,
          await readBody(request),
        );
        sendJson(
          response,
          account ? 200 : 404,
          account || { error: "Portal account not found" },
        );
        return;
      }

      const portalDocumentId = matchId(
        url.pathname,
        "/clinic/portal-documents",
      );
      if (request.method === "PATCH" && portalDocumentId) {
        const document = await updatePortalDocument(
          portalDocumentId,
          await readBody(request),
        );
        sendJson(
          response,
          document ? 200 : 404,
          document || { error: "Portal document not found" },
        );
        return;
      }

      const telemedicineId = matchId(
        url.pathname,
        "/clinic/telemedicine-sessions",
      );
      if (request.method === "PATCH" && telemedicineId) {
        const session = await updateTelemedicineSession(
          telemedicineId,
          await readBody(request),
        );
        sendJson(
          response,
          session ? 200 : 404,
          session || { error: "Telemedicine session not found" },
        );
        return;
      }

      const asyncConsultId = matchId(url.pathname, "/clinic/async-consults");
      if (request.method === "PATCH" && asyncConsultId) {
        const consult = await updateAsyncConsult(
          asyncConsultId,
          await readBody(request),
        );
        sendJson(
          response,
          consult ? 200 : 404,
          consult || { error: "Async consult not found" },
        );
        return;
      }

      const invoiceId = matchId(url.pathname, "/clinic/invoices");
      if (request.method === "PATCH" && invoiceId) {
        const invoice = await updateInvoice(invoiceId, await readBody(request));
        sendJson(
          response,
          invoice ? 200 : 404,
          invoice || { error: "Invoice not found" },
        );
        return;
      }

      const paymentId = matchId(url.pathname, "/clinic/payments");
      if (request.method === "PATCH" && paymentId) {
        const payment = await updatePayment(paymentId, await readBody(request));
        sendJson(
          response,
          payment ? 200 : 404,
          payment || { error: "Payment not found" },
        );
        return;
      }

      const claimId = matchId(url.pathname, "/clinic/insurance-claims");
      if (request.method === "PATCH" && claimId) {
        const claim = await updateInsuranceClaim(
          claimId,
          await readBody(request),
        );
        sendJson(
          response,
          claim ? 200 : 404,
          claim || { error: "Insurance claim not found" },
        );
        return;
      }

      const planId = matchId(url.pathname, "/clinic/wellness-plans");
      if (request.method === "PATCH" && planId) {
        const plan = await updateWellnessPlan(planId, await readBody(request));
        sendJson(
          response,
          plan ? 200 : 404,
          plan || { error: "Wellness plan not found" },
        );
        return;
      }

      const inventoryItemId = matchId(url.pathname, "/clinic/inventory-items");
      if (request.method === "PATCH" && inventoryItemId) {
        const item = await updateInventoryItem(
          inventoryItemId,
          await readBody(request),
        );
        sendJson(
          response,
          item ? 200 : 404,
          item || { error: "Inventory item not found" },
        );
        return;
      }

      const purchaseOrderId = matchId(url.pathname, "/clinic/purchase-orders");
      if (request.method === "PATCH" && purchaseOrderId) {
        const purchaseOrder = await updatePurchaseOrder(
          purchaseOrderId,
          await readBody(request),
        );
        sendJson(
          response,
          purchaseOrder ? 200 : 404,
          purchaseOrder || { error: "Purchase order not found" },
        );
        return;
      }

      const appointmentId = matchId(url.pathname, "/clinic/appointments");
      if (request.method === "PATCH" && appointmentId) {
        const appointment = await updateAppointment(
          appointmentId,
          await readBody(request),
        );
        sendJson(
          response,
          appointment ? 200 : 404,
          appointment || { error: "Appointment not found" },
        );
        return;
      }

      const messageId = matchId(url.pathname, "/clinic/client-messages");
      if (request.method === "PATCH" && messageId) {
        const message = await updateClientMessage(
          messageId,
          await readBody(request),
        );
        sendJson(
          response,
          message ? 200 : 404,
          message || { error: "Client message not found" },
        );
        return;
      }

      const specialtyId = matchId(url.pathname, "/clinic/specialties");
      if (request.method === "PATCH" && specialtyId) {
        const specialty = await updateSpecialty(
          specialtyId,
          await readBody(request),
        );
        sendJson(
          response,
          specialty ? 200 : 404,
          specialty || { error: "Specialty not found" },
        );
        return;
      }

      sendJson(response, 404, {
        error: "Not found",
        endpoints: [
          "/health",
          "/blueprint",
          "/clinic/summary",
          "/clinic/owners",
          "/clinic/patients",
          "/clinic/visits",
          "/clinic/vaccinations",
          "/clinic/prescriptions",
          "/clinic/surgeries",
          "/clinic/hospitalizations",
          "/clinic/diagnostics",
          "/clinic/labs",
          "/clinic/portal/summary",
          "/clinic/portal-accounts",
          "/clinic/portal-documents",
          "/clinic/telemedicine-sessions",
          "/clinic/async-consults",
          "/clinic/finance/summary",
          "/clinic/invoices",
          "/clinic/payments",
          "/clinic/insurance-claims",
          "/clinic/wellness-plans",
          "/clinic/inventory/summary",
          "/clinic/inventory-items",
          "/clinic/purchase-orders",
          "/clinic/controlled-log",
          "/clinic/operations/summary",
          "/clinic/appointments",
          "/clinic/client-messages",
          "/clinic/staff",
          "/clinic/specialties",
          "/clinic/audit",
        ],
      });
    } catch (error) {
      sendJson(response, 400, { error: error.message || "Bad request" });
    }
  });
}
