const apiBase = 'http://localhost:4100';
const viewTitles = {
  dashboard: 'Clinic Dashboard',
  patients: 'Patient Records',
  owners: 'Owner Records',
  visits: 'Visit Timeline',
  roadmap: 'Product Roadmap'
};

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
  return `<article class="record-row"><header><div><h3>${patient.name}</h3><p class="record-meta">${patient.species} · ${patient.breed || 'Unknown breed'} · ${weight}</p></div>${allergy}</header><p class="record-meta">Microchip: ${patient.microchip || 'Not registered'} · Passport: ${patient.passportNumber || 'Not issued'}</p><p class="record-meta">Owner: ${patient.owners.map((owner) => owner.displayName).join(', ')}</p><div class="badges">${patient.tags.map((tag) => `<span class="badge">${tag}</span>`).join('')}</div></article>`;
}

function visitRow(visit) {
  const total = ((visit.totalCents || 0) / 100).toFixed(2);
  return `<article class="record-row"><header><div><h3>${visit.patient?.name || 'Patient'} · ${visit.visitType}</h3><p class="record-meta">${new Date(visit.startedAt).toLocaleString()} · ${visit.clinician}</p></div><span class="badge">${visit.status}</span></header><p>${visit.anamnesis || 'No anamnesis yet.'}</p><p class="record-meta">TPR: ${visit.physicalExam.temperatureC || '-'} C · ${visit.physicalExam.pulseBpm || '-'} bpm · ${visit.physicalExam.respirationRpm || '-'} rpm</p><p class="record-meta">Treatment: ${visit.treatmentPlan?.join(', ') || 'No plan yet'} · Total ${total} EUR</p></article>`;
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function fillSelect(select, items, labelKey) {
  select.innerHTML = items.map((item) => `<option value="${item.id}">${item[labelKey]}</option>`).join('');
}

function bindTabs() {
  document.querySelectorAll('.nav-item').forEach((button) => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item === button));
      document.querySelectorAll('.view').forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === view));
      document.querySelector('#view-title').textContent = viewTitles[view];
    });
  });
}

async function submitForm(form) {
  const type = form.dataset.form;
  const endpoints = { owner: '/clinic/owners', patient: '/clinic/patients', visit: '/clinic/visits' };
  await fetchJson(endpoints[type], { method: 'POST', body: JSON.stringify(formData(form)) });
  form.reset();
  setStatus(`${type} u ruajt me sukses.`);
  await render();
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

async function render() {
  const [blueprint, summary, owners, patients, visits] = await Promise.all([
    fetchJson('/blueprint'),
    fetchJson('/clinic/summary'),
    fetchJson('/clinic/owners'),
    fetchJson('/clinic/patients'),
    fetchJson('/clinic/visits')
  ]);

  document.querySelector('#api-status').textContent = 'API online';
  document.querySelector('#api-status').classList.remove('offline');
  fillSelect(document.querySelector('#owner-options'), owners.items, 'displayName');
  fillSelect(document.querySelector('#patient-options'), patients.items, 'name');

  document.querySelector('#metrics').innerHTML = [
    metric('Patients', summary.counts.patients),
    metric('Owners', summary.counts.owners),
    metric('Visits', summary.counts.visits),
    metric('Critical allergies', summary.counts.criticalAllergies)
  ].join('');

  document.querySelector('#clinic-summary').innerHTML = summary.featureCoverage.map((coverage) => `<article class="card"><div class="badges"><span class="badge">${coverage.range}</span></div><h3>${coverage.area}</h3><p>${coverage.description}</p></article>`).join('');
  document.querySelector('#risk-list').innerHTML = patients.items.filter((patient) => patient.allergies?.length).map(patientRow).join('') || '<p class="muted">No critical patient signals.</p>';
  document.querySelector('#recent-visits').innerHTML = visits.items.slice(0, 4).map(visitRow).join('');
  document.querySelector('#patients-list').innerHTML = patients.items.map(patientRow).join('');
  document.querySelector('#owners-list').innerHTML = owners.items.map(ownerRow).join('');
  document.querySelector('#visits-list').innerHTML = visits.items.map(visitRow).join('');
  document.querySelector('#phases').innerHTML = blueprint.phases.map(phaseCard).join('');
  document.querySelector('#domains').innerHTML = blueprint.domains.map(domainCard).join('');
}

bindTabs();
bindForms();
try {
  await render();
} catch (error) {
  document.querySelector('#api-status').textContent = 'API offline';
  document.querySelector('#api-status').classList.add('offline');
  document.querySelector('#metrics').innerHTML = metric('Start API', '4100');
  document.querySelector('#clinic-summary').innerHTML = `<article class="card"><h3>Nis API</h3><p>Starto API me <code>npm run dev:api</code>, pastaj rifresko faqen.</p></article>`;
  setStatus(error.message, 'error');
}
