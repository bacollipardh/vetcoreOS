const apiBase = 'http://localhost:4100';

async function fetchJson(path) {
  const response = await fetch(`${apiBase}${path}`);
  if (!response.ok) throw new Error(`${path} unavailable`);
  return response.json();
}

function metric(label, value) {
  return `<article class="metric"><strong>${value}</strong><span>${label}</span></article>`;
}

function phaseCard(phase) {
  return `
    <article class="card">
      <div class="badges"><span class="badge">${phase.code}</span><span class="badge">${phase.featureIds.join(', ')}</span></div>
      <h3>${phase.title}</h3>
      <p>${phase.goal}</p>
      <ul>${phase.deliverables.map((item) => `<li>${item}</li>`).join('')}</ul>
    </article>`;
}

function domainCard(domain) {
  return `
    <article class="card">
      <div class="badges"><span class="badge">${domain.status}</span><span class="badge">${domain.featureRange}</span></div>
      <h3>${domain.title}</h3>
      <p>${domain.summary}</p>
      <p><strong>${domain.featureCount}</strong> vecori</p>
    </article>`;
}

function patientCard(patient) {
  const allergy = patient.allergies?.[0] ? `<span class="alert">Alergji: ${patient.allergies[0].substance}</span>` : '<span class="ok">Pa alergji kritike</span>';
  return `
    <article class="card record-card">
      <div class="badges"><span class="badge">${patient.species}</span><span class="badge">${patient.microchip}</span></div>
      <h3>${patient.name}</h3>
      <p>${patient.breed}, ${patient.sex}, status: ${patient.status}</p>
      <p>${allergy}</p>
      <p>Owner: ${patient.owners.map((owner) => owner.displayName).join(', ')}</p>
    </article>`;
}

function visitCard(visit) {
  return `
    <article class="card record-card">
      <div class="badges"><span class="badge">${visit.status}</span><span class="badge">${visit.visitType}</span></div>
      <h3>${visit.patient?.name || 'Patient'} - ${visit.clinician}</h3>
      <p>${visit.anamnesis}</p>
      <p>TPR: ${visit.physicalExam.temperatureC} C, ${visit.physicalExam.pulseBpm} bpm, ${visit.physicalExam.respirationRpm} rpm</p>
      <p>Total: ${(visit.totalCents / 100).toFixed(2)} EUR</p>
    </article>`;
}

try {
  const [blueprint, summary, patients, visits] = await Promise.all([
    fetchJson('/blueprint'),
    fetchJson('/clinic/summary'),
    fetchJson('/clinic/patients'),
    fetchJson('/clinic/visits')
  ]);

  document.querySelector('#metrics').innerHTML = [
    metric('Vecori ne inventar', blueprint.featureCount),
    metric('Paciente', summary.counts.patients),
    metric('Pronare', summary.counts.owners),
    metric('Vizita', summary.counts.visits)
  ].join('');

  document.querySelector('#clinic-summary').innerHTML = summary.featureCoverage.map((coverage) => `
    <article class="card">
      <div class="badges"><span class="badge">${coverage.range}</span></div>
      <h3>${coverage.area}</h3>
      <p>${coverage.description}</p>
    </article>`).join('');

  document.querySelector('#clinic-records').innerHTML = `
    <div>${patients.items.map(patientCard).join('')}</div>
    <div>${visits.items.map(visitCard).join('')}</div>`;

  document.querySelector('#phases').innerHTML = blueprint.phases.map(phaseCard).join('');
  document.querySelector('#domains').innerHTML = blueprint.domains.map(domainCard).join('');
} catch (error) {
  document.querySelector('#metrics').innerHTML = metric('API status', 'Offline');
  document.querySelector('#clinic-summary').innerHTML = `<article class="card"><h3>Nis API</h3><p>Starto API me <code>npm run dev:api</code>, pastaj rifresko faqen.</p></article>`;
}
