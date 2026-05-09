async function loadBlueprint() {
  const response = await fetch('http://localhost:4100/blueprint');
  if (!response.ok) throw new Error('Blueprint API unavailable');
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

try {
  const blueprint = await loadBlueprint();
  document.querySelector('#metrics').innerHTML = [
    metric('Vecori ne inventar', blueprint.featureCount),
    metric('Domaine produkti', blueprint.domains.length),
    metric('Faza implementimi', blueprint.phases.length),
    metric('Burim i gjurmueshem', 'F001-F487')
  ].join('');
  document.querySelector('#phases').innerHTML = blueprint.phases.map(phaseCard).join('');
  document.querySelector('#domains').innerHTML = blueprint.domains.map(domainCard).join('');
} catch (error) {
  document.querySelector('#metrics').innerHTML = metric('API status', 'Offline');
  document.querySelector('#phases').innerHTML = `<article class="card"><h3>Nis API</h3><p>Starto API me <code>npm run dev:api</code>, pastaj rifresko faqen.</p></article>`;
}
