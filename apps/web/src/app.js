const apiBase = 'http://localhost:4100';
const viewTitles = {
  dashboard: 'Clinic Dashboard',
  patients: 'Patient Records',
  owners: 'Owner Records',
  visits: 'Visit Timeline',
  roadmap: 'Product Roadmap'
};

let selectedPatientId = null;
let latestState = { blueprint: null, summary: null, owners: [], patients: [], visits: [] };

async function fetchJson(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers || {}) }
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || `${path} unavailable`);
  return payload;
}

function metric(label, value) {
  return `<article class="metric"><strong>${value}</strong><span>${label}</span></article>`;
}

function setStatus(message, tone = 'ok') {
  const status = document.querySelector('#form-status');
  status.textContent = message;
  status.style.background = tone === 'error' ? '#be123c' : '#142033';
  if (message) window.setTimeout(() => { status.textContent = ''; }, 2800);
}

function phaseCard(phase) {
  return `<article class="card"><div class="badges"><span class="badge">${phase.code}</span><span class="badge">${phase.featureIds.join(', ')}</span></div><h3>${phase.title}</h3><p>${phase.goal}</p><ul>${phase.deliverables.map((item) => `<li>${item}</li>`).join('')}</ul></article>`;
}

function domainCard(domain) {
  return `<article class="card"><div class="badges"><span class="badge">${domain.status}</span><span class="badge">${domain.featureRange}</span></div><h3>${domain.title}</h3><p>${domain.summary}</p><p><strong>${domain.featureCount}</strong> vecori</p></article>`;
}

function ownerRow(owner) {
  return `<article class="record-row"><header><div><h3>${owner.displayName}</h3><p class="record-meta">${owner.phone || 'No phone'} · ${owner.email || 'No email'}</p></div><span class="badge">${owner.language}</span></header><p class="record-meta">${owner.address?.city || 'No city'} · Balance ${(owner.balanceCents / 100).toFixed(2)} EUR</p><div class="badges">${owner.tags.map((tag) => `<span class="badge">${tag}</span>`).join('')}</div></article>`;
}

function patientRow(patient) {
  const allergy = patient.allergies?.[0] ? `<span class="alert">Critical: ${patient.allergies[0].substance}</span>` : '<span class="ok">No critical allergy</span>';
  const weight = patient.weightHistory?.at(-1)?.weightKg ? `${patient.weightHistory.at(-1).weightKg} kg` : 'No weight';
  const active = patient.id === selectedPatientId ? ' selected' : '';
  return `<article class="record-row patient-row${active}" data-patient-card="${patient.id}"><header><div><h3>${patient.name}</h3><p class="record-meta">${patient.species} · ${patient.breed || 'Unknown breed'} · ${weight}</p></div>${allergy}</header><p class="record-meta">Microchip: ${patient.microchip || 'Not registered'} · Passport: ${patient.passportNumber || 'Not issued'}</p><p class="record-meta">Owner: ${patient.owners.map((owner) => owner.displayName).join(', ')}</p><div class="record-actions"><div class="badges">${patient.tags.map((tag) => `<span class="badge">${tag}</span>`).join('')}</div><button class="text-button" type="button" data-patient-id="${patient.id}">Open timeline</button></div></article>`;
}

function visitRow(visit) {
  const total = ((visit.totalCents || 0) / 100).toFixed(2);
  return `<article class="record-row"><header><div><h3>${visit.patient?.name || 'Patient'} · ${visit.visitType}</h3><p class="record-meta">${new Date(visit.startedAt).toLocaleString()} · ${visit.clinician}</p></div><span class="badge">${visit.status}</span></header><p>${visit.anamnesis || 'No anamnesis yet.'}</p><p class="record-meta">TPR: ${visit.physicalExam.temperatureC || '-'} C · ${visit.physicalExam.pulseBpm || '-'} bpm · ${visit.physicalExam.respirationRpm || '-'} rpm</p><p class="record-meta">Treatment: ${visit.treatmentPlan?.join(', ') || 'No plan yet'} · Total ${total} EUR</p></article>`;
}

function weightHistory(patient) {
  if (!patient.weightHistory?.length) return '<p class="muted">No weight entries yet.</p>';
  return `<div class="mini-table">${patient.weightHistory.map((entry) => `<div><span>${entry.date}</span><strong>${entry.weightKg} kg</strong></div>`).join('')}</div>`;
}

function patientTimeline(patient, visits) {
  const patientVisits = visits.filter((visit) => visit.patientId === patient.id).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const visitItems = patientVisits.map((visit) => `<article class="timeline-item"><span>${new Date(visit.startedAt).toLocaleDateString()}</span><strong>${visit.visitType}</strong><p>${visit.anamnesis || 'No anamnesis yet.'}</p><small>${visit.status} · ${visit.clinician}${visit.continuityFromVisitId ? ` · continuity from ${visit.continuityFromVisitId}` : ''}</small></article>`).join('');
  const weightItems = patient.weightHistory?.map((entry) => `<article class="timeline-item"><span>${entry.date}</span><strong>Weight recorded</strong><p>${entry.weightKg} kg</p><small>F008 weight trend</small></article>`).join('') || '';
  return visitItems || weightItems ? `${visitItems}${weightItems}` : '<p class="muted">No clinical timeline yet.</p>';
}

