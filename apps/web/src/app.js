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
  labs: "Laboratory",
  specialties: "Specialty Modules",
  operations: "Operations Hub",
  inventory: "Pharmacy & Inventory",
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
  labSummary: null,
  labs: [],
  specialtySummary: null,
  specialties: [],
  operationsSummary: null,
  appointments: [],
  clientMessages: [],
  staffRoster: [],
  inventorySummary: null,
  inventoryItems: [],
  purchaseOrders: [],
  controlledLog: [],
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
  lab: "Create lab order",
  specialty: "Create specialty record",
  appointment: "Schedule appointment",
  message: "Compose client message",
  inventory: "Add inventory item",
  purchaseOrder: "Create purchase order",
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
  lab: "labs",
  specialty: "specialties",
  appointment: "appointments",
  message: "clientMessages",
  inventory: "inventoryItems",
  purchaseOrder: "purchaseOrders",
  controlled: "controlledLog",
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
  lab: "Lab detail",
  specialty: "Specialty detail",
  appointment: "Appointment detail",
  message: "Client message detail",
  inventory: "Inventory item detail",
  purchaseOrder: "Purchase order detail",
  controlled: "Controlled log detail",
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
  if (type === "lab") {
    return [
      detailSection("Lab order", [
        ["Patient", patientName],
        ["Panel", record.panelName],
        ["Test type", record.testType],
        ["Source", record.source],
        ["Provider", record.provider],
        ["Country", record.country],
        ["Status", record.status],
        ["Risk", record.riskStatus],
      ]),
      detailSection(
        "Results and interpretation",
        [
          ["Sample", record.sampleType],
          [
            "Ordered",
            record.orderedAt
              ? new Date(record.orderedAt).toLocaleString()
              : "-",
          ],
          [
            "Collected",
            record.collectedAt
              ? new Date(record.collectedAt).toLocaleString()
              : "-",
          ],
          ["Parser", record.parserStatus],
          ["Shared", record.sharedWithOwner ? "Yes" : "No"],
          ["Interpretation", record.interpretation?.summary],
        ],
        `${compactList(record.results, "No results entered.")}${compactList(record.criticalAlerts, "No critical alerts.")}`,
      ),
    ].join("");
  }
  if (type === "specialty") {
    return [
      detailSection("Specialty record", [
        ["Patient", patientName],
        ["Type", record.specialtyType],
        ["Title", record.title],
        ["Status", record.status],
        ["Risk", record.riskStatus],
        ["Clinician", record.clinician],
        [
          "Started",
          record.startedAt ? new Date(record.startedAt).toLocaleString() : "-",
        ],
        ["Quality of life", record.qualityOfLifeScore ?? "-"],
      ]),
      detailSection(
        "Plan and execution",
        [
          ["Open tasks", record.openTaskCount],
          ["Attachments", record.attachmentCount],
          ["Plan", record.plan?.join(", ")],
        ],
        `${compactList(record.findings, "No findings entered.")}${compactList(record.tasks, "No tasks entered.")}${compactList(record.genetics, "No genetics linked.")}`,
      ),
    ].join("");
  }
  if (type === "appointment") {
    return [
      detailSection("Appointment", [
        ["Patient", patientName],
        ["Owner", record.owner?.displayName],
        ["Title", record.title],
        ["Type", record.appointmentType],
        ["Status", record.status],
        ["Risk", record.riskStatus],
        ["Vet", record.assignedVet],
        ["Room", record.room],
        [
          "Starts",
          record.startsAt ? new Date(record.startsAt).toLocaleString() : "-",
        ],
        [
          "Ends",
          record.endsAt ? new Date(record.endsAt).toLocaleString() : "-",
        ],
      ]),
      detailSection(
        "Operational flags",
        [
          ["Channel", record.channel],
          ["Walk-in", record.walkIn ? "Yes" : "No"],
          ["Waitlist priority", record.waitlistPriority || "-"],
          ["Buffer", `${record.bufferMinutes || 0} min`],
          ["No-show risk", record.noShowRisk],
        ],
        compactList(record.assignedStaff, "No staff assigned."),
      ),
    ].join("");
  }
  if (type === "message") {
    return [
      detailSection("Client message", [
        ["Patient", patientName],
        ["Owner", record.owner?.displayName],
        ["Channel", record.channel],
        ["Template", record.template],
        ["Language", record.language],
        ["Status", record.status],
        ["Requires reply", record.requiresReply ? "Yes" : "No"],
        ["Translated", record.translated ? "Yes" : "No"],
        [
          "Scheduled",
          record.scheduledAt
            ? new Date(record.scheduledAt).toLocaleString()
            : "-",
        ],
        [
          "Sent",
          record.sentAt ? new Date(record.sentAt).toLocaleString() : "-",
        ],
      ]),
      detailSection("Message summary", [["Summary", record.summary]]),
    ].join("");
  }
  if (type === "inventory") {
    return [
      detailSection("Inventory item", [
        ["Medication", record.medicationName],
        ["ATCvet", record.atcvetCode],
        ["Form", record.dosageForm],
        ["Concentration", record.concentration],
        ["Risk", record.riskStatus],
        ["On hand", record.totalUnits],
        ["Reorder threshold", record.reorderThreshold],
        ["Supplier", record.supplierName],
        ["Earliest expiry", record.earliestExpiry || "-"],
      ]),
      detailSection(
        "Warehouses and movements",
        [
          ["Warehouses", record.warehouseCount],
          ["Movements", record.movementCount],
          ["Controlled", record.controlledSubstance ? "Yes" : "No"],
          ["Prescription required", record.prescriptionRequired ? "Yes" : "No"],
        ],
        `${compactList(record.warehouses, "No warehouse lots.")}${compactList(record.movements, "No stock movements.")}`,
      ),
    ].join("");
  }
  if (type === "purchaseOrder") {
    return [
      detailSection(
        "Purchase order",
        [
          ["Supplier", record.supplierName],
          ["Warehouse", record.warehouse],
          ["Approval", record.approvalStatus],
          ["Receiving", record.receivingStatus],
          ["Invoice match", record.invoiceMatchStatus],
          ["Cost method", record.costMethod],
          [
            "Expected",
            record.expectedAt
              ? new Date(record.expectedAt).toLocaleString()
              : "-",
          ],
          [
            "Received",
            record.receivedAt
              ? new Date(record.receivedAt).toLocaleString()
              : "-",
          ],
          ["Invoice ref", record.invoiceReference || "-"],
        ],
        compactList(record.lines, "No PO lines."),
      ),
    ].join("");
  }
  if (type === "controlled") {
    return [
      detailSection(
        "Controlled log entry",
        [
          ["Medication", record.inventoryItem?.medicationName],
          ["Patient", patientName],
          ["Actor", record.actor],
          ["Action", record.action],
          ["Units", record.units],
          ["Remaining", record.remainingUnits],
          ["Authority", record.authorityReportStatus],
          ["Reconciliation", record.reconciliationStatus],
        ],
        compactList([record.note], "No note."),
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
function labInputs(record) {
  return `<div class="detail-tools"><form class="form-card" data-detail-form="lab-update" data-id="${record.id}"><h3>Lab input</h3><label>Status<select name="status"><option value="ordered">ordered</option><option value="sent">sent</option><option value="received">received</option><option value="reviewed">reviewed</option></select></label><label>Parser<select name="parserStatus"><option value="manual-entry">manual-entry</option><option value="queued">queued</option><option value="parsed">parsed</option><option value="failed">failed</option></select></label><label>Interpretation<textarea name="interpretation">${record.interpretation?.summary || ""}</textarea></label><label class="checkbox-line"><input name="sharedWithOwner" type="checkbox" value="true" ${record.sharedWithOwner ? "checked" : ""} /> Shared with owner</label><button type="submit">Save lab info</button></form><form class="form-card" data-detail-form="lab-result" data-id="${record.id}"><h3>Add result</h3><label>Analyte<input name="analyte" required /></label><label>Value<input name="value" type="number" step="0.01" /></label><label>Unit<input name="unit" /></label><label>Ref low<input name="referenceLow" type="number" step="0.01" /></label><label>Ref high<input name="referenceHigh" type="number" step="0.01" /></label><button type="submit">Add result</button></form><form class="form-card" data-detail-form="lab-alert" data-id="${record.id}"><h3>Add critical alert</h3><label>Alert<input name="alert" required /></label><button type="submit">Add alert</button></form></div>`;
}
function specialtyInputs(record) {
  return `<div class="detail-tools"><form class="form-card" data-detail-form="specialty-update" data-id="${record.id}"><h3>Specialty input</h3><label>Status<select name="status"><option value="active">active</option><option value="draft">draft</option><option value="completed">completed</option></select></label><label>Quality of life score<input name="qualityOfLifeScore" type="number" min="0" max="70" value="${record.qualityOfLifeScore || ""}" /></label><label>Plan<input name="plan" value="${(record.plan || []).join(", ")}" /></label><button type="submit">Save specialty info</button></form><form class="form-card" data-detail-form="specialty-task" data-id="${record.id}"><h3>Add task</h3><label>Task<input name="task" required /></label><label>Due<input name="dueAt" type="date" /></label><button type="submit">Add task</button></form><form class="form-card" data-detail-form="specialty-finding" data-id="${record.id}"><h3>Add finding</h3><label>Region<input name="region" /></label><label>Finding<input name="finding" required /></label><label>Stage<input name="stage" /></label><button type="submit">Add finding</button></form></div>`;
}
function appointmentInputs(record) {
  return `<div class="detail-tools"><form class="form-card" data-detail-form="appointment-update" data-id="${record.id}"><h3>Appointment input</h3><label>Status<select name="status"><option value="scheduled">scheduled</option><option value="confirmed">confirmed</option><option value="checked-in">checked-in</option><option value="completed">completed</option><option value="waitlist">waitlist</option><option value="no-show">no-show</option></select></label><label>Room<input name="room" value="${record.room || ""}" /></label><label>Assigned vet<input name="assignedVet" value="${record.assignedVet || ""}" /></label><label>Notes<textarea name="notes">${record.notes || ""}</textarea></label><button type="submit">Save appointment</button></form><form class="form-card" data-detail-form="appointment-staff" data-id="${record.id}"><h3>Add staff</h3><label>Staff member<input name="staff" required /></label><button type="submit">Add staff</button></form></div>`;
}
function messageInputs(record) {
  return `<div class="detail-tools"><form class="form-card" data-detail-form="message-update" data-id="${record.id}"><h3>Message input</h3><label>Status<select name="status"><option value="draft">draft</option><option value="queued">queued</option><option value="sent">sent</option><option value="replied">replied</option></select></label><label>Language<input name="language" value="${record.language || ""}" /></label><label>Summary<textarea name="summary">${record.summary || ""}</textarea></label><label class="checkbox-line"><input name="requiresReply" type="checkbox" value="true" ${record.requiresReply ? "checked" : ""} /> Requires reply</label><label class="checkbox-line"><input name="translated" type="checkbox" value="true" ${record.translated ? "checked" : ""} /> Translated</label><button type="submit">Save message</button></form></div>`;
}
function inventoryInputs(record) {
  return `<div class="detail-tools"><form class="form-card" data-detail-form="inventory-update" data-id="${record.id}"><h3>Inventory input</h3><label>Reorder threshold<input name="reorderThreshold" type="number" value="${record.reorderThreshold || 0}" /></label><label>Supplier<input name="supplierName" value="${record.supplierName || ""}" /></label><label>Dosing instructions<textarea name="dosingInstructions">${record.dosingInstructions || ""}</textarea></label><button type="submit">Save inventory info</button></form><form class="form-card" data-detail-form="inventory-movement" data-id="${record.id}"><h3>Add movement</h3><label>Type<select name="movementType"><option value="receive">receive</option><option value="dispense">dispense</option><option value="wastage">wastage</option><option value="stocktake">stocktake</option></select></label><label>Units<input name="units" type="number" required /></label><label>Warehouse<input name="warehouse" placeholder="Main Pharmacy" /></label><label>Reason<input name="reason" required /></label><label>Patient ID<input name="patientId" placeholder="pat_001 for controlled logs" /></label><button type="submit">Add movement</button></form></div>`;
}
function purchaseOrderInputs(record) {
  return `<div class="detail-tools"><form class="form-card" data-detail-form="purchase-order-update" data-id="${record.id}"><h3>PO input</h3><label>Approval<select name="approvalStatus"><option value="pending">pending</option><option value="approved">approved</option></select></label><label>Receiving<select name="receivingStatus"><option value="ordered">ordered</option><option value="receiving">receiving</option><option value="received">received</option></select></label><label>Invoice match<select name="invoiceMatchStatus"><option value="pending">pending</option><option value="matched">matched</option></select></label><label>Invoice reference<input name="invoiceReference" value="${record.invoiceReference || ""}" /></label><button type="submit">Save purchase order</button></form></div>`;
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
    lab: labInputs,
    specialty: specialtyInputs,
    appointment: appointmentInputs,
    message: messageInputs,
    inventory: inventoryInputs,
    purchaseOrder: purchaseOrderInputs,
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
  if (type === "lab") {
    panel.querySelector('[name="status"]').value = record.status || "ordered";
    panel.querySelector('[name="parserStatus"]').value =
      record.parserStatus || "manual-entry";
  }
  if (type === "specialty") {
    panel.querySelector('[name="status"]').value = record.status || "active";
  }
  if (type === "appointment") {
    panel.querySelector('[name="status"]').value = record.status || "scheduled";
  }
  if (type === "message") {
    panel.querySelector('[name="status"]').value = record.status || "draft";
  }
  if (type === "purchaseOrder") {
    panel.querySelector('[name="approvalStatus"]').value =
      record.approvalStatus || "pending";
    panel.querySelector('[name="receivingStatus"]').value =
      record.receivingStatus || "ordered";
    panel.querySelector('[name="invoiceMatchStatus"]').value =
      record.invoiceMatchStatus || "pending";
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
function labRow(record) {
  const statusClass = record.riskStatus === "critical" ? "alert" : "ok";
  const reviewAction =
    record.status === "reviewed"
      ? ""
      : `<button class="text-button" type="button" data-review-lab-id="${record.id}">Mark reviewed</button>`;
  const shareAction = record.sharedWithOwner
    ? ""
    : `<button class="text-button" type="button" data-share-lab-id="${record.id}">Share</button>`;
  return `<article class="record-row"><header><div><h3>${record.patient?.name || "Patient"} · ${record.panelName}</h3><p class="record-meta">${record.testType} · ${record.provider} · ${record.sampleType}</p></div><div class="visit-actions"><span class="${statusClass}">${record.riskStatus}</span>${reviewAction}${shareAction}<button class="text-button" type="button" data-detail-type="lab" data-detail-id="${record.id}">Details</button></div></header><p class="record-meta">Status ${record.status} · Results ${record.resultCount} · Critical ${record.criticalCount} · Parser ${record.parserStatus}</p><p class="record-meta">Interpretation: ${record.interpretation?.summary || "Interpretation open"}</p><div class="badges"><span class="badge">${record.source}</span><span class="badge">${record.country}</span><span class="badge">${record.sharedWithOwner ? "owner shared" : "internal"}</span></div></article>`;
}
function specialtyRow(record) {
  const statusClass = ["completed", "monitoring"].includes(record.riskStatus)
    ? "ok"
    : "alert";
  const completeAction =
    record.status === "completed"
      ? ""
      : `<button class="text-button" type="button" data-complete-specialty-id="${record.id}">Complete</button>`;
  const closeTasksAction = record.openTaskCount
    ? `<button class="text-button" type="button" data-close-specialty-tasks-id="${record.id}">Close tasks</button>`
    : "";
  return `<article class="record-row"><header><div><h3>${record.patient?.name || "Patient"} · ${record.title}</h3><p class="record-meta">${record.specialtyType} · ${record.clinician} · ${new Date(record.startedAt).toLocaleString()}</p></div><div class="visit-actions"><span class="${statusClass}">${record.riskStatus}</span>${closeTasksAction}${completeAction}<button class="text-button" type="button" data-detail-type="specialty" data-detail-id="${record.id}">Details</button></div></header><p class="record-meta">Status ${record.status} · Open tasks ${record.openTaskCount} · Attachments ${record.attachmentCount}</p><p class="record-meta">Plan: ${record.plan?.join(", ") || "No plan yet"}</p><div class="badges"><span class="badge">${record.specialtyType}</span><span class="badge">${record.taskCount} tasks</span><span class="badge">${record.qualityOfLifeScore ?? "no QoL"} QoL</span></div></article>`;
}
function appointmentRow(record) {
  const statusClass =
    ["scheduled", "confirmed", "completed"].includes(record.status) &&
    !["waitlist", "no-show", "walk-in", "high-risk"].includes(record.riskStatus)
      ? "ok"
      : "alert";
  const confirmAction =
    record.status === "confirmed" || record.status === "completed"
      ? ""
      : `<button class="text-button" type="button" data-confirm-appointment-id="${record.id}">Confirm</button>`;
  const checkInAction =
    record.status === "checked-in" || record.status === "completed"
      ? ""
      : `<button class="text-button" type="button" data-checkin-appointment-id="${record.id}">Check in</button>`;
  const noShowAction =
    record.status === "no-show" || record.status === "completed"
      ? ""
      : `<button class="text-button" type="button" data-no-show-appointment-id="${record.id}">No-show</button>`;
  return `<article class="record-row"><header><div><h3>${record.patient?.name || "Patient"} · ${record.title}</h3><p class="record-meta">${record.appointmentType} · ${record.assignedVet} · ${new Date(record.startsAt).toLocaleString()}</p></div><div class="visit-actions"><span class="${statusClass}">${record.riskStatus}</span>${confirmAction}${checkInAction}${noShowAction}<button class="text-button" type="button" data-detail-type="appointment" data-detail-id="${record.id}">Details</button></div></header><p class="record-meta">Room ${record.room} · ${record.channel} · Buffer ${record.bufferMinutes || 0} min · No-show risk ${record.noShowRisk}</p><p class="record-meta">Owner: ${record.owner?.displayName || "-"} · Notes: ${record.notes || "No operational notes"}</p><div class="badges"><span class="badge">${record.status}</span><span class="badge">${record.walkIn ? "walk-in" : "planned"}</span><span class="badge">${record.waitlistPriority || "no waitlist"}</span></div></article>`;
}
function messageRow(record) {
  const statusClass = ["sent", "replied"].includes(record.status)
    ? "ok"
    : "alert";
  const sendAction =
    record.status === "sent" || record.status === "replied"
      ? ""
      : `<button class="text-button" type="button" data-send-message-id="${record.id}">Send</button>`;
  const replyAction =
    !record.requiresReply || record.status === "replied"
      ? ""
      : `<button class="text-button" type="button" data-mark-message-replied-id="${record.id}">Mark replied</button>`;
  return `<article class="record-row"><header><div><h3>${record.patient?.name || "Patient"} · ${record.template}</h3><p class="record-meta">${record.channel} · ${record.language} · ${new Date(record.scheduledAt).toLocaleString()}</p></div><div class="visit-actions"><span class="${statusClass}">${record.riskStatus}</span>${sendAction}${replyAction}<button class="text-button" type="button" data-detail-type="message" data-detail-id="${record.id}">Details</button></div></header><p class="record-meta">${record.summary}</p><div class="badges"><span class="badge">${record.status}</span><span class="badge">${record.requiresReply ? "reply needed" : "one-way"}</span><span class="badge">${record.translated ? "translated" : "native"}</span></div></article>`;
}
function staffRow(record) {
  const statusClass = record.capacityState === "balanced" ? "ok" : "alert";
  return `<article class="record-row"><header><div><h3>${record.name}</h3><p class="record-meta">${record.role} · ${record.specialty} · Shift ${record.shift}</p></div><div class="visit-actions"><span class="${statusClass}">${record.capacityState}</span></div></header><p class="record-meta">Room ${record.room} · Workload ${record.workloadScore}% · Active appointments ${record.activeAppointments}</p><div class="badges"><span class="badge">${record.pendingTasks} pending tasks</span><span class="badge">${record.timeOffRequested ? "time-off request" : "available"}</span></div></article>`;
}
function inventoryRow(record) {
  const statusClass = record.riskStatus === "healthy" ? "ok" : "alert";
  const dispenseAction =
    record.totalUnits > 0
      ? `<button class="text-button" type="button" data-dispense-inventory-id="${record.id}">Dispense</button>`
      : "";
  const receiveAction = `<button class="text-button" type="button" data-receive-inventory-id="${record.id}">Receive</button>`;
  return `<article class="record-row"><header><div><h3>${record.medicationName}</h3><p class="record-meta">${record.atcvetCode || "No ATCvet"} · ${record.dosageForm} · ${record.concentration || "No concentration"}</p></div><div class="visit-actions"><span class="${statusClass}">${record.riskStatus}</span>${dispenseAction}${receiveAction}<button class="text-button" type="button" data-detail-type="inventory" data-detail-id="${record.id}">Details</button></div></header><p class="record-meta">On hand ${record.totalUnits} · Reorder ${record.reorderThreshold} · Warehouses ${record.warehouseCount} · Earliest expiry ${record.earliestExpiry || "-"}</p><div class="badges"><span class="badge">${record.prescriptionRequired ? "RX required" : "OTC"}</span><span class="badge">${record.controlledSubstance ? "controlled" : "standard"}</span><span class="badge">${money(record.totalValueCents)}</span></div></article>`;
}
function purchaseOrderRow(record) {
  const statusClass = record.riskStatus === "closed" ? "ok" : "alert";
  const approveAction =
    record.approvalStatus === "approved"
      ? ""
      : `<button class="text-button" type="button" data-approve-po-id="${record.id}">Approve</button>`;
  const receiveAction =
    record.receivingStatus === "received"
      ? ""
      : `<button class="text-button" type="button" data-receive-po-id="${record.id}">Receive</button>`;
  const matchAction =
    record.invoiceMatchStatus === "matched"
      ? ""
      : `<button class="text-button" type="button" data-match-po-id="${record.id}">Match invoice</button>`;
  return `<article class="record-row"><header><div><h3>${record.supplierName}</h3><p class="record-meta">${record.warehouse} · ${record.costMethod} · expected ${record.expectedAt ? new Date(record.expectedAt).toLocaleDateString() : "-"}</p></div><div class="visit-actions"><span class="${statusClass}">${record.riskStatus}</span>${approveAction}${receiveAction}${matchAction}<button class="text-button" type="button" data-detail-type="purchaseOrder" data-detail-id="${record.id}">Details</button></div></header><p class="record-meta">Lines ${record.lineCount} · Total ${money(record.totalCostCents)} · Invoice ${record.invoiceReference || "pending"}</p><div class="badges"><span class="badge">${record.approvalStatus}</span><span class="badge">${record.receivingStatus}</span><span class="badge">${record.invoiceMatchStatus}</span></div></article>`;
}
function controlledRow(record) {
  const statusClass = record.riskStatus === "logged" ? "ok" : "alert";
  return `<article class="record-row"><header><div><h3>${record.inventoryItem?.medicationName || "Controlled item"}</h3><p class="record-meta">${record.patient?.name || "No patient"} · ${record.actor} · ${new Date(record.at).toLocaleString()}</p></div><div class="visit-actions"><span class="${statusClass}">${record.riskStatus}</span><button class="text-button" type="button" data-detail-type="controlled" data-detail-id="${record.id}">Details</button></div></header><p class="record-meta">${record.action} ${record.units} unit(s) · Remaining ${record.remainingUnits}</p><div class="badges"><span class="badge">${record.authorityReportStatus}</span><span class="badge">${record.reconciliationStatus}</span></div></article>`;
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
  const labItems = latestState.labs
    .filter((record) => record.patientId === patient.id)
    .map(
      (record) =>
        `<article class="timeline-item"><span>${new Date(record.orderedAt).toLocaleDateString()}</span><strong>${record.panelName}</strong><p>${record.riskStatus} · ${record.resultCount} results · ${record.provider}</p><small>F095-F108 laboratory workflow</small></article>`,
    )
    .join("");
  const specialtyItems = latestState.specialties
    .filter((record) => record.patientId === patient.id)
    .map(
      (record) =>
        `<article class="timeline-item"><span>${new Date(record.startedAt).toLocaleDateString()}</span><strong>${record.specialtyType}: ${record.title}</strong><p>${record.riskStatus} · ${record.openTaskCount} open tasks</p><small>F109-F132 specialty workflow</small></article>`,
    )
    .join("");
  const appointmentItems = latestState.appointments
    .filter((record) => record.patientId === patient.id)
    .map(
      (record) =>
        `<article class="timeline-item"><span>${new Date(record.startsAt).toLocaleDateString()}</span><strong>${record.title}</strong><p>${record.status} · ${record.room} · ${record.assignedVet}</p><small>F133-F150 scheduling workflow</small></article>`,
    )
    .join("");
  const messageItems = latestState.clientMessages
    .filter((record) => record.patientId === patient.id)
    .map(
      (record) =>
        `<article class="timeline-item"><span>${new Date(record.scheduledAt).toLocaleDateString()}</span><strong>${record.channel} message</strong><p>${record.status} · ${record.template}</p><small>F151-F161 client communication</small></article>`,
    )
    .join("");
  const controlledItems = latestState.controlledLog
    .filter((record) => record.patientId === patient.id)
    .map(
      (record) =>
        `<article class="timeline-item"><span>${new Date(record.at).toLocaleDateString()}</span><strong>Controlled drug: ${record.inventoryItem?.medicationName || "Medication"}</strong><p>${record.action} ${record.units} unit(s) · remaining ${record.remainingUnits}</p><small>F188-F191 controlled substances</small></article>`,
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
    labItems ||
    specialtyItems ||
    appointmentItems ||
    messageItems ||
    controlledItems ||
    weightItems
    ? `${visitItems}${vaccineItems}${rxItems}${surgeryItems}${stayItems}${diagnosticItems}${labItems}${specialtyItems}${appointmentItems}${messageItems}${controlledItems}${weightItems}`
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
function fillAppointmentSelect(select, appointments) {
  if (!select) return;
  select.innerHTML = ['<option value="">No linked appointment</option>']
    .concat(
      appointments.map(
        (record) =>
          `<option value="${record.id}">${record.patient?.name || "Patient"} · ${record.title} · ${record.status}</option>`,
      ),
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
      renderLabs();
      renderSpecialties();
      renderOperations();
      renderInventory();
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
      "[data-mark-vaccine-id], [data-complete-surgery-id], [data-start-recovery-id], [data-complete-stay-tasks-id], [data-discharge-stay-id], [data-generate-thumbnail-id], [data-finalize-diagnostic-id], [data-review-lab-id], [data-share-lab-id], [data-complete-specialty-id], [data-close-specialty-tasks-id], [data-confirm-appointment-id], [data-checkin-appointment-id], [data-no-show-appointment-id], [data-send-message-id], [data-mark-message-replied-id], [data-dispense-inventory-id], [data-receive-inventory-id], [data-approve-po-id], [data-receive-po-id], [data-match-po-id]",
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
      if (button.dataset.reviewLabId) {
        const lab = latestState.labs.find(
          (entry) => entry.id === button.dataset.reviewLabId,
        );
        await fetchJson(`/clinic/labs/${button.dataset.reviewLabId}`, {
          method: "PATCH",
          body: JSON.stringify({
            status: "reviewed",
            parserStatus: lab?.parserStatus || "manual-entry",
            interpretation: {
              ...(lab?.interpretation || {}),
              summary:
                lab?.interpretation?.summary ||
                "Reviewed by clinician. No additional interpretation entered.",
              aiStatus: "reviewed",
            },
          }),
        });
        selectedPatientId = lab?.patientId || selectedPatientId;
        setStatus("Lab marked reviewed.");
      }
      if (button.dataset.shareLabId) {
        const lab = latestState.labs.find(
          (entry) => entry.id === button.dataset.shareLabId,
        );
        await fetchJson(`/clinic/labs/${button.dataset.shareLabId}`, {
          method: "PATCH",
          body: JSON.stringify({ sharedWithOwner: true }),
        });
        selectedPatientId = lab?.patientId || selectedPatientId;
        setStatus("Lab shared with owner.");
      }
      if (button.dataset.completeSpecialtyId) {
        const record = latestState.specialties.find(
          (entry) => entry.id === button.dataset.completeSpecialtyId,
        );
        await fetchJson(
          `/clinic/specialties/${button.dataset.completeSpecialtyId}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              status: "completed",
              tasks: (record?.tasks || []).map((task) => ({
                ...task,
                done: true,
              })),
            }),
          },
        );
        selectedPatientId = record?.patientId || selectedPatientId;
        setStatus("Specialty record completed.");
      }
      if (button.dataset.closeSpecialtyTasksId) {
        const record = latestState.specialties.find(
          (entry) => entry.id === button.dataset.closeSpecialtyTasksId,
        );
        await fetchJson(
          `/clinic/specialties/${button.dataset.closeSpecialtyTasksId}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              tasks: (record?.tasks || []).map((task) => ({
                ...task,
                done: true,
              })),
            }),
          },
        );
        selectedPatientId = record?.patientId || selectedPatientId;
        setStatus("Specialty tasks closed.");
      }
      if (button.dataset.confirmAppointmentId) {
        const record = latestState.appointments.find(
          (entry) => entry.id === button.dataset.confirmAppointmentId,
        );
        await fetchJson(
          `/clinic/appointments/${button.dataset.confirmAppointmentId}`,
          {
            method: "PATCH",
            body: JSON.stringify({ status: "confirmed" }),
          },
        );
        selectedPatientId = record?.patientId || selectedPatientId;
        setStatus("Appointment confirmed.");
      }
      if (button.dataset.checkinAppointmentId) {
        const record = latestState.appointments.find(
          (entry) => entry.id === button.dataset.checkinAppointmentId,
        );
        await fetchJson(
          `/clinic/appointments/${button.dataset.checkinAppointmentId}`,
          {
            method: "PATCH",
            body: JSON.stringify({ status: "checked-in" }),
          },
        );
        selectedPatientId = record?.patientId || selectedPatientId;
        setStatus("Patient checked in.");
      }
      if (button.dataset.noShowAppointmentId) {
        const record = latestState.appointments.find(
          (entry) => entry.id === button.dataset.noShowAppointmentId,
        );
        await fetchJson(
          `/clinic/appointments/${button.dataset.noShowAppointmentId}`,
          {
            method: "PATCH",
            body: JSON.stringify({ status: "no-show", noShowRisk: "high" }),
          },
        );
        selectedPatientId = record?.patientId || selectedPatientId;
        setStatus("Appointment marked as no-show.");
      }
      if (button.dataset.sendMessageId) {
        const record = latestState.clientMessages.find(
          (entry) => entry.id === button.dataset.sendMessageId,
        );
        await fetchJson(
          `/clinic/client-messages/${button.dataset.sendMessageId}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              status: "sent",
              sentAt: new Date().toISOString(),
            }),
          },
        );
        selectedPatientId = record?.patientId || selectedPatientId;
        setStatus("Client message sent.");
      }
      if (button.dataset.markMessageRepliedId) {
        const record = latestState.clientMessages.find(
          (entry) => entry.id === button.dataset.markMessageRepliedId,
        );
        await fetchJson(
          `/clinic/client-messages/${button.dataset.markMessageRepliedId}`,
          {
            method: "PATCH",
            body: JSON.stringify({ status: "replied" }),
          },
        );
        selectedPatientId = record?.patientId || selectedPatientId;
        setStatus("Reply logged.");
      }
      if (button.dataset.dispenseInventoryId) {
        const record = latestState.inventoryItems.find(
          (entry) => entry.id === button.dataset.dispenseInventoryId,
        );
        const warehouses = (record?.warehouses || []).map((warehouse, index) =>
          index === 0
            ? {
                ...warehouse,
                onHandUnits: Math.max(
                  0,
                  Number(warehouse.onHandUnits || 0) - 1,
                ),
              }
            : warehouse,
        );
        const totalUnits = warehouses.reduce(
          (sum, warehouse) => sum + Number(warehouse.onHandUnits || 0),
          0,
        );
        const movements = [
          ...(record?.movements || []),
          {
            at: new Date().toISOString(),
            type: "dispense",
            units: -1,
            warehouse: warehouses[0]?.location || "Main Pharmacy",
            reason: "Manual dispense from UI",
          },
        ];
        await fetchJson(
          `/clinic/inventory-items/${button.dataset.dispenseInventoryId}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              warehouses,
              movements,
              controlledEntry: record?.controlledSubstance
                ? {
                    patientId: selectedPatientId,
                    action: "dispense",
                    units: 1,
                    remainingUnits: totalUnits,
                    note: "UI dispense action",
                  }
                : null,
            }),
          },
        );
        setStatus("Inventory dispensed.");
      }
      if (button.dataset.receiveInventoryId) {
        const record = latestState.inventoryItems.find(
          (entry) => entry.id === button.dataset.receiveInventoryId,
        );
        const warehouses = (record?.warehouses || []).map((warehouse, index) =>
          index === 0
            ? {
                ...warehouse,
                onHandUnits: Number(warehouse.onHandUnits || 0) + 5,
              }
            : warehouse,
        );
        const totalUnits = warehouses.reduce(
          (sum, warehouse) => sum + Number(warehouse.onHandUnits || 0),
          0,
        );
        const movements = [
          ...(record?.movements || []),
          {
            at: new Date().toISOString(),
            type: "receive",
            units: 5,
            warehouse: warehouses[0]?.location || "Main Pharmacy",
            reason: "Manual receiving from UI",
          },
        ];
        await fetchJson(
          `/clinic/inventory-items/${button.dataset.receiveInventoryId}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              warehouses,
              movements,
              controlledEntry: record?.controlledSubstance
                ? {
                    patientId: null,
                    action: "receive",
                    units: 5,
                    remainingUnits: totalUnits,
                    note: "UI receive action",
                  }
                : null,
            }),
          },
        );
        setStatus("Inventory received.");
      }
      if (button.dataset.approvePoId) {
        await fetchJson(
          `/clinic/purchase-orders/${button.dataset.approvePoId}`,
          {
            method: "PATCH",
            body: JSON.stringify({ approvalStatus: "approved" }),
          },
        );
        setStatus("Purchase order approved.");
      }
      if (button.dataset.receivePoId) {
        await fetchJson(
          `/clinic/purchase-orders/${button.dataset.receivePoId}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              receivingStatus: "received",
              receivedAt: new Date().toISOString(),
            }),
          },
        );
        setStatus("Purchase order received.");
      }
      if (button.dataset.matchPoId) {
        await fetchJson(`/clinic/purchase-orders/${button.dataset.matchPoId}`, {
          method: "PATCH",
          body: JSON.stringify({
            invoiceMatchStatus: "matched",
            invoiceReference: `INV-${Date.now().toString(36).toUpperCase()}`,
          }),
        });
        setStatus("Invoice matched.");
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
  if (type === "lab") data.sharedWithOwner = data.sharedWithOwner === "true";
  if (type === "appointment") {
    data.recurring = data.recurring === "true";
    data.walkIn = data.walkIn === "true";
    data.surgeryBlock = data.surgeryBlock === "true";
  }
  if (type === "message") {
    data.requiresReply = data.requiresReply === "true";
    data.translated = data.translated === "true";
  }
  if (type === "inventory") {
    data.prescriptionRequired = data.prescriptionRequired === "true";
    data.controlledSubstance = data.controlledSubstance === "true";
  }
  const endpoints = {
    owner: "/clinic/owners",
    patient: "/clinic/patients",
    visit: "/clinic/visits",
    vaccination: "/clinic/vaccinations",
    prescription: "/clinic/prescriptions",
    surgery: "/clinic/surgeries",
    hospitalization: "/clinic/hospitalizations",
    diagnostic: "/clinic/diagnostics",
    lab: "/clinic/labs",
    specialty: "/clinic/specialties",
    appointment: "/clinic/appointments",
    message: "/clinic/client-messages",
    inventory: "/clinic/inventory-items",
    purchaseOrder: "/clinic/purchase-orders",
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
    type === "diagnostic" ||
    type === "lab" ||
    type === "specialty" ||
    type === "appointment" ||
    type === "message"
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
  if (type === "lab") switchView("labs");
  if (type === "specialty") switchView("specialties");
  if (type === "appointment" || type === "message") switchView("operations");
  if (type === "inventory" || type === "purchaseOrder") switchView("inventory");
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
      if (form.dataset.detailForm === "lab-update") {
        const lab = latestState.labs.find((entry) => entry.id === id);
        await fetchJson(`/clinic/labs/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            status: data.status,
            parserStatus: data.parserStatus,
            sharedWithOwner: data.sharedWithOwner === "true",
            interpretation: {
              ...(lab?.interpretation || {}),
              summary: data.interpretation,
              aiStatus: data.interpretation ? "reviewed" : "not-run",
            },
          }),
        });
        setStatus("Lab info saved.");
      }
      if (form.dataset.detailForm === "lab-result") {
        const lab = latestState.labs.find((entry) => entry.id === id);
        const value = data.value === "" ? null : Number(data.value || 0);
        const referenceLow =
          data.referenceLow === "" ? null : Number(data.referenceLow || 0);
        const referenceHigh =
          data.referenceHigh === "" ? null : Number(data.referenceHigh || 0);
        const flag =
          value != null && referenceHigh != null && value > referenceHigh
            ? "high"
            : value != null && referenceLow != null && value < referenceLow
              ? "low"
              : "normal";
        const results = [
          ...(lab?.results || []),
          {
            analyte: data.analyte,
            value,
            unit: data.unit,
            referenceLow,
            referenceHigh,
            flag,
          },
        ];
        await fetchJson(`/clinic/labs/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ results, status: "received" }),
        });
        form.reset();
        setStatus("Lab result added.");
      }
      if (form.dataset.detailForm === "lab-alert") {
        const lab = latestState.labs.find((entry) => entry.id === id);
        const criticalAlerts = [...(lab?.criticalAlerts || []), data.alert];
        await fetchJson(`/clinic/labs/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ criticalAlerts }),
        });
        form.reset();
        setStatus("Lab alert added.");
      }
      if (form.dataset.detailForm === "specialty-update") {
        await fetchJson(`/clinic/specialties/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            status: data.status,
            qualityOfLifeScore: data.qualityOfLifeScore
              ? Number(data.qualityOfLifeScore)
              : null,
            plan: splitTags(data.plan),
          }),
        });
        setStatus("Specialty info saved.");
      }
      if (form.dataset.detailForm === "specialty-task") {
        const record = latestState.specialties.find((entry) => entry.id === id);
        const tasks = [
          ...(record?.tasks || []),
          { label: data.task, dueAt: data.dueAt || null, done: false },
        ];
        await fetchJson(`/clinic/specialties/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ tasks }),
        });
        form.reset();
        setStatus("Specialty task added.");
      }
      if (form.dataset.detailForm === "specialty-finding") {
        const record = latestState.specialties.find((entry) => entry.id === id);
        const findings = [
          ...(record?.findings || []),
          { region: data.region, finding: data.finding, stage: data.stage },
        ];
        await fetchJson(`/clinic/specialties/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ findings }),
        });
        form.reset();
        setStatus("Specialty finding added.");
      }
      if (form.dataset.detailForm === "appointment-update") {
        await fetchJson(`/clinic/appointments/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            status: data.status,
            room: data.room,
            assignedVet: data.assignedVet,
            notes: data.notes,
          }),
        });
        setStatus("Appointment saved.");
      }
      if (form.dataset.detailForm === "appointment-staff") {
        const record = latestState.appointments.find(
          (entry) => entry.id === id,
        );
        const assignedStaff = [...(record?.assignedStaff || []), data.staff];
        await fetchJson(`/clinic/appointments/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ assignedStaff }),
        });
        form.reset();
        setStatus("Staff added to appointment.");
      }
      if (form.dataset.detailForm === "message-update") {
        await fetchJson(`/clinic/client-messages/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            status: data.status,
            language: data.language,
            summary: data.summary,
            requiresReply: data.requiresReply === "true",
            translated: data.translated === "true",
            sentAt: data.status === "sent" ? new Date().toISOString() : null,
          }),
        });
        setStatus("Client message saved.");
      }
      if (form.dataset.detailForm === "inventory-update") {
        await fetchJson(`/clinic/inventory-items/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            reorderThreshold: Number(data.reorderThreshold || 0),
            supplierName: data.supplierName,
            dosingInstructions: data.dosingInstructions,
          }),
        });
        setStatus("Inventory info saved.");
      }
      if (form.dataset.detailForm === "inventory-movement") {
        const record = latestState.inventoryItems.find(
          (entry) => entry.id === id,
        );
        const delta = Number(data.units || 0);
        const signedUnits =
          data.movementType === "receive" ? Math.abs(delta) : -Math.abs(delta);
        const warehouses = (record?.warehouses || []).map((warehouse, index) =>
          index === 0
            ? {
                ...warehouse,
                location: data.warehouse || warehouse.location,
                onHandUnits:
                  data.movementType === "receive"
                    ? Number(warehouse.onHandUnits || 0) + Math.abs(delta)
                    : Math.max(
                        0,
                        Number(warehouse.onHandUnits || 0) - Math.abs(delta),
                      ),
              }
            : warehouse,
        );
        const totalUnits = warehouses.reduce(
          (sum, warehouse) => sum + Number(warehouse.onHandUnits || 0),
          0,
        );
        const movements = [
          ...(record?.movements || []),
          {
            at: new Date().toISOString(),
            type: data.movementType,
            units: signedUnits,
            warehouse:
              data.warehouse ||
              record?.warehouses?.[0]?.location ||
              "Main Pharmacy",
            reason: data.reason,
          },
        ];
        await fetchJson(`/clinic/inventory-items/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            warehouses,
            movements,
            controlledEntry: record?.controlledSubstance
              ? {
                  patientId: data.patientId || null,
                  action: data.movementType,
                  units: Math.abs(delta),
                  remainingUnits: totalUnits,
                  note: data.reason,
                }
              : null,
          }),
        });
        form.reset();
        setStatus("Inventory movement added.");
      }
      if (form.dataset.detailForm === "purchase-order-update") {
        await fetchJson(`/clinic/purchase-orders/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            approvalStatus: data.approvalStatus,
            receivingStatus: data.receivingStatus,
            invoiceMatchStatus: data.invoiceMatchStatus,
            invoiceReference: data.invoiceReference,
            receivedAt:
              data.receivingStatus === "received"
                ? new Date().toISOString()
                : null,
          }),
        });
        setStatus("Purchase order saved.");
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
        "lab-update": "lab",
        "lab-result": "lab",
        "lab-alert": "lab",
        "specialty-update": "specialty",
        "specialty-task": "specialty",
        "specialty-finding": "specialty",
        "appointment-update": "appointment",
        "appointment-staff": "appointment",
        "message-update": "message",
        "inventory-update": "inventory",
        "inventory-movement": "inventory",
        "purchase-order-update": "purchaseOrder",
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
function renderLabs() {
  const summary = latestState.labSummary;
  if (!summary) return;
  const labs = filtered(latestState.labs);
  const alerts = filtered(summary.alerts);
  document.querySelector("#lab-metrics").innerHTML = [
    metric("Lab records", summary.counts.labs),
    metric("Pending", summary.counts.pending),
    metric("Critical", summary.counts.critical),
  ].join("");
  document.querySelector("#lab-coverage").innerHTML = summary.featureCoverage
    .map(
      (coverage) =>
        `<article class="card"><div class="badges"><span class="badge">${coverage.range}</span></div><h3>${coverage.area}</h3><p>${coverage.description}</p></article>`,
    )
    .join("");
  document.querySelector("#lab-alerts").innerHTML =
    alerts.map(labRow).join("") || '<p class="muted">No lab alerts.</p>';
  document.querySelector("#lab-list").innerHTML =
    `${recordCount(labs)}${labs.map(labRow).join("") || '<p class="muted">No labs match the current search.</p>'}`;
}
function renderSpecialties() {
  const summary = latestState.specialtySummary;
  if (!summary) return;
  const records = filtered(latestState.specialties);
  const alerts = filtered(summary.alerts);
  document.querySelector("#specialty-metrics").innerHTML = [
    metric("Specialty records", summary.counts.records),
    metric("Active", summary.counts.active),
    metric("Open tasks", summary.counts.openTasks),
  ].join("");
  document.querySelector("#specialty-coverage").innerHTML =
    summary.featureCoverage
      .map(
        (coverage) =>
          `<article class="card"><div class="badges"><span class="badge">${coverage.range}</span></div><h3>${coverage.area}</h3><p>${coverage.description}</p></article>`,
      )
      .join("");
  document.querySelector("#specialty-alerts").innerHTML =
    alerts.map(specialtyRow).join("") ||
    '<p class="muted">No specialty alerts.</p>';
  document.querySelector("#specialty-list").innerHTML =
    `${recordCount(records)}${records.map(specialtyRow).join("") || '<p class="muted">No specialty records match the current search.</p>'}`;
}
function renderOperations() {
  const summary = latestState.operationsSummary;
  if (!summary) return;
  const appointments = filtered(latestState.appointments);
  const messages = filtered(latestState.clientMessages);
  const staff = filtered(latestState.staffRoster);
  const alerts = filtered(summary.alerts);
  document.querySelector("#operations-metrics").innerHTML = [
    metric("Appointments", summary.counts.appointments),
    metric("Today", summary.counts.todayAppointments),
    metric("Waitlist", summary.counts.waitlist),
    metric("Queued messages", summary.counts.queuedMessages),
  ].join("");
  document.querySelector("#operations-coverage").innerHTML =
    summary.featureCoverage
      .map(
        (coverage) =>
          `<article class="card"><div class="badges"><span class="badge">${coverage.range}</span></div><h3>${coverage.area}</h3><p>${coverage.description}</p></article>`,
      )
      .join("");
  document.querySelector("#operations-alerts").innerHTML =
    alerts
      .map((record) =>
        record.assignedVet ? appointmentRow(record) : messageRow(record),
      )
      .join("") || '<p class="muted">No operational alerts.</p>';
  document.querySelector("#appointment-list").innerHTML =
    `${recordCount(appointments)}${appointments.map(appointmentRow).join("") || '<p class="muted">No appointments match the current search.</p>'}`;
  document.querySelector("#message-list").innerHTML =
    `${recordCount(messages)}${messages.map(messageRow).join("") || '<p class="muted">No client messages match the current search.</p>'}`;
  document.querySelector("#staff-list").innerHTML =
    `${recordCount(staff)}${staff.map(staffRow).join("") || '<p class="muted">No staff records match the current search.</p>'}`;
}
function renderInventory() {
  const summary = latestState.inventorySummary;
  if (!summary) return;
  const items = filtered(latestState.inventoryItems);
  const purchaseOrders = filtered(latestState.purchaseOrders);
  const controlledLog = filtered(latestState.controlledLog);
  const alerts = filtered(summary.alerts);
  document.querySelector("#inventory-metrics").innerHTML = [
    metric("Items", summary.counts.items),
    metric("Low stock", summary.counts.lowStock),
    metric("Controlled", summary.counts.controlled),
    metric("Open POs", summary.counts.openPurchaseOrders),
  ].join("");
  document.querySelector("#inventory-coverage").innerHTML =
    summary.featureCoverage
      .map(
        (coverage) =>
          `<article class="card"><div class="badges"><span class="badge">${coverage.range}</span></div><h3>${coverage.area}</h3><p>${coverage.description}</p></article>`,
      )
      .join("");
  document.querySelector("#inventory-alerts").innerHTML =
    alerts
      .map((record) =>
        record.medicationName
          ? inventoryRow(record)
          : record.supplierName
            ? purchaseOrderRow(record)
            : controlledRow(record),
      )
      .join("") || '<p class="muted">No inventory alerts.</p>';
  document.querySelector("#inventory-list").innerHTML =
    `${recordCount(items)}${items.map(inventoryRow).join("") || '<p class="muted">No inventory items match the current search.</p>'}`;
  document.querySelector("#purchase-order-list").innerHTML =
    `${recordCount(purchaseOrders)}${purchaseOrders.map(purchaseOrderRow).join("") || '<p class="muted">No purchase orders match the current search.</p>'}`;
  document.querySelector("#controlled-log-list").innerHTML =
    `${recordCount(controlledLog)}${controlledLog.map(controlledRow).join("") || '<p class="muted">No controlled-log entries match the current search.</p>'}`;
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
  if (latestState.labSummary?.alerts.length)
    items.push(
      queueItem(
        "labs",
        "Lab work pending",
        "Review pending results, critical alerts or owner sharing.",
        latestState.labSummary.alerts.length,
      ),
    );
  if (latestState.specialtySummary?.alerts.length)
    items.push(
      queueItem(
        "specialties",
        "Specialty work pending",
        "Close specialty tasks, drafts or quality-of-life reviews.",
        latestState.specialtySummary.alerts.length,
      ),
    );
  if (latestState.operationsSummary?.alerts.length)
    items.push(
      queueItem(
        "operations",
        "Operational follow-up",
        "Confirm bookings, work the waitlist and send client communications.",
        latestState.operationsSummary.alerts.length,
      ),
    );
  if (latestState.inventorySummary?.alerts.length)
    items.push(
      queueItem(
        "inventory",
        "Inventory attention needed",
        "Receive stock, clear reorder risk and reconcile controlled substances.",
        latestState.inventorySummary.alerts.length,
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
    labSummary,
    labs,
    inventorySummary,
    inventoryItems,
    purchaseOrders,
    controlledLog,
    operationsSummary,
    appointments,
    clientMessages,
    staffRoster,
    specialtySummary,
    specialties,
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
    fetchJson("/clinic/labs/summary"),
    fetchJson("/clinic/labs"),
    fetchJson("/clinic/inventory/summary"),
    fetchJson("/clinic/inventory-items"),
    fetchJson("/clinic/purchase-orders"),
    fetchJson("/clinic/controlled-log"),
    fetchJson("/clinic/operations/summary"),
    fetchJson("/clinic/appointments"),
    fetchJson("/clinic/client-messages"),
    fetchJson("/clinic/staff"),
    fetchJson("/clinic/specialties/summary"),
    fetchJson("/clinic/specialties"),
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
    labSummary,
    labs: labs.items,
    inventorySummary,
    inventoryItems: inventoryItems.items,
    purchaseOrders: purchaseOrders.items,
    controlledLog: controlledLog.items,
    operationsSummary,
    appointments: appointments.items,
    clientMessages: clientMessages.items,
    staffRoster: staffRoster.items,
    specialtySummary,
    specialties: specialties.items,
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
  fillSelect(
    document.querySelector("#lab-patient-options"),
    latestState.patients,
    "name",
  );
  fillSelect(
    document.querySelector("#specialty-patient-options"),
    latestState.patients,
    "name",
  );
  fillSelect(
    document.querySelector("#appointment-patient-options"),
    latestState.patients,
    "name",
  );
  fillSelect(
    document.querySelector("#message-patient-options"),
    latestState.patients,
    "name",
  );
  fillSelect(
    document.querySelector("#inventory-patient-options"),
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
  fillVisitSelect(
    document.querySelector("#lab-visit-options"),
    latestState.visits,
  );
  fillVisitSelect(
    document.querySelector("#specialty-visit-options"),
    latestState.visits,
  );
  fillVisitSelect(
    document.querySelector("#appointment-visit-options"),
    latestState.visits,
  );
  fillAppointmentSelect(
    document.querySelector("#message-appointment-options"),
    latestState.appointments,
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
    metric("Lab alerts", labSummary.alerts.length),
    metric("Inventory alerts", inventorySummary.alerts.length),
    metric("Operations alerts", operationsSummary.alerts.length),
    metric("Specialty alerts", specialtySummary.alerts.length),
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
  renderLabs();
  renderInventory();
  renderOperations();
  renderSpecialties();
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
