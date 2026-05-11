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
  getHospitalizationSummary,
  listHospitalizations,
} from "../../../packages/shared/hospitalizations.mjs";
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
  createHospitalization,
  createLab,
  createAppointment,
  createClientMessage,
  createOwner,
  createPatient,
  createPrescription,
  createSurgery,
  createSpecialty,
  createVaccination,
  createVisit,
  readClinicState,
  updateDiagnostic,
  updateHospitalization,
  updateLab,
  updateAppointment,
  updateClientMessage,
  updateOwner,
  updatePatient,
  updatePrescription,
  updateSurgery,
  updateSpecialty,
  updateVaccination,
  updateVisit,
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