function renderPatientDetail() {
  const target = document.querySelector('#patient-detail');
  if (!target) return;
  const patients = latestState.patients;
  const visits = latestState.visits;
  const patient = patients.find((entry) => entry.id === selectedPatientId) || patients[0];
  if (!patient) {
    target.innerHTML = '<div class="empty-detail">Create a patient to see the clinical timeline.</div>';
    return;
  }
  selectedPatientId = patient.id;
  const allergyBanner = patient.allergies?.length
    ? `<div class="danger-banner"><strong>Critical allergy</strong><span>${patient.allergies.map((allergy) => `${allergy.substance}${allergy.note ? `: ${allergy.note}` : ''}`).join(' · ')}</span></div>`
    : '<div class="safe-banner"><strong>No critical allergies</strong><span>Clinical screens are clear for this patient.</span></div>';
  const owners = patient.owners.map((owner) => owner.displayName).join(', ') || 'No linked owner';
  target.innerHTML = `<div class="detail-header"><div><p class="eyebrow">Patient detail</p><h2>${patient.name}</h2><p class="record-meta">${patient.species} · ${patient.breed || 'Unknown breed'} · ${patient.status}</p></div><span class="badge">${patient.microchip || 'no-chip'}</span></div>${allergyBanner}<div class="detail-grid"><div><h3>Owners</h3><p class="record-meta">${owners}</p></div><div><h3>BCS</h3><p class="record-meta">${patient.bcs?.score || '-'} / ${patient.bcs?.scale || '1-9'}</p></div></div><h3>Weight trend</h3>${weightHistory(patient)}<h3>Clinical timeline</h3><div class="timeline-detail">${patientTimeline(patient, visits)}</div>`;
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function fillSelect(select, items, labelKey) {
  select.innerHTML = items.map((item) => `<option value="${item.id}">${item[labelKey]}</option>`).join('');
}

function switchView(view) {
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.view === view));
  document.querySelectorAll('.view').forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === view));
  document.querySelector('#view-title').textContent = viewTitles[view];
}

function bindTabs() {
  document.querySelectorAll('.nav-item').forEach((button) => {
    button.addEventListener('click', () => switchView(button.dataset.view));
  });
}

function bindPatientOpen() {
  document.querySelector('#patients-list')?.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-patient-id]');
    if (!button) return;
    selectedPatientId = button.dataset.patientId;
    renderLists();
    renderPatientDetail();
  });
  document.querySelector('#risk-list')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-patient-id]');
    if (!button) return;
    selectedPatientId = button.dataset.patientId;
    switchView('patients');
    renderLists();
    renderPatientDetail();
  });
}

async function submitForm(form) {
  const type = form.dataset.form;
  const endpoints = { owner: '/clinic/owners', patient: '/clinic/patients', visit: '/clinic/visits' };
  const created = await fetchJson(endpoints[type], { method: 'POST', body: JSON.stringify(formData(form)) });
  if (type === 'patient') selectedPatientId = created.id;
  if (type === 'visit') selectedPatientId = created.patientId;
  form.reset();
  setStatus(`${type} u ruajt me sukses.`);
  await render();
  if (type === 'patient' || type === 'visit') switchView('patients');
}

function bindForms() {
  document.querySelectorAll('form[data-form]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        await submitForm(form);
      } catch (error) {
        setStatus(error.message, 'error');
      }
    });
  });
}

function renderLists() {
  document.querySelector('#risk-list').innerHTML = latestState.patients.filter((patient) => patient.allergies?.length).map(patientRow).join('') || '<p class="muted">No critical patient signals.</p>';
  document.querySelector('#recent-visits').innerHTML = latestState.visits.slice(0, 4).map(visitRow).join('');
  document.querySelector('#patients-list').innerHTML = latestState.patients.map(patientRow).join('');
  document.querySelector('#owners-list').innerHTML = latestState.owners.map(ownerRow).join('');
  document.querySelector('#visits-list').innerHTML = latestState.visits.map(visitRow).join('');
}

async function render() {
  const [blueprint, summary, owners, patients, visits] = await Promise.all([
    fetchJson('/blueprint'),
    fetchJson('/clinic/summary'),
    fetchJson('/clinic/owners'),
    fetchJson('/clinic/patients'),
    fetchJson('/clinic/visits')
  ]);

  latestState = { blueprint, summary, owners: owners.items, patients: patients.items, visits: visits.items };
  if (!selectedPatientId && latestState.patients[0]) selectedPatientId = latestState.patients[0].id;

  document.querySelector('#api-status').textContent = 'API online';
  document.querySelector('#api-status').classList.remove('offline');
  fillSelect(document.querySelector('#owner-options'), latestState.owners, 'displayName');
  fillSelect(document.querySelector('#patient-options'), latestState.patients, 'name');

  document.querySelector('#metrics').innerHTML = [
    metric('Patients', summary.counts.patients),
    metric('Owners', summary.counts.owners),
    metric('Visits', summary.counts.visits),
    metric('Critical allergies', summary.counts.criticalAllergies)
  ].join('');

  document.querySelector('#clinic-summary').innerHTML = summary.featureCoverage.map((coverage) => `<article class="card"><div class="badges"><span class="badge">${coverage.range}</span></div><h3>${coverage.area}</h3><p>${coverage.description}</p></article>`).join('');
  renderLists();
  renderPatientDetail();
  document.querySelector('#phases').innerHTML = blueprint.phases.map(phaseCard).join('');
  document.querySelector('#domains').innerHTML = blueprint.domains.map(domainCard).join('');
}

bindTabs();
bindForms();
bindPatientOpen();
try {
  await render();
} catch (error) {
  document.querySelector('#api-status').textContent = 'API offline';
  document.querySelector('#api-status').classList.add('offline');
  document.querySelector('#metrics').innerHTML = metric('Start API', '4100');
  document.querySelector('#clinic-summary').innerHTML = `<article class="card"><h3>Nis API</h3><p>Starto API me <code>npm run dev:api</code>, pastaj rifresko faqen.</p></article>`;
  setStatus(error.message, 'error');
}
