export const vetCoreDomains = [
  { code: 'EMR', title: 'Berthama Mjekesore', featureRange: 'F001-F132', featureCount: 132, status: 'skeleton', summary: 'Pacientet, pronaret, vizitat, vaksinimi, recetat, kirurgjia, hospitalizimi, diagnostika, laboratori dhe specialitetet.' },
  { code: 'OPS', title: 'Operacione & Planifikim', featureRange: 'F133-F168', featureCount: 36, status: 'planned', summary: 'Kalendar, booking online, komunikim me klientin dhe menaxhim i stafit.' },
  { code: 'RX-STOCK', title: 'Inventar & Farmaci', featureRange: 'F169-F191', featureCount: 23, status: 'planned', summary: 'Katalog medikamentesh, lot/expiry, FEFO, furnizim dhe substanca te kontrolluara.' },
  { code: 'FIN', title: 'Financiare', featureRange: 'F192-F236', featureCount: 45, status: 'planned', summary: 'Faturim, pagesa, sigurime, account receivable dhe wellness plans.' },
  { code: 'PORTAL', title: 'Klient Portal', featureRange: 'F237-F261', featureCount: 25, status: 'planned', summary: 'Onboarding, dashboard per pronare, dokumente, pagesa, pasaporte dixhitale dhe telemjekesi.' },
  { code: 'MOBILE', title: 'Mobile App', featureRange: 'F262-F274', featureCount: 13, status: 'planned', summary: 'Aplikacion per pronare dhe staf veterinar me offline mode, kamera, push dhe field visits.' },
  { code: 'ANALYTICS', title: 'Raportim & Analitike', featureRange: 'F275-F298', featureCount: 24, status: 'planned', summary: 'Dashboard operacional, raporte klinike, financiare, custom reports dhe analytics.' },
  { code: 'SAAS', title: 'Multi-Tenancy & Admin', featureRange: 'F299-F327', featureCount: 29, status: 'planned', summary: 'Tenant management, billing SaaS, RBAC, audit, compliance dhe GDPR tools.' },
  { code: 'INTEGRATIONS', title: 'Integrime', featureRange: 'F328-F368', featureCount: 41, status: 'planned', summary: 'Lab providers, microchip registries, insurance, pharma suppliers, calendar sync, accounting exports, IoT dhe genomics.' },
  { code: 'AI', title: 'AI / ML', featureRange: 'F369-F383', featureCount: 15, status: 'planned', summary: 'Voice anamnesis, diagnosis assistant, lab interpretation, drug safety, computer vision, RAG dhe symptom checker.' },
  { code: 'GROWTH', title: 'Network, Revenue, One Health, ESG', featureRange: 'F384-F441', featureCount: 58, status: 'planned', summary: 'Network effects, marketplace, public health, wellbeing, end-of-life, marketing, sustainability dhe crisis modes.' },
  { code: 'PLATFORM', title: 'DevOps & Vizionare', featureRange: 'F442-F487', featureCount: 46, status: 'planned', summary: 'Environment, CI/CD, observability, backup/DR, security, performance dhe veçori eksperimentale.' }
];

export const vetCorePhases = [
  { code: 'P0', title: 'Foundation Skeleton', goal: 'Vendos identitetin VetCoreOS, blueprint-in e plote dhe hyrjen e pare ne produkt.', featureIds: ['F001-F487'], deliverables: ['Inventari i plote ruhet ne docs si burim referimi.', 'API ekspozon blueprint-in dhe health check.', 'Web shell shfaq fazat dhe domainet.'] },
  { code: 'P1', title: 'Clinic Core MVP', goal: 'Krijon rrjedhen baze klinike per pacient, pronar dhe vizite.', featureIds: ['F001-F018', 'F019-F029', 'F030-F045'], deliverables: ['Modelet kryesore EMR dhe audit trail.', 'Faqe per pacientet, pronaret dhe vizitat.', 'Seed demo per nje klinike veterinare.'] },
  { code: 'P2', title: 'Medical Workflows', goal: 'Shton vaksinim, receta, kirurgji, hospitalizim dhe diagnostike.', featureIds: ['F046-F132'], deliverables: ['Workflow per vaksina dhe reminders.', 'Dose calculator dhe receta bazike.', 'Dokumente klinike dhe media attachments.'] },
  { code: 'P3', title: 'Operations, Stock, Finance', goal: 'Lidh kliniken me kalendarin, inventarin, farmacine dhe faturimin.', featureIds: ['F133-F236'], deliverables: ['Calendar dhe booking intern.', 'Medication catalog me lot/expiry.', 'Faturim dhe pagesa te lidhura me vizitat.'] },
  { code: 'P4', title: 'Portal, Mobile, Analytics', goal: 'Hap eksperiencen per pronaret dhe ekipin ne mobile, me raporte bazike.', featureIds: ['F237-F298'], deliverables: ['Client portal per dokumente, booking dhe pagesa.', 'Mobile flows per staff dhe pronare.', 'KPI klinike dhe raporte financiare.'] },
  { code: 'P5', title: 'SaaS Scale & Ecosystem', goal: 'Perdor blueprint-in per multi-tenancy, integrime, AI dhe veçori te avancuara.', featureIds: ['F299-F487'], deliverables: ['Tenant billing, compliance dhe feature flags.', 'Integrime prioritare europiane.', 'AI dhe modules vizionare sipas maturimit.'] }
];

export const vetCoreBlueprint = {
  product: 'VetCoreOS',
  sourceRepository: 'https://github.com/bacollipardh/vetcoreOS',
  inventoryDocument: 'docs/vetcore-feature-inventory.md',
  featureCount: 487,
  domains: vetCoreDomains,
  phases: vetCorePhases
};
