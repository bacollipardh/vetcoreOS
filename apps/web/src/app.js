const apiBase = "http://localhost:4100";
const viewTitles = {
  dashboard: "Clinic Dashboard",
  patients: "Patient Records",
  owners: "Owner Records",
  visits: "Visit Timeline",
  vaccinations: "Vaccinations",
  prescriptions: "Prescriptions",
  surgery: "Surgery",
  hospitalizations: "Hospitalization & Boarding",
  diagnostics: "Diagnostics & Imaging",
  audit: "Audit Trail",
  roadmap: "Product Roadmap",
};
let selectedPatientId = null;
let searchQuery = "";
let latestState = {
  blueprint: null,
  summary: null,
  owners: [],
  patients: [],
  visits: [],
  vaccinationSummary: null,
  vaccinations: [],
  prescriptionSummary: null,
  prescriptions: [],
  surgerySummary: null,
  surgeries: [],
  hospitalizationSummary: null,
  hospitalizations: [],
  diagnosticSummary: null,
  diagnostics: [],
  auditEvents: [],
};

async function fetchJson(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: { "content-type": "application/json", ...(options.headers || {}) },
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || `${path} unavailable`);
  return payload;
}
function metric(label, value) {
  return `<article class="metric"><strong>${value}</strong><span>${label}</span></article>`;
}
function setStatus(message, tone = "ok") {
  const status = document.querySelector("#form-status");
  status.textContent = message;
  status.style.background = tone === "error" ? "#be123c" : "#142033";
  if (message)
    window.setTimeout(() => {
      status.textContent = "";
    }, 2800);
}
function searchableText(value) {
  if (value == null) return "";
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  )
    return String(value);
  if (Array.isArray(value)) return value.map(searchableText).join(" ");
  if (typeof value === "object")
    return Object.values(value).map(searchableText).join(" ");
  return "";
}
function matchesSearch(record) {
  return (
    !searchQuery || searchableText(record).toLowerCase().includes(searchQuery)
  );
}
function filtered(items) {
  return items.filter(matchesSearch);
}
function recordCount(items) {
  return searchQuery
    ? `<span class="record-count">${items.length} shown</span>`
    : "";
}
function queueItem(view, title, detail, count, warning = true) {
  return `<article class="queue-item${warning ? " warning" : ""}"><header><div><h3>${title}</h3><p>${detail}</p></div><span class="badge">${count}</span></header><button class="text-button" type="button" data-open-view="${view}">Open</button></article>`;
}
const modalLabels = {
  patient: "New patient",
  owner: "New owner",
  visit: "New visit",
  vaccination: "Record vaccine",
  prescription: "Create prescription",
  surgery: "Plan surgery",
  hospitalization: "Admit patient",
  diagnostic: "Record diagnostic",
};
function openModalPanel(panel) {
  if (!panel) return;
  document
    .querySelectorAll(".modal-panel.open")
    .forEach((item) => item.classList.remove("open"));
  panel.classList.add("open");
  document.body.classList.add("modal-active");
}
function closeModalPanels() {
  document
    .querySelectorAll(".modal-panel.open")
    .forEach((panel) => panel.classList.remove("open"));
  document.body.classList.remove("modal-active");
}
function openFormModal(type) {
  openModalPanel(
    document.querySelector(`[data-modal="${type}-form"]`) ||
      document
        .querySelector(`form[data-form="${type}"]`)
        ?.closest(".modal-panel"),
  );
}
function modalize(panel, title) {
  panel.classList.add("modal-panel");
  if (!panel.querySelector(".modal-titlebar"))
    panel.insertAdjacentHTML(
      "afterbegin",
      `<div class="modal-titlebar"><h2>${title}</h2><button class="modal-close" type="button" data-close-modal>Close</button></div>`,
    );
}
function prepareModalPanels() {
  document.querySelectorAll(".sticky-panel").forEach((panel) => {
    if (!panel.querySelector("form[data-form]")) return;
    if (panel.classList.contains("patient-side-panel")) {
      const form = panel.querySelector('form[data-form="patient"]');
      const formHeader = form?.previousElementSibling;
      const formModal = document.createElement("section");
      formModal.className = "panel modal-panel";
      formModal.dataset.modal = "patient-form";
      formModal.innerHTML =
        '<div class="modal-titlebar"><h2>New patient</h2><button class="modal-close" type="button" data-close-modal>Close</button></div>';
      if (formHeader) formModal.appendChild(formHeader);
      if (form) formModal.appendChild(form);
      document.body.appendChild(formModal);
      const listHeader =
        panel.previousElementSibling?.querySelector(".panel-header");
      if (listHeader && !listHeader.querySelector('[data-open-form="patient"]'))
        listHeader.insertAdjacentHTML(
          "beforeend",
          '<div class="panel-actions"><button class="text-button" type="button" data-open-form="patient">New patient</button></div>',
        );
      modalize(panel, "Patient detail");
      return;
    }
    modalize(
      panel,
      panel.querySelector(".panel-header h2")?.textContent || "Record",
    );
    const firstForm = panel.querySelector("form[data-form]");
    const type = firstForm?.dataset.form;
    const listPanel = panel.previousElementSibling;
    const listHeader = listPanel?.querySelector(".panel-header");
    if (
      type &&
      listHeader &&
      !listHeader.querySelector(`[data-open-form="${type}"]`)
    ) {
      listHeader.insertAdjacentHTML(
        "beforeend",
        `<div class="panel-actions"><button class="text-button" type="button" data-open-form="${type}">${modalLabels[type] || "New record"}</button></div>`,
      );
    }
  });
}
const detailCollections = {
  owner: "owners",
  visit: "visits",
  vaccination: "vaccinations",
  prescription: "prescriptions",
  surgery: "surgeries",
  hospitalization: "hospitalizations",
  diagnostic: "diagnostics",
  audit: "auditEvents",
};
const detailTitles = {
  owner: "Owner detail",
  visit: "Visit detail",
  vaccination: "Vaccination detail",
  prescription: "Prescription detail",
  surgery: "Surgery detail",
  hospitalization: "Hospitalization detail",
  diagnostic: "Diagnostic detail",
  audit: "Audit event",
};
function ensureDetailModal() {
  let panel = document.querySelector('[data-modal="record-detail"]');
  if (!panel) {
    panel = document.createElement("section");
    panel.className = "panel modal-panel";
    panel.dataset.modal = "record-detail";
    panel.innerHTML =
      '<div class="modal-titlebar"><h2>Record detail</h2><button class="modal-close" type="button" data-close-modal>Close</button></div><div id="record-detail-body" class="record-detail-body"></div>';
    document.body.appendChild(panel);
  }
  return panel;
}
function detailValue(value) {
  if (value == null || value === "") return "-";
  if (Array.isArray(value))
    return value.length ? value.map(detailValue).join("<br />") : "-";
  if (typeof value === "object")
    return Object.entries(value)
      .map(([key, entry]) => `<strong>${key}</strong>: ${detailValue(entry)}`)
      .join("<br />");
  return String(value);
}
function money(cents) {
  return `${((cents || 0) / 100).toFixed(2)} EUR`;
}
function detailPair(label, value) {
  return `<div class="detail-pair"><span>${label}</span><strong>${detailValue(value)}</strong></div>`;
}
function detailSection(title, pairs, rows = "") {
  return `<section class="detail-section"><h3>${title}</h3><div class="detail-pair-grid">${pairs.map(([label, value]) => detailPair(label, value)).join("")}</div>${rows}</section>`;
}
function compactList(items, emptyText = "No entries yet.") {
  if (!items?.length) return `<p class="muted">${emptyText}</p>`;
  return `<div class="compact-list">${items.map((item) => `<p>${detailValue(item)}</p>`).join("")}</div>`;
}
function recordDetail(type, record) {
  const patientName = record.patient?.name || "Patient";
  if (type === "owner") {
    return detailSection(
      "Owner profile",
      [
        ["Name", record.displayName],
        ["Phone", record.phone],
        ["Email", record.email],
        ["Channel", record.preferredChannel],
        ["City", record.address?.city],
        ["Balance", money(record.balanceCents)],
      ],
      compactList(record.tags, "No owner tags."),
    );
  }
  if (type === "visit") {
    return [
      detailSection("Clinical summary", [
        ["Patient", patientName],
        ["Visit type", record.visitType],
        ["Status", record.status],
        ["Clinician", record.clinician],
        [
          "Started",
          record.startedAt ? new Date(record.startedAt).toLocaleString() : "-",
        ],
        ["Total", money(record.totalCents)],
      ]),
      detailSection(
        "SOAP and plan",
        [
          ["Anamnesis", record.anamnesis],
          [
            "Temperature",
            record.physicalExam?.temperatureC
              ? `${record.physicalExam.temperatureC} C`
              : "-",
          ],
          [
            "Pulse",
            record.physicalExam?.pulseBpm
              ? `${record.physicalExam.pulseBpm} bpm`
              : "-",
          ],
          [
            "Respiration",
            record.physicalExam?.respirationRpm
              ? `${record.physicalExam.respirationRpm} rpm`
              : "-",
          ],
          ["Diagnosis", record.diagnoses?.map((item) => item.label).join(", ")],
          ["Treatment", record.treatmentPlan?.join(", ")],
        ],
        compactList(record.procedures, "No procedures recorded."),
      ),
    ].join("");
  }
  if (type === "vaccination") {
    return detailSection("Vaccination record", [
      ["Patient", patientName],
      ["Vaccine", record.vaccineName],
      ["Status", record.status],
      ["Protocol", record.protocol],
      ["Manufacturer", record.manufacturer],
      ["Lot", record.lotNumber],
      ["Administered", record.administeredAt],
      ["Next due", record.nextDueAt],
      ["Certificate", record.certificateStatus],
      ["Inventory", record.inventoryReduced ? "Reduced" : "Pending"],
    ]);
  }
  if (type === "prescription") {
    return [
      detailSection("Prescription", [
        ["Patient", patientName],
        ["Medication", record.medicationName],
        ["Status", record.status],
        ["Route", record.route],
        ["Frequency", record.frequency],
        ["Duration", `${record.durationDays || 0} days`],
        ["Calculated dose", `${record.calculatedDoseMg || 0} mg`],
        ["Refill", record.refillDueAt],
      ]),
      detailSection(
        "Safety",
        [
          ["Controlled", record.controlledSubstance ? "Yes" : "No"],
          ["Compliance", record.complianceStatus],
          [
            "Signed",
            record.signedAt
              ? new Date(record.signedAt).toLocaleString()
              : "Not signed",
          ],
        ],
        compactList(record.safetyAlerts, "No safety alerts."),
      ),
    ].join("");
  }
  if (type === "surgery") {
    return [
      detailSection("Surgery board", [
        ["Patient", patientName],
        ["Procedure", record.procedureName],
        ["Status", record.status],
        ["Readiness", record.riskStatus],
        ["Surgeon", record.surgeon],
        [
          "Scheduled",
          record.scheduledAt
            ? new Date(record.scheduledAt).toLocaleString()
            : "-",
        ],
        ["Estimate", money(record.estimateCents)],
        ["Follow-up", record.followUpDueAt],
      ]),
      detailSection(
        "Perioperative tracking",
        [
          ["Consent", record.consentStatus],
          ["Checklist", `${record.checklistProgress || 0}%`],
          ["Recovery", record.recoveryStatus],
          ["Instructions", record.dischargeInstructions],
        ],
        compactList(record.preOpChecklist, "No checklist items."),
      ),
    ].join("");
  }
  if (type === "hospitalization") {
    return [
      detailSection("Stay overview", [
        ["Patient", patientName],
        ["Stay type", record.stayType],
        ["Status", record.status],
        ["Risk", record.riskStatus],
        ["Cage", record.cage],
        ["Acuity", record.acuity],
        [
          "Admitted",
          record.admittedAt
            ? new Date(record.admittedAt).toLocaleString()
            : "-",
        ],
        [
          "Discharge planned",
          record.dischargePlannedAt
            ? new Date(record.dischargePlannedAt).toLocaleString()
            : "-",
        ],
      ]),
      detailSection(
        "Care execution",
        [
          ["Owner status", record.ownerVisibleStatus],
          [
            "Latest vitals",
            record.latestVitals ? detailValue(record.latestVitals) : "-",
          ],
          ["Discharge plan", record.dischargePlan?.join(", ")],
        ],
        compactList(record.treatmentSheet, "No treatment tasks."),
      ),
    ].join("");
  }
  if (type === "diagnostic") {
    return [
      detailSection("Diagnostic worklist", [
        ["Patient", patientName],
        ["Title", record.title],
        ["Modality", record.modality],
        ["Status", record.status],
        ["Risk", record.riskStatus],
        [
          "Captured",
          record.capturedAt
            ? new Date(record.capturedAt).toLocaleString()
            : "-",
        ],
        ["Storage", record.storageType],
        ["Thumbnail", record.thumbnailStatus],
      ]),
      detailSection(
        "Report",
        [
          ["Radiologist", record.report?.radiologist],
          ["Impression", record.report?.impression],
          [
            "Finalized",
            record.report?.finalizedAt
              ? new Date(record.report.finalizedAt).toLocaleString()
              : "-",
          ],
        ],
        compactList(record.annotations, "No annotations."),
      ),
    ].join("");
  }
  return detailSection(
    "Record",
    Object.entries(record).filter(
      ([key]) => !["patient", "owner", "visit"].includes(key),
    ),
  );
}
function ownerInputs(owner) {
  return `<div class="detail-tools"><form class="form-card" data-detail-form="owner-profile" data-id="${owner.id}"><h3>Owner input</h3><label>Name<input name="displayName" value="${owner.displayName || ""}" required /></label><label>Phone<input name="phone" value="${owner.phone || ""}" /></label><label>Email<input name="email" value="${owner.email || ""}" /></label><label>Preferred channel<input name="preferredChannel" value="${owner.preferredChannel || ""}" /></label><label>City<input name="city" value="${owner.address?.city || ""}" /></label><label>Tags<input name="tags" value="${(owner.tags || []).join(", ")}" /></label><label>Private note<textarea name="privateNote">${owner.privateNote || ""}</textarea></label><button type="submit">Save owner info</button></form></div>`;
}
function vaccinationInputs(vaccination) {
  return `<div class="detail-tools"><form class="form-card" data-detail-form="vaccination-update" data-id="${vaccination.id}"><h3>Vaccination input</h3><label>Status<select name="status"><option value="current">current</option><option value="overdue">overdue</option><option value="scheduled">scheduled</option></select></label><label>Next due<input name="nextDueAt" type="date" value="${vaccination.nextDueAt || ""}" /></label><label>Certificate<select name="certificateStatus"><option value="ready-for-pdf">ready-for-pdf</option><option value="needs-review">needs-review</option><option value="issued">issued</option></select></label><label class="checkbox-line"><input name="inventoryReduced" type="checkbox" value="true" ${vaccination.inventoryReduced ? "checked" : ""} /> Inventory reduced</label><button type="submit">Save vaccine info</button></form></div>`;
}
function prescriptionInputs(prescription) {
  return `<div class="detail-tools"><form class="form-card" data-detail-form="prescription-update" data-id="${prescription.id}"><h3>Prescription input</h3><label>Compliance<input name="complianceStatus" value="${prescription.complianceStatus || ""}" /></label><label>Refill due<input name="refillDueAt" type="date" value="${prescription.refillDueAt || ""}" /></label><label>Duration days<input name="durationDays" type="number" value="${prescription.durationDays || 0}" /></label><label class="checkbox-line"><input name="controlledSubstance" type="checkbox" value="true" ${prescription.controlledSubstance ? "checked" : ""} /> Controlled substance</label><button type="submit">Save prescription info</button></form></div>`;
}
function hospitalizationInputs(stay) {
  return `<div class="detail-tools"><form class="form-card" data-detail-form="hospitalization-update" data-id="${stay.id}"><h3>Stay input</h3><label>Status<select name="status"><option value="in-care">in-care</option><option value="boarding">boarding</option><option value="discharged">discharged</option></select></label><label>Owner status<input name="ownerVisibleStatus" value="${stay.ownerVisibleStatus || ""}" /></label><label>Discharge planned<input name="dischargePlannedAt" type="datetime-local" /></label><label>Discharge plan<input name="dischargePlan" value="${(stay.dischargePlan || []).join(", ")}" /></label><button type="submit">Save stay info</button></form><form class="form-card" data-detail-form="hospitalization-vitals" data-id="${stay.id}"><h3>Add vitals</h3><label>Temperature C<input name="temperatureC" type="number" step="0.1" /></label><label>Pulse bpm<input name="pulseBpm" type="number" /></label><label>Respiration rpm<input name="respirationRpm" type="number" /></label><label>Pain score<input name="painScore" type="number" min="0" max="10" /></label><button type="submit">Add vitals</button></form><form class="form-card" data-detail-form="hospitalization-task" data-id="${stay.id}"><h3>Add task</h3><label>Task<input name="task" required /></label><button type="submit">Add task</button></form></div>`;
}
function diagnosticInputs(record) {
  return `<div class="detail-tools"><form class="form-card" data-detail-form="diagnostic-update" data-id="${record.id}"><h3>Diagnostic input</h3><label>Status<select name="status"><option value="needs-review">needs-review</option><option value="reported">reported</option></select></label><label>Thumbnail<select name="thumbnailStatus"><option value="queued">queued</option><option value="generated">generated</option></select></label><label>Radiologist<input name="radiologist" value="${record.report?.radiologist || ""}" /></label><label>Impression<textarea name="impression">${record.report?.impression || ""}</textarea></label><button type="submit">Save diagnostic info</button></form><form class="form-card" data-detail-form="diagnostic-annotation" data-id="${record.id}"><h3>Add annotation</h3><label>Label<input name="label" required /></label><label>Region<input name="region" /></label><label>Note<input name="note" /></label><button type="submit">Add annotation</button></form></div>`;
}
function visitInputs(visit) {
  return `<div class="detail-tools"><form class="form-card" data-detail-form="visit-soap" data-id="${visit.id}"><h3>Clinical input</h3><label>Anamnesis<textarea name="anamnesis">${visit.anamnesis || ""}</textarea></label><label>Temperature C<input name="temperatureC" type="number" step="0.1" value="${visit.physicalExam?.temperatureC || ""}" /></label><label>Pulse bpm<input name="pulseBpm" type="number" value="${visit.physicalExam?.pulseBpm || ""}" /></label><label>Respiration rpm<input name="respirationRpm" type="number" value="${visit.physicalExam?.respirationRpm || ""}" /></label><label>Diagnosis<input name="diagnosis" value="${visit.diagnoses?.[0]?.label || ""}" /></label><label>Treatment plan<input name="treatmentPlan" value="${(visit.treatmentPlan || []).join(", ")}" /></label><button type="submit">Save visit info</button></form><form class="form-card" data-detail-form="visit-procedure" data-id="${visit.id}"><h3>Add procedure</h3><label>Procedure<input name="procedureName" required /></label><label>Cost EUR<input name="procedureCost" type="number" step="0.01" /></label><button type="submit">Add procedure</button></form></div>`;
}
function surgeryInputs(surgery) {
  return `<div class="detail-tools"><form class="form-card" data-detail-form="surgery-update" data-id="${surgery.id}"><h3>Surgery input</h3><label>Status<select name="status"><option value="planned">planned</option><option value="ready">ready</option><option value="in-progress">in-progress</option><option value="recovery">recovery</option><option value="completed">completed</option></select></label><label>Consent<select name="consentStatus"><option value="pending">pending</option><option value="signed">signed</option></select></label><label>Recovery<select name="recoveryStatus"><option value="not-started">not-started</option><option value="monitoring">monitoring</option><option value="cleared">cleared</option></select></label><label>Follow-up due<input name="followUpDueAt" type="date" value="${surgery.followUpDueAt || ""}" /></label><label>Discharge instructions<textarea name="dischargeInstructions">${surgery.dischargeInstructions || ""}</textarea></label><button type="submit">Save surgery info</button></form><form class="form-card" data-detail-form="surgery-anesthesia" data-id="${surgery.id}"><h3>Add anesthesia observation</h3><label>Minute<input name="minute" type="number" required /></label><label>Heart rate<input name="heartRate" type="number" /></label><label>Respiration<input name="respiration" type="number" /></label><label>Temperature C<input name="temperatureC" type="number" step="0.1" /></label><label>Note<input name="note" /></label><button type="submit">Add observation</button></form><form class="form-card" data-detail-form="surgery-drug" data-id="${surgery.id}"><h3>Add drug</h3><label>Drug<input name="name" required /></label><label>Amount<input name="amount" required /></label><label>At minute<input name="atMinute" type="number" /></label><button type="submit">Add drug</button></form></div>`;
}
function openRecordDetail(type, id) {
  const collection = latestState[detailCollections[type]] || [];
  const record = collection.find((entry) => entry.id === id);
  if (!record) return;
  const panel = ensureDetailModal();
  panel.querySelector(".modal-titlebar h2").textContent =
    detailTitles[type] || "Record detail";
  const toolMap = {
    owner: ownerInputs,
    vaccination: vaccinationInputs,
    prescription: prescriptionInputs,
    hospitalization: hospitalizationInputs,
    diagnostic: diagnosticInputs,
    visit: visitInputs,
    surgery: surgeryInputs,
  };
  const tools = toolMap[type] ? toolMap[type](record) : "";
  panel.querySelector("#record-detail-body").innerHTML =
    `${tools}${recordDetail(type, record)}`;
  if (type === "surgery") {
    panel.querySelector('[name="status"]').value = record.status || "planned";
    panel.querySelector('[name="consentStatus"]').value =
      record.consentStatus || "pending";
    panel.querySelector('[name="recoveryStatus"]').value =
      record.recoveryStatus || "not-started";
  }
  if (type === "vaccination") {
    panel.querySelector('[name="status"]').value = record.status || "current";
    panel.querySelector('[name="certificateStatus"]').value =
      record.certificateStatus || "ready-for-pdf";
  }
  if (type === "hospitalization")
    panel.querySelector('[name="status"]').value = record.status || "in-care";
  if (type === "diagnostic") {
    panel.querySelector('[name="status"]').value =
      record.status || "needs-review";
    panel.querySelector('[name="thumbnailStatus"]').value =
      record.thumbnailStatus || "queued";
  }
  openModalPanel(panel);
}
function phaseCard(phase) {
  return `<article class="card"><div class="badges"><span class="badge">${phase.code}</span><span class="badge">${phase.featureIds.join(", ")}</span></div><h3>${phase.title}</h3><p>${phase.goal}</p><ul>${phase.deliverables.map((item) => `<li>${item}</li>`).join("")}</ul></article>`;
}
function domainCard(domain) {
  return `<article class="card"><div class="badges"><span class="badge">${domain.status}</span><span class="badge">${domain.featureRange}</span></div><h3>${domain.title}</h3><p>${domain.summary}</p><p><strong>${domain.featureCount}</strong> vecori</p></article>`;
}
function ownerRow(owner) {
  return `<article class="record-row"><header><div><h3>${owner.displayName}</h3><p class="record-meta">${owner.phone || "No phone"} · ${owner.email || "No email"}</p></div><span class="badge">${owner.language}</span></header><p class="record-meta">${owner.address?.city || "No city"} · Balance ${(owner.balanceCents / 100).toFixed(2)} EUR</p><div class="record-actions"><div class="badges">${owner.tags.map((tag) => `<span class="badge">${tag}</span>`).join("")}</div><button class="text-button" type="button" data-detail-type="owner" data-detail-id="${owner.id}">Details</button></div></article>`;
}
function patientRow(patient) {
  const allergy = patient.allergies?.[0]
    ? `<span class="alert">Critical: ${patient.allergies[0].substance}</span>`
    : '<span class="ok">No critical allergy</span>';
  const weight = patient.weightHistory?.at(-1)?.weightKg
    ? `${patient.weightHistory.at(-1).weightKg} kg`
    : "No weight";
  const active = patient.id === selectedPatientId ? " selected" : "";
  return `<article class="record-row patient-row${active}" data-patient-card="${patient.id}"><header><div><h3>${patient.name}</h3><p class="record-meta">${patient.species} · ${patient.breed || "Unknown breed"} · ${weight}</p></div>${allergy}</header><p class="record-meta">Microchip: ${patient.microchip || "Not registered"} · Passport: ${patient.passportNumber || "Not issued"}</p><p class="record-meta">Owner: ${patient.owners.map((owner) => owner.displayName).join(", ")}</p><div class="record-actions"><div class="badges">${patient.tags.map((tag) => `<span class="badge">${tag}</span>`).join("")}</div><button class="text-button" type="button" data-patient-id="${patient.id}">Details</button></div></article>`;
}
function visitRow(visit) {
  const total = ((visit.totalCents || 0) / 100).toFixed(2);
  const signAction =
    visit.status === "signed"
      ? ""
      : `<button class="text-button" type="button" data-sign-visit-id="${visit.id}">Sign visit</button>`;
  const amendmentCount = visit.amendments?.length || 0;
  const amendmentBadge = amendmentCount
    ? `<span class="badge">${amendmentCount} amendment${amendmentCount === 1 ? "" : "s"}</span>`
    : "";
  const amendments = amendmentCount
    ? `<div class="amendments">${visit.amendments.map((amendment) => `<p><strong>${amendment.reason}</strong> · ${amendment.note}</p>`).join("")}</div>`
    : "";
  return `<article class="record-row"><header><div><h3>${visit.patient?.name || "Patient"} · ${visit.visitType}</h3><p class="record-meta">${new Date(visit.startedAt).toLocaleString()} · ${visit.clinician}</p></div><div class="visit-actions"><span class="badge">${visit.status}</span>${amendmentBadge}${signAction}<button class="text-button" type="button" data-detail-type="visit" data-detail-id="${visit.id}">Details</button></div></header><p>${visit.anamnesis || "No anamnesis yet."}</p><p class="record-meta">TPR: ${visit.physicalExam.temperatureC || "-"} C · ${visit.physicalExam.pulseBpm || "-"} bpm · ${visit.physicalExam.respirationRpm || "-"} rpm</p><p class="record-meta">Treatment: ${visit.treatmentPlan?.join(", ") || "No plan yet"} · Total ${total} EUR</p>${amendments}</article>`;
}
function vaccinationRow(vaccination) {
  const statusClass = vaccination.status === "overdue" ? "alert" : "ok";
  const action =
    vaccination.status === "overdue"
      ? `<button class="text-button" type="button" data-mark-vaccine-id="${vaccination.id}">Mark current</button>`
      : "";
  return `<article class="record-row"><header><div><h3>${vaccination.patient?.name || "Patient"} · ${vaccination.vaccineName}</h3><p class="record-meta">${vaccination.protocol || "No protocol"} · Lot ${vaccination.lotNumber || "-"}</p></div><div class="visit-actions"><span class="${statusClass}">${vaccination.status}</span>${action}<button class="text-button" type="button" data-detail-type="vaccination" data-detail-id="${vaccination.id}">Details</button></div></header><p class="record-meta">Administered: ${vaccination.administeredAt || "-"} · Next due: ${vaccination.nextDueAt || "-"} · Expiry: ${vaccination.expiresAt || "-"}</p><div class="badges"><span class="badge">${vaccination.manufacturer || "unknown manufacturer"}</span><span class="badge">inventory ${vaccination.inventoryReduced ? "reduced" : "pending"}</span><span class="badge">${vaccination.certificateStatus}</span></div></article>`;
}
function prescriptionRow(prescription) {
  const statusClass =
    prescription.status === "controlled-review" ? "alert" : "ok";
  const dose = `${prescription.calculatedDoseMg || 0} mg (${prescription.defaultDoseMgPerKg || 0} mg/kg @ ${prescription.patientWeightKg || 0} kg)`;
  const signAction = prescription.signedAt
    ? ""
    : `<button class="text-button" type="button" data-sign-prescription-id="${prescription.id}">Sign RX</button>`;
  const alerts = prescription.safetyAlerts?.length
    ? `<div class="amendments">${prescription.safetyAlerts.map((alert) => `<p><strong>Safety</strong> · ${alert}</p>`).join("")}</div>`
    : "";
  return `<article class="record-row"><header><div><h3>${prescription.patient?.name || "Patient"} · ${prescription.medicationName}</h3><p class="record-meta">${prescription.catalogCode || "No catalog code"} · ${prescription.route} · ${prescription.frequency}</p></div><div class="visit-actions"><span class="${statusClass}">${prescription.status}</span>${signAction}<button class="text-button" type="button" data-detail-type="prescription" data-detail-id="${prescription.id}">Details</button></div></header><p class="record-meta">Calculated dose: ${dose} · Duration ${prescription.durationDays || 0} days</p><p class="record-meta">Refill: ${prescription.refillDueAt || "No refill"} · Compliance: ${prescription.complianceStatus}</p><div class="badges"><span class="badge">${prescription.prescriptionRequired ? "prescription required" : "otc"}</span><span class="badge">${prescription.controlledSubstance ? "controlled" : "standard"}</span></div>${alerts}</article>`;
}
function surgeryRow(surgery) {
  const statusClass = surgery.riskStatus === "ready" ? "ok" : "alert";
  const estimate = ((surgery.estimateCents || 0) / 100).toFixed(2);
  const checklist =
    surgery.preOpChecklist
      ?.map(
        (item) =>
          `<span class="badge">${item.done ? "done" : "open"}: ${item.label}</span>`,
      )
      .join("") || "";
  const readyAction =
    surgery.riskStatus === "ready"
      ? ""
      : `<button class="text-button" type="button" data-complete-surgery-id="${surgery.id}">Complete checklist</button>`;
  const recoveryAction =
    surgery.recoveryStatus === "monitoring"
      ? ""
      : `<button class="text-button" type="button" data-start-recovery-id="${surgery.id}">Start recovery</button>`;
  return `<article class="record-row"><header><div><h3>${surgery.patient?.name || "Patient"} · ${surgery.procedureName}</h3><p class="record-meta">${new Date(surgery.scheduledAt).toLocaleString()} · ${surgery.surgeon}</p></div><div class="visit-actions"><span class="${statusClass}">${surgery.riskStatus}</span>${readyAction}${recoveryAction}<button class="text-button" type="button" data-detail-type="surgery" data-detail-id="${surgery.id}">Details</button></div></header><p class="record-meta">Checklist ${surgery.checklistProgress}% · Consent ${surgery.consentStatus} · Recovery ${surgery.recoveryStatus}</p><p class="record-meta">Estimate ${estimate} EUR · Follow-up ${surgery.followUpDueAt || "not scheduled"}</p><div class="badges">${checklist}</div></article>`;
}
function hospitalizationRow(stay) {
  const statusClass = ["stable", "boarding-stable", "discharged"].includes(
    stay.riskStatus,
  )
    ? "ok"
    : "alert";
  const vitals = stay.latestVitals
    ? `Temp ${stay.latestVitals.temperatureC || "-"} C · Pulse ${stay.latestVitals.pulseBpm || "-"} · Pain ${stay.latestVitals.painScore ?? "-"}`
    : "No vitals yet";
  const tasks =
    stay.treatmentSheet
      ?.map(
        (task) =>
          `<span class="badge">${task.completed ? "done" : "open"}: ${task.task}</span>`,
      )
      .join("") || "";
  const taskAction = stay.openTaskCount
    ? `<button class="text-button" type="button" data-complete-stay-tasks-id="${stay.id}">Complete tasks</button>`
    : "";
  const dischargeAction =
    stay.status === "discharged"
      ? ""
      : `<button class="text-button" type="button" data-discharge-stay-id="${stay.id}">Discharge</button>`;
  return `<article class="record-row"><header><div><h3>${stay.patient?.name || "Patient"} · ${stay.cage}</h3><p class="record-meta">${stay.stayType} · ${stay.acuity} · discharge ${stay.dischargePlannedAt ? new Date(stay.dischargePlannedAt).toLocaleString() : "not planned"}</p></div><div class="visit-actions"><span class="${statusClass}">${stay.riskStatus}</span>${taskAction}${dischargeAction}<button class="text-button" type="button" data-detail-type="hospitalization" data-detail-id="${stay.id}">Details</button></div></header><p class="record-meta">${vitals} · Open tasks ${stay.openTaskCount} · Portal photos ${stay.sharedPhotoCount}</p><p class="record-meta">Owner status: ${stay.ownerVisibleStatus || "not shared yet"}</p><div class="badges">${tasks}</div></article>`;
}
function diagnosticRow(record) {
  const statusClass = record.riskStatus === "complete" ? "ok" : "alert";
  const annotations =
    record.annotations
      ?.map((annotation) => `<span class="badge">${annotation.label}</span>`)
      .join("") || "";
  const thumbAction =
    record.thumbnailStatus === "generated"
      ? ""
      : `<button class="text-button" type="button" data-generate-thumbnail-id="${record.id}">Generate thumbnail</button>`;
  const reportAction =
    record.riskStatus === "complete"
      ? ""
      : `<button class="text-button" type="button" data-finalize-diagnostic-id="${record.id}">Finalize report</button>`;
  return `<article class="record-row"><header><div><h3>${record.patient?.name || "Patient"} · ${record.title}</h3><p class="record-meta">${record.modality} · ${new Date(record.capturedAt).toLocaleString()} · ${record.fileName || "no file name"}</p></div><div class="visit-actions"><span class="${statusClass}">${record.riskStatus}</span>${thumbAction}${reportAction}<button class="text-button" type="button" data-detail-type="diagnostic" data-detail-id="${record.id}">Details</button></div></header><p class="record-meta">Thumbnail ${record.thumbnailStatus} · PACS ${record.pacsLink ? "linked" : "not linked"} · AI pending ${record.aiPending}</p><p class="record-meta">Impression: ${record.report?.impression || "Report open"}</p><div class="badges">${annotations}<span class="badge">${record.annotationCount} annotations</span><span class="badge">${record.mediaCount} media</span></div></article>`;
}
function auditRow(event) {
  return `<article class="record-row"><header><div><h3>${event.summary}</h3><p class="record-meta">${new Date(event.at).toLocaleString()} · ${event.actor}</p></div><div class="visit-actions"><span class="badge">${event.action}</span><span class="badge">${event.entityType}</span></div></header><p class="record-meta">Record: ${event.entityId}</p></article>`;
}
function weightHistory(patient) {
  if (!patient.weightHistory?.length)
    return '<p class="muted">No weight entries yet.</p>';
  return `<div class="mini-table">${patient.weightHistory.map((entry) => `<div><span>${entry.date}</span><strong>${entry.weightKg} kg</strong></div>`).join("")}</div>`;
}
function patientTimeline(patient, visits) {
  const patientVisits = visits
    .filter((visit) => visit.patientId === patient.id)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const visitItems = patientVisits
    .map(
      (visit) =>
        `<article class="timeline-item"><span>${new Date(visit.startedAt).toLocaleDateString()}</span><strong>${visit.visitType}</strong><p>${visit.anamnesis || "No anamnesis yet."}</p><small>${visit.status} · ${visit.clinician}${visit.continuityFromVisitId ? ` · continuity from ${visit.continuityFromVisitId}` : ""}</small></article>`,
    )
    .join("");
  const vaccineItems = latestState.vaccinations
    .filter((vaccination) => vaccination.patientId === patient.id)
    .map(
      (vaccination) =>
        `<article class="timeline-item"><span>${vaccination.administeredAt}</span><strong>${vaccination.vaccineName}</strong><p>Next due ${vaccination.nextDueAt} · ${vaccination.status}</p><small>F046-F055 vaccination workflow</small></article>`,
    )
    .join("");
  const rxItems = latestState.prescriptions
    .filter((prescription) => prescription.patientId === patient.id)
    .map(
      (prescription) =>
        `<article class="timeline-item"><span>${prescription.signedAt ? new Date(prescription.signedAt).toLocaleDateString() : "Draft"}</span><strong>${prescription.medicationName}</strong><p>${prescription.calculatedDoseMg} mg · ${prescription.route} · ${prescription.frequency}</p><small>F056-F067 prescription workflow</small></article>`,
    )
    .join("");
  const surgeryItems = latestState.surgeries
    .filter((surgery) => surgery.patientId === patient.id)
    .map(
      (surgery) =>
        `<article class="timeline-item"><span>${new Date(surgery.scheduledAt).toLocaleDateString()}</span><strong>${surgery.procedureName}</strong><p>${surgery.riskStatus} · checklist ${surgery.checklistProgress}%</p><small>F068-F077 surgery workflow</small></article>`,
    )
    .join("");
  const stayItems = latestState.hospitalizations
    .filter((stay) => stay.patientId === patient.id)
    .map(
      (stay) =>
        `<article class="timeline-item"><span>${new Date(stay.admittedAt).toLocaleDateString()}</span><strong>${stay.cage}</strong><p>${stay.stayType} · ${stay.riskStatus} · ${stay.ownerVisibleStatus}</p><small>F078-F085 hospitalization workflow</small></article>`,
    )
    .join("");
  const diagnosticItems = latestState.diagnostics
    .filter((record) => record.patientId === patient.id)
    .map(
      (record) =>
        `<article class="timeline-item"><span>${new Date(record.capturedAt).toLocaleDateString()}</span><strong>${record.modality}: ${record.title}</strong><p>${record.riskStatus} · ${record.annotationCount} annotations · ${record.thumbnailStatus}</p><small>F086-F094 diagnostics workflow</small></article>`,
    )
    .join("");
  const weightItems =
    patient.weightHistory
      ?.map(
        (entry) =>
          `<article class="timeline-item"><span>${entry.date}</span><strong>Weight recorded</strong><p>${entry.weightKg} kg</p><small>F008 weight trend</small></article>`,
      )
      .join("") || "";
  return visitItems ||
    vaccineItems ||
    rxItems ||
    surgeryItems ||
    stayItems ||
    diagnosticItems ||
    weightItems
    ? `${visitItems}${vaccineItems}${rxItems}${surgeryItems}${stayItems}${diagnosticItems}${weightItems}`
    : '<p class="muted">No clinical timeline yet.</p>';
}
function patientInputs(patient) {
  return `<div class="detail-tools"><form class="form-card" data-detail-form="patient-profile" data-id="${patient.id}"><h3>Patient input</h3><label>Name<input name="name" value="${patient.name || ""}" required /></label><label>Breed<input name="breed" value="${patient.breed || ""}" /></label><label>Microchip<input name="microchip" value="${patient.microchip || ""}" /></label><label>Passport<input name="passportNumber" value="${patient.passportNumber || ""}" /></label><label>Status<select name="status"><option value="active">active</option><option value="inactive">inactive</option><option value="archived">archived</option></select></label><label>Tags<input name="tags" value="${(patient.tags || []).join(", ")}" /></label><button type="submit">Save patient info</button></form><form class="form-card" data-detail-form="patient-weight" data-id="${patient.id}"><h3>Add weight</h3><label>Weight kg<input name="weightKg" type="number" step="0.1" required /></label><button type="submit">Add weight</button></form><form class="form-card" data-detail-form="patient-allergy" data-id="${patient.id}"><h3>Add allergy</h3><label>Substance<input name="substance" required /></label><label>Note<input name="note" /></label><button type="submit">Add allergy</button></form></div>`;
}
function renderPatientDetail() {
  const target = document.querySelector("#patient-detail");
  if (!target) return;
  const patient =
    latestState.patients.find((entry) => entry.id === selectedPatientId) ||
    latestState.patients[0];
  if (!patient) {
    target.innerHTML =
      '<div class="empty-detail">Create a patient to see the clinical timeline.</div>';
    return;
  }
  selectedPatientId = patient.id;
  const allergyBanner = patient.allergies?.length
    ? `<div class="danger-banner"><strong>Critical allergy</strong><span>${patient.allergies.map((allergy) => `${allergy.substance}${allergy.note ? `: ${allergy.note}` : ""}`).join(" · ")}</span></div>`
    : '<div class="safe-banner"><strong>No critical allergies</strong><span>Clinical screens are clear for this patient.</span></div>';
  const owners =
    patient.owners.map((owner) => owner.displayName).join(", ") ||
    "No linked owner";
  target.innerHTML = `<div class="detail-header"><div><p class="eyebrow">Patient detail</p><h2>${patient.name}</h2><p class="record-meta">${patient.species} · ${patient.breed || "Unknown breed"} · ${patient.status}</p></div><span class="badge">${patient.microchip || "no-chip"}</span></div>${patientInputs(patient)}${allergyBanner}<div class="detail-grid"><div><h3>Owners</h3><p class="record-meta">${owners}</p></div><div><h3>BCS</h3><p class="record-meta">${patient.bcs?.score || "-"} / ${patient.bcs?.scale || "1-9"}</p></div></div><h3>Weight trend</h3>${weightHistory(patient)}<h3>Clinical timeline</h3><div class="timeline-detail">${patientTimeline(patient, latestState.visits)}</div>`;
  const statusSelect = target.querySelector('[name="status"]');
  if (statusSelect) statusSelect.value = patient.status || "active";
}
function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}
function fillSelect(select, items, labelKey) {
  if (!select) return;
  select.innerHTML = items
    .map((item) => `<option value="${item.id}">${item[labelKey]}</option>`)
    .join("");
}
function fillVisitSelect(select, visits) {
  if (!select) return;
  select.innerHTML = visits
    .map(
      (visit) =>
        `<option value="${visit.id}">${visit.patient?.name || "Patient"} · ${visit.visitType} · ${visit.status}</option>`,
    )
    .join("");
}
function switchView(view) {
  document
    .querySelectorAll(".nav-item")
    .forEach((item) =>
      item.classList.toggle("active", item.dataset.view === view),
    );
  document
    .querySelectorAll(".view")
    .forEach((panel) =>
      panel.classList.toggle("active", panel.dataset.panel === view),
    );
  document.querySelector("#view-title").textContent = viewTitles[view];
}
function bindTabs() {
  document
    .querySelectorAll(".nav-item")
    .forEach((button) =>
      button.addEventListener("click", () => switchView(button.dataset.view)),
    );
}
function bindTopbar() {
  document
    .querySelector("#global-search")
    ?.addEventListener("input", (event) => {
      searchQuery = event.target.value.trim().toLowerCase();
      renderLists();
      renderPatientDetail();
      renderVaccinations();
      renderPrescriptions();
      renderSurgeries();
      renderHospitalizations();
      renderDiagnostics();
      renderAudit();
    });
  document.addEventListener("click", (event) => {
    const detailButton = event.target.closest("[data-detail-type]");
    if (detailButton) {
      openRecordDetail(
        detailButton.dataset.detailType,
        detailButton.dataset.detailId,
      );
      return;
    }
    const viewButton = event.target.closest("[data-open-view]");
    if (viewButton) {
      switchView(viewButton.dataset.openView);
      return;
    }
    const formButton = event.target.closest("[data-open-form]");
    if (formButton) {
      openFormModal(formButton.dataset.openForm);
      return;
    }
    if (event.target.closest("[data-close-modal]")) {
      closeModalPanels();
      return;
    }
    if (
      document.body.classList.contains("modal-active") &&
      !event.target.closest(".modal-panel")
    )
      closeModalPanels();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModalPanels();
  });
}
function bindVisitActions() {
  document
    .querySelector("#visits-list")
    ?.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-sign-visit-id]");
      if (!button) return;
      const visit = latestState.visits.find(
        (entry) => entry.id === button.dataset.signVisitId,
      );
      if (!visit) return;
      await fetchJson(`/clinic/visits/${visit.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "signed",
          signedBy: visit.clinician,
          signedAt: new Date().toISOString(),
        }),
      });
      selectedPatientId = visit.patientId;
      setStatus("Visit signed successfully.");
      await render();
    });
}
function bindPrescriptionActions() {
  document
    .querySelector("#prescription-list")
    ?.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-sign-prescription-id]");
      if (!button) return;
      const prescription = latestState.prescriptions.find(
        (entry) => entry.id === button.dataset.signPrescriptionId,
      );
      if (!prescription) return;
      await fetchJson(`/clinic/prescriptions/${prescription.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          signedBy: "Dr. Demo",
          signedAt: new Date().toISOString(),
        }),
      });
      selectedPatientId = prescription.patientId;
      setStatus("Prescription signed successfully.");
      await render();
    });
}
function bindPatientOpen() {
  document
    .querySelector("#patients-list")
    ?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-patient-id]");
      if (!button) return;
      selectedPatientId = button.dataset.patientId;
      renderLists();
      renderPatientDetail();
      openModalPanel(document.querySelector(".patient-side-panel"));
    });
  document.querySelector("#risk-list")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-patient-id]");
    if (!button) return;
    selectedPatientId = button.dataset.patientId;
    switchView("patients");
    renderLists();
    renderPatientDetail();
    openModalPanel(document.querySelector(".patient-side-panel"));
  });
}
function nextYear(dateText) {
  const date = new Date(`${dateText}T00:00:00.000Z`);
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  return date.toISOString().slice(0, 10);
}
function splitTags(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
function bindWorkflowActions() {
  document.addEventListener("click", async (event) => {
    const button = event.target.closest(
      "[data-mark-vaccine-id], [data-complete-surgery-id], [data-start-recovery-id], [data-complete-stay-tasks-id], [data-discharge-stay-id], [data-generate-thumbnail-id], [data-finalize-diagnostic-id]",
    );
    if (!button) return;
    try {
      if (button.dataset.markVaccineId) {
        const today = new Date().toISOString().slice(0, 10);
        const vaccination = latestState.vaccinations.find(
          (entry) => entry.id === button.dataset.markVaccineId,
        );
        await fetchJson(
          `/clinic/vaccinations/${button.dataset.markVaccineId}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              status: "current",
              administeredAt: today,
              nextDueAt: nextYear(today),
              inventoryReduced: true,
              certificateStatus: "ready-for-pdf",
            }),
          },
        );
        selectedPatientId = vaccination?.patientId || selectedPatientId;
        setStatus("Vaccination marked current.");
      }
      if (button.dataset.completeSurgeryId) {
        const surgery = latestState.surgeries.find(
          (entry) => entry.id === button.dataset.completeSurgeryId,
        );
        await fetchJson(
          `/clinic/surgeries/${button.dataset.completeSurgeryId}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              consentStatus: "signed",
              preOpChecklist: (surgery?.preOpChecklist || []).map((item) => ({
                ...item,
                done: true,
              })),
              status: "ready",
            }),
          },
        );
        selectedPatientId = surgery?.patientId || selectedPatientId;
        setStatus("Surgery checklist completed.");
      }
      if (button.dataset.startRecoveryId) {
        const surgery = latestState.surgeries.find(
          (entry) => entry.id === button.dataset.startRecoveryId,
        );
        await fetchJson(`/clinic/surgeries/${button.dataset.startRecoveryId}`, {
          method: "PATCH",
          body: JSON.stringify({
            status: "recovery",
            recoveryStatus: "monitoring",
          }),
        });
        selectedPatientId = surgery?.patientId || selectedPatientId;
        setStatus("Recovery monitoring started.");
      }
      if (button.dataset.completeStayTasksId) {
        const stay = latestState.hospitalizations.find(
          (entry) => entry.id === button.dataset.completeStayTasksId,
        );
        await fetchJson(
          `/clinic/hospitalizations/${button.dataset.completeStayTasksId}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              treatmentSheet: (stay?.treatmentSheet || []).map((task) => ({
                ...task,
                completed: true,
              })),
              ownerVisibleStatus: "Care tasks completed and patient monitored",
            }),
          },
        );
        selectedPatientId = stay?.patientId || selectedPatientId;
        setStatus("Care tasks completed.");
      }
      if (button.dataset.dischargeStayId) {
        const stay = latestState.hospitalizations.find(
          (entry) => entry.id === button.dataset.dischargeStayId,
        );
        await fetchJson(
          `/clinic/hospitalizations/${button.dataset.dischargeStayId}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              status: "discharged",
              dischargePlannedAt: new Date().toISOString(),
              ownerVisibleStatus: "Patient discharged",
              dischargePlan: stay?.dischargePlan?.length
                ? stay.dischargePlan
                : ["Discharged with home-care instructions"],
            }),
          },
        );
        selectedPatientId = stay?.patientId || selectedPatientId;
        setStatus("Patient discharged.");
      }
      if (button.dataset.generateThumbnailId) {
        const record = latestState.diagnostics.find(
          (entry) => entry.id === button.dataset.generateThumbnailId,
        );
        await fetchJson(
          `/clinic/diagnostics/${button.dataset.generateThumbnailId}`,
          {
            method: "PATCH",
            body: JSON.stringify({ thumbnailStatus: "generated" }),
          },
        );
        selectedPatientId = record?.patientId || selectedPatientId;
        setStatus("Thumbnail generated.");
      }
      if (button.dataset.finalizeDiagnosticId) {
        const record = latestState.diagnostics.find(
          (entry) => entry.id === button.dataset.finalizeDiagnosticId,
        );
        await fetchJson(
          `/clinic/diagnostics/${button.dataset.finalizeDiagnosticId}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              status: "reported",
              thumbnailStatus: "generated",
              report: {
                ...(record?.report || {}),
                radiologist: record?.report?.radiologist || "Dr. Demo",
                impression:
                  record?.report?.impression ||
                  "Reviewed and no urgent abnormality recorded.",
                finalizedAt: new Date().toISOString(),
              },
              aiScreening: (record?.aiScreening || []).map((screening) => ({
                ...screening,
                result: "not-run",
              })),
            }),
          },
        );
        selectedPatientId = record?.patientId || selectedPatientId;
        setStatus("Diagnostic report finalized.");
      }
      await render();
    } catch (error) {
      setStatus(error.message, "error");
    }
  });
}
async function submitForm(form) {
  const type = form.dataset.form;
  if (type === "amendment") {
    const data = formData(form);
    const visit = latestState.visits.find((entry) => entry.id === data.visitId);
    if (!visit) throw new Error("Visit is required");
    const amendments = [
      ...(visit.amendments || []),
      { at: new Date().toISOString(), reason: data.reason, note: data.note },
    ];
    await fetchJson(`/clinic/visits/${visit.id}`, {
      method: "PATCH",
      body: JSON.stringify({ amendments }),
    });
    selectedPatientId = visit.patientId;
    form.reset();
    closeModalPanels();
    setStatus("Amendment u shtua me sukses.");
    await render();
    switchView("visits");
    return;
  }
  const data = formData(form);
  if (type === "prescription")
    data.controlledSubstance = data.controlledSubstance === "true";
  const endpoints = {
    owner: "/clinic/owners",
    patient: "/clinic/patients",
    visit: "/clinic/visits",
    vaccination: "/clinic/vaccinations",
    prescription: "/clinic/prescriptions",
    surgery: "/clinic/surgeries",
    hospitalization: "/clinic/hospitalizations",
    diagnostic: "/clinic/diagnostics",
  };
  const created = await fetchJson(endpoints[type], {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (type === "patient") selectedPatientId = created.id;
  if (
    type === "visit" ||
    type === "vaccination" ||
    type === "prescription" ||
    type === "surgery" ||
    type === "hospitalization" ||
    type === "diagnostic"
  )
    selectedPatientId = created.patientId;
  form.reset();
  closeModalPanels();
  setStatus(`${type} u ruajt me sukses.`);
  await render();
  if (type === "patient" || type === "visit") switchView("patients");
  if (type === "vaccination") switchView("vaccinations");
  if (type === "prescription") switchView("prescriptions");
  if (type === "surgery") switchView("surgery");
  if (type === "hospitalization") switchView("hospitalizations");
  if (type === "diagnostic") switchView("diagnostics");
}
function bindForms() {
  document.querySelectorAll("form[data-form]").forEach((form) =>
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await submitForm(form);
      } catch (error) {
        setStatus(error.message, "error");
      }
    }),
  );
}
function bindDetailForms() {
  document.addEventListener("submit", async (event) => {
    const form = event.target.closest("form[data-detail-form]");
    if (!form) return;
    event.preventDefault();
    const data = formData(form);
    const id = form.dataset.id;
    try {
      if (form.dataset.detailForm === "patient-profile") {
        const patient = latestState.patients.find((entry) => entry.id === id);
        await fetchJson(`/clinic/patients/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: data.name,
            breed: data.breed,
            microchip: data.microchip,
            passportNumber: data.passportNumber,
            status: data.status,
            tags: splitTags(data.tags),
            ownerIds: patient?.ownerIds || [],
          }),
        });
        selectedPatientId = id;
        setStatus("Patient info saved.");
      }
      if (form.dataset.detailForm === "patient-weight") {
        const patient = latestState.patients.find((entry) => entry.id === id);
        const weightHistory = [
          ...(patient?.weightHistory || []),
          {
            date: new Date().toISOString().slice(0, 10),
            weightKg: Number(data.weightKg || 0),
          },
        ];
        await fetchJson(`/clinic/patients/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ weightHistory }),
        });
        selectedPatientId = id;
        form.reset();
        setStatus("Weight added.");
      }
      if (form.dataset.detailForm === "patient-allergy") {
        const patient = latestState.patients.find((entry) => entry.id === id);
        const allergies = [
          ...(patient?.allergies || []),
          { substance: data.substance, severity: "critical", note: data.note },
        ];
        await fetchJson(`/clinic/patients/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ allergies }),
        });
        selectedPatientId = id;
        form.reset();
        setStatus("Allergy added.");
      }
      if (form.dataset.detailForm === "visit-soap") {
        await fetchJson(`/clinic/visits/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            anamnesis: data.anamnesis,
            physicalExam: {
              temperatureC: Number(data.temperatureC || 0),
              pulseBpm: Number(data.pulseBpm || 0),
              respirationRpm: Number(data.respirationRpm || 0),
            },
            diagnoses: data.diagnosis
              ? [{ system: "free-text", code: "", label: data.diagnosis }]
              : [],
            treatmentPlan: splitTags(data.treatmentPlan),
          }),
        });
        setStatus("Visit info saved.");
      }
      if (form.dataset.detailForm === "visit-procedure") {
        const visit = latestState.visits.find((entry) => entry.id === id);
        const procedures = [
          ...(visit?.procedures || []),
          {
            name: data.procedureName,
            costCents: Math.round(Number(data.procedureCost || 0) * 100),
          },
        ];
        await fetchJson(`/clinic/visits/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ procedures }),
        });
        form.reset();
        setStatus("Procedure added.");
      }
      if (form.dataset.detailForm === "surgery-update") {
        await fetchJson(`/clinic/surgeries/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            status: data.status,
            consentStatus: data.consentStatus,
            recoveryStatus: data.recoveryStatus,
            followUpDueAt: data.followUpDueAt || null,
            dischargeInstructions: data.dischargeInstructions,
          }),
        });
        setStatus("Surgery info saved.");
      }
      if (form.dataset.detailForm === "surgery-anesthesia") {
        const surgery = latestState.surgeries.find((entry) => entry.id === id);
        const anesthesiaRecord = [
          ...(surgery?.anesthesiaRecord || []),
          {
            minute: Number(data.minute || 0),
            heartRate: Number(data.heartRate || 0),
            respiration: Number(data.respiration || 0),
            temperatureC: Number(data.temperatureC || 0),
            note: data.note,
          },
        ];
        await fetchJson(`/clinic/surgeries/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ anesthesiaRecord }),
        });
        form.reset();
        setStatus("Anesthesia observation added.");
      }
      if (form.dataset.detailForm === "surgery-drug") {
        const surgery = latestState.surgeries.find((entry) => entry.id === id);
        const drugsGiven = [
          ...(surgery?.drugsGiven || []),
          {
            name: data.name,
            amount: data.amount,
            atMinute: Number(data.atMinute || 0),
          },
        ];
        await fetchJson(`/clinic/surgeries/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ drugsGiven }),
        });
        form.reset();
        setStatus("Drug added.");
      }
      if (form.dataset.detailForm === "owner-profile") {
        const owner = latestState.owners.find((entry) => entry.id === id);
        await fetchJson(`/clinic/owners/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            displayName: data.displayName,
            phone: data.phone,
            email: data.email,
            preferredChannel: data.preferredChannel,
            address: { ...(owner?.address || {}), city: data.city },
            tags: splitTags(data.tags),
            privateNote: data.privateNote,
          }),
        });
        setStatus("Owner info saved.");
      }
      if (form.dataset.detailForm === "vaccination-update") {
        await fetchJson(`/clinic/vaccinations/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            status: data.status,
            nextDueAt: data.nextDueAt || null,
            certificateStatus: data.certificateStatus,
            inventoryReduced: data.inventoryReduced === "true",
          }),
        });
        setStatus("Vaccination info saved.");
      }
      if (form.dataset.detailForm === "prescription-update") {
        const prescription = latestState.prescriptions.find(
          (entry) => entry.id === id,
        );
        const controlledSubstance = data.controlledSubstance === "true";
        const safetyAlerts =
          controlledSubstance &&
          !(prescription?.safetyAlerts || []).includes(
            "Controlled substance log required",
          )
            ? [
                ...(prescription?.safetyAlerts || []),
                "Controlled substance log required",
              ]
            : prescription?.safetyAlerts || [];
        await fetchJson(`/clinic/prescriptions/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            complianceStatus: data.complianceStatus,
            refillDueAt: data.refillDueAt || null,
            durationDays: Number(data.durationDays || 0),
            controlledSubstance,
            safetyAlerts,
          }),
        });
        setStatus("Prescription info saved.");
      }
      if (form.dataset.detailForm === "hospitalization-update") {
        await fetchJson(`/clinic/hospitalizations/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            status: data.status,
            ownerVisibleStatus: data.ownerVisibleStatus,
            dischargePlannedAt: data.dischargePlannedAt || null,
            dischargePlan: splitTags(data.dischargePlan),
          }),
        });
        setStatus("Hospitalization info saved.");
      }
      if (form.dataset.detailForm === "hospitalization-vitals") {
        const stay = latestState.hospitalizations.find(
          (entry) => entry.id === id,
        );
        const vitals = [
          ...(stay?.vitals || []),
          {
            at: new Date().toISOString(),
            temperatureC: Number(data.temperatureC || 0),
            pulseBpm: Number(data.pulseBpm || 0),
            respirationRpm: Number(data.respirationRpm || 0),
            painScore: Number(data.painScore || 0),
          },
        ];
        await fetchJson(`/clinic/hospitalizations/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ vitals }),
        });
        form.reset();
        setStatus("Vitals added.");
      }
      if (form.dataset.detailForm === "hospitalization-task") {
        const stay = latestState.hospitalizations.find(
          (entry) => entry.id === id,
        );
        const treatmentSheet = [
          ...(stay?.treatmentSheet || []),
          {
            time: new Date().toISOString(),
            task: data.task,
            intervalHours: 0,
            completed: false,
          },
        ];
        await fetchJson(`/clinic/hospitalizations/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ treatmentSheet }),
        });
        form.reset();
        setStatus("Hospital task added.");
      }
      if (form.dataset.detailForm === "diagnostic-update") {
        const record = latestState.diagnostics.find((entry) => entry.id === id);
        await fetchJson(`/clinic/diagnostics/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            status: data.status,
            thumbnailStatus: data.thumbnailStatus,
            report: {
              ...(record?.report || {}),
              radiologist: data.radiologist,
              impression: data.impression,
              finalizedAt: data.impression ? new Date().toISOString() : null,
            },
          }),
        });
        setStatus("Diagnostic info saved.");
      }
      if (form.dataset.detailForm === "diagnostic-annotation") {
        const record = latestState.diagnostics.find((entry) => entry.id === id);
        const annotations = [
          ...(record?.annotations || []),
          { label: data.label, region: data.region, note: data.note },
        ];
        await fetchJson(`/clinic/diagnostics/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ annotations }),
        });
        form.reset();
        setStatus("Annotation added.");
      }
      await render();
      const detailMap = {
        "owner-profile": "owner",
        "vaccination-update": "vaccination",
        "prescription-update": "prescription",
        "hospitalization-update": "hospitalization",
        "hospitalization-vitals": "hospitalization",
        "hospitalization-task": "hospitalization",
        "diagnostic-update": "diagnostic",
        "diagnostic-annotation": "diagnostic",
        "visit-soap": "visit",
        "visit-procedure": "visit",
        "surgery-update": "surgery",
        "surgery-anesthesia": "surgery",
        "surgery-drug": "surgery",
      };
      const activeType = detailMap[form.dataset.detailForm] || null;
      if (activeType) openRecordDetail(activeType, id);
      if (form.dataset.detailForm.startsWith("patient"))
        openModalPanel(document.querySelector(".patient-side-panel"));
    } catch (error) {
      setStatus(error.message, "error");
    }
  });
}
function renderLists() {
  const patients = filtered(latestState.patients);
  const owners = filtered(latestState.owners);
  const visits = filtered(latestState.visits);
  const riskPatients = filtered(
    latestState.patients.filter((patient) => patient.allergies?.length),
  );
  document.querySelector("#risk-list").innerHTML =
    riskPatients.map(patientRow).join("") ||
    '<p class="muted">No critical patient signals.</p>';
  document.querySelector("#recent-visits").innerHTML =
    visits.slice(0, 4).map(visitRow).join("") ||
    '<p class="muted">No visits match the current search.</p>';
  document.querySelector("#patients-list").innerHTML =
    `${recordCount(patients)}${patients.map(patientRow).join("") || '<p class="muted">No patients match the current search.</p>'}`;
  document.querySelector("#owners-list").innerHTML =
    `${recordCount(owners)}${owners.map(ownerRow).join("") || '<p class="muted">No owners match the current search.</p>'}`;
  document.querySelector("#visits-list").innerHTML =
    `${recordCount(visits)}${visits.map(visitRow).join("") || '<p class="muted">No visits match the current search.</p>'}`;
}
function renderVaccinations() {
  const summary = latestState.vaccinationSummary;
  if (!summary) return;
  const vaccinations = filtered(latestState.vaccinations);
  const alerts = filtered(summary.overdueItems);
  document.querySelector("#vaccination-metrics").innerHTML = [
    metric("Vaccinations", summary.counts.vaccinations),
    metric("Overdue", summary.counts.overdue),
    metric("Inventory reductions", summary.counts.inventoryReduced),
  ].join("");
  document.querySelector("#vaccination-coverage").innerHTML =
    summary.featureCoverage
      .map(
        (coverage) =>
          `<article class="card"><div class="badges"><span class="badge">${coverage.range}</span></div><h3>${coverage.area}</h3><p>${coverage.description}</p></article>`,
      )
      .join("");
  document.querySelector("#vaccination-alerts").innerHTML =
    alerts.map(vaccinationRow).join("") ||
    '<p class="muted">No overdue vaccine alerts.</p>';
  document.querySelector("#vaccination-list").innerHTML =
    `${recordCount(vaccinations)}${vaccinations.map(vaccinationRow).join("") || '<p class="muted">No vaccinations match the current search.</p>'}`;
}
function renderPrescriptions() {
  const summary = latestState.prescriptionSummary;
  if (!summary) return;
  const prescriptions = filtered(latestState.prescriptions);
  const controlledAlerts = filtered(summary.controlledAlerts);
  const refillReminders = filtered(summary.refillReminders);
  document.querySelector("#prescription-metrics").innerHTML = [
    metric("Prescriptions", summary.counts.prescriptions),
    metric("Controlled", summary.counts.controlled),
    metric("Refills", summary.counts.refillReminders),
  ].join("");
  document.querySelector("#prescription-coverage").innerHTML =
    summary.featureCoverage
      .map(
        (coverage) =>
          `<article class="card"><div class="badges"><span class="badge">${coverage.range}</span></div><h3>${coverage.area}</h3><p>${coverage.description}</p></article>`,
      )
      .join("");
  document.querySelector("#prescription-alerts").innerHTML =
    controlledAlerts.map(prescriptionRow).join("") ||
    '<p class="muted">No controlled drug alerts.</p>';
  document.querySelector("#prescription-refills").innerHTML =
    refillReminders.map(prescriptionRow).join("") ||
    '<p class="muted">No refill reminders.</p>';
  document.querySelector("#prescription-list").innerHTML =
    `${recordCount(prescriptions)}${prescriptions.map(prescriptionRow).join("") || '<p class="muted">No prescriptions match the current search.</p>'}`;
}
function renderSurgeries() {
  const summary = latestState.surgerySummary;
  if (!summary) return;
  const surgeries = filtered(latestState.surgeries);
  const alerts = filtered(summary.alerts);
  document.querySelector("#surgery-metrics").innerHTML = [
    metric("Surgeries", summary.counts.surgeries),
    metric("Consent needed", summary.counts.consentNeeded),
    metric("Recovery monitoring", summary.counts.recoveryMonitoring),
  ].join("");
  document.querySelector("#surgery-coverage").innerHTML =
    summary.featureCoverage
      .map(
        (coverage) =>
          `<article class="card"><div class="badges"><span class="badge">${coverage.range}</span></div><h3>${coverage.area}</h3><p>${coverage.description}</p></article>`,
      )
      .join("");
  document.querySelector("#surgery-alerts").innerHTML =
    alerts.map(surgeryRow).join("") ||
    '<p class="muted">No surgery alerts.</p>';
  document.querySelector("#surgery-list").innerHTML =
    `${recordCount(surgeries)}${surgeries.map(surgeryRow).join("") || '<p class="muted">No surgeries match the current search.</p>'}`;
}
function renderHospitalizations() {
  const summary = latestState.hospitalizationSummary;
  if (!summary) return;
  const stays = filtered(latestState.hospitalizations);
  const alerts = filtered(summary.alerts);
  document.querySelector("#hospitalization-metrics").innerHTML = [
    metric("Active stays", summary.counts.active),
    metric("Open tasks", summary.counts.openTasks),
    metric("Portal photos", summary.counts.sharedPhotos),
  ].join("");
  document.querySelector("#hospitalization-coverage").innerHTML =
    summary.featureCoverage
      .map(
        (coverage) =>
          `<article class="card"><div class="badges"><span class="badge">${coverage.range}</span></div><h3>${coverage.area}</h3><p>${coverage.description}</p></article>`,
      )
      .join("");
  document.querySelector("#hospitalization-alerts").innerHTML =
    alerts.map(hospitalizationRow).join("") ||
    '<p class="muted">No hospitalization alerts.</p>';
  document.querySelector("#hospitalization-list").innerHTML =
    `${recordCount(stays)}${stays.map(hospitalizationRow).join("") || '<p class="muted">No stays match the current search.</p>'}`;
}
function renderDiagnostics() {
  const summary = latestState.diagnosticSummary;
  if (!summary) return;
  const diagnostics = filtered(latestState.diagnostics);
  const alerts = filtered(summary.alerts);
  document.querySelector("#diagnostic-metrics").innerHTML = [
    metric("Diagnostics", summary.counts.diagnostics),
    metric("Review needed", summary.counts.reviewNeeded),
    metric("AI pending", summary.counts.aiPending),
  ].join("");
  document.querySelector("#diagnostic-coverage").innerHTML =
    summary.featureCoverage
      .map(
        (coverage) =>
          `<article class="card"><div class="badges"><span class="badge">${coverage.range}</span></div><h3>${coverage.area}</h3><p>${coverage.description}</p></article>`,
      )
      .join("");
  document.querySelector("#diagnostic-alerts").innerHTML =
    alerts.map(diagnosticRow).join("") ||
    '<p class="muted">No diagnostic alerts.</p>';
  document.querySelector("#diagnostic-list").innerHTML =
    `${recordCount(diagnostics)}${diagnostics.map(diagnosticRow).join("") || '<p class="muted">No diagnostics match the current search.</p>'}`;
}
function renderAudit() {
  const events = filtered(latestState.auditEvents);
  document.querySelector("#audit-list").innerHTML =
    `${recordCount(events)}${events.map(auditRow).join("") || '<p class="muted">No audit events match the current search.</p>'}`;
}
function renderWorkQueue() {
  const items = [];
  const critical = latestState.patients.filter(
    (patient) => patient.allergies?.length,
  ).length;
  if (critical)
    items.push(
      queueItem(
        "patients",
        "Critical patient signals",
        "Review allergy banners before prescribing or procedures.",
        critical,
      ),
    );
  if (latestState.vaccinationSummary?.counts.overdue)
    items.push(
      queueItem(
        "vaccinations",
        "Overdue vaccines",
        "Mark current or record updated vaccine events.",
        latestState.vaccinationSummary.counts.overdue,
      ),
    );
  if (latestState.prescriptionSummary?.counts.unsignedControlled)
    items.push(
      queueItem(
        "prescriptions",
        "Controlled RX needs signature",
        "Sign regulated prescriptions and keep audit trail current.",
        latestState.prescriptionSummary.counts.unsignedControlled,
      ),
    );
  if (latestState.surgerySummary?.alerts.length)
    items.push(
      queueItem(
        "surgery",
        "Surgery readiness",
        "Complete consent, checklist or recovery monitoring.",
        latestState.surgerySummary.alerts.length,
      ),
    );
  if (latestState.hospitalizationSummary?.alerts.length)
    items.push(
      queueItem(
        "hospitalizations",
        "Inpatient care tasks",
        "Close nursing tasks or discharge planning gaps.",
        latestState.hospitalizationSummary.alerts.length,
      ),
    );
  if (latestState.diagnosticSummary?.alerts.length)
    items.push(
      queueItem(
        "diagnostics",
        "Diagnostics pending",
        "Generate thumbnails or finalize reports.",
        latestState.diagnosticSummary.alerts.length,
      ),
    );
  const count = items.length;
  document.querySelector("#queue-count").textContent = `${count} open`;
  document.querySelector("#work-queue").innerHTML =
    items.join("") ||
    '<div class="empty-state">No open clinical work queue items right now.</div>';
}
async function render() {
  const [
    blueprint,
    summary,
    owners,
    patients,
    visits,
    vaccinationSummary,
    vaccinations,
    prescriptionSummary,
    prescriptions,
    surgerySummary,
    surgeries,
    hospitalizationSummary,
    hospitalizations,
    diagnosticSummary,
    diagnostics,
    auditEvents,
  ] = await Promise.all([
    fetchJson("/blueprint"),
    fetchJson("/clinic/summary"),
    fetchJson("/clinic/owners"),
    fetchJson("/clinic/patients"),
    fetchJson("/clinic/visits"),
    fetchJson("/clinic/vaccinations/summary"),
    fetchJson("/clinic/vaccinations"),
    fetchJson("/clinic/prescriptions/summary"),
    fetchJson("/clinic/prescriptions"),
    fetchJson("/clinic/surgeries/summary"),
    fetchJson("/clinic/surgeries"),
    fetchJson("/clinic/hospitalizations/summary"),
    fetchJson("/clinic/hospitalizations"),
    fetchJson("/clinic/diagnostics/summary"),
    fetchJson("/clinic/diagnostics"),
    fetchJson("/clinic/audit"),
  ]);
  latestState = {
    blueprint,
    summary,
    owners: owners.items,
    patients: patients.items,
    visits: visits.items,
    vaccinationSummary,
    vaccinations: vaccinations.items,
    prescriptionSummary,
    prescriptions: prescriptions.items,
    surgerySummary,
    surgeries: surgeries.items,
    hospitalizationSummary,
    hospitalizations: hospitalizations.items,
    diagnosticSummary,
    diagnostics: diagnostics.items,
    auditEvents: auditEvents.items,
  };
  if (!selectedPatientId && latestState.patients[0])
    selectedPatientId = latestState.patients[0].id;
  document.querySelector("#api-status").textContent = "API online";
  document.querySelector("#api-status").classList.remove("offline");
  fillSelect(
    document.querySelector("#owner-options"),
    latestState.owners,
    "displayName",
  );
  fillSelect(
    document.querySelector("#patient-options"),
    latestState.patients,
    "name",
  );
  fillSelect(
    document.querySelector("#vaccination-patient-options"),
    latestState.patients,
    "name",
  );
  fillSelect(
    document.querySelector("#prescription-patient-options"),
    latestState.patients,
    "name",
  );
  fillSelect(
    document.querySelector("#surgery-patient-options"),
    latestState.patients,
    "name",
  );
  fillSelect(
    document.querySelector("#hospitalization-patient-options"),
    latestState.patients,
    "name",
  );
  fillSelect(
    document.querySelector("#diagnostic-patient-options"),
    latestState.patients,
    "name",
  );
  fillVisitSelect(document.querySelector("#visit-options"), latestState.visits);
  fillVisitSelect(
    document.querySelector("#prescription-visit-options"),
    latestState.visits,
  );
  fillVisitSelect(
    document.querySelector("#surgery-visit-options"),
    latestState.visits,
  );
  fillVisitSelect(
    document.querySelector("#hospitalization-visit-options"),
    latestState.visits,
  );
  fillVisitSelect(
    document.querySelector("#diagnostic-visit-options"),
    latestState.visits,
  );
  document.querySelector("#metrics").innerHTML = [
    metric("Patients", summary.counts.patients),
    metric("Owners", summary.counts.owners),
    metric("Visits", summary.counts.visits),
    metric("Signed visits", summary.counts.signedVisits),
    metric("Critical allergies", summary.counts.criticalAllergies),
    metric("Overdue vaccines", vaccinationSummary.counts.overdue),
    metric("RX alerts", prescriptionSummary.counts.unsignedControlled),
    metric("Surgery alerts", surgerySummary.alerts.length),
    metric("Care alerts", hospitalizationSummary.alerts.length),
    metric("Diagnostic alerts", diagnosticSummary.alerts.length),
    metric("Audit events", auditEvents.items.length),
  ].join("");
  document.querySelector("#clinic-summary").innerHTML = summary.featureCoverage
    .map(
      (coverage) =>
        `<article class="card"><div class="badges"><span class="badge">${coverage.range}</span></div><h3>${coverage.area}</h3><p>${coverage.description}</p></article>`,
    )
    .join("");
  renderWorkQueue();
  renderLists();
  renderPatientDetail();
  renderVaccinations();
  renderPrescriptions();
  renderSurgeries();
  renderHospitalizations();
  renderDiagnostics();
  renderAudit();
  document.querySelector("#phases").innerHTML = blueprint.phases
    .map(phaseCard)
    .join("");
  document.querySelector("#domains").innerHTML = blueprint.domains
    .map(domainCard)
    .join("");
}
prepareModalPanels();
bindTabs();
bindTopbar();
bindForms();
bindDetailForms();
bindPatientOpen();
bindVisitActions();
bindPrescriptionActions();
bindWorkflowActions();
try {
  await render();
} catch (error) {
  document.querySelector("#api-status").textContent = "API offline";
  document.querySelector("#api-status").classList.add("offline");
  document.querySelector("#metrics").innerHTML = metric("Start API", "4100");
  document.querySelector("#clinic-summary").innerHTML =
    `<article class="card"><h3>Nis API</h3><p>Starto API me <code>npm run dev:api</code>, pastaj rifresko faqen.</p></article>`;
  setStatus(error.message, "error");
}
