# Portal & Telemedicine `F237-F261`

This phase adds the owner-facing operational layer that sits on top of the clinic core.

Implemented surfaces:

- Portal account workspace with invite status, language, unread state and payment readiness
- Portal document records with sharing state, QR toggle and patient timeline visibility
- Telemedicine board for scheduled remote sessions, AI triage placeholders and consent tracking
- Async consult queue for media-backed owner updates and clinician response loops
- API routes for summary, list, create and update across all four portal entities
- Audit trail coverage for portal and telemedicine workflow actions

UI coverage:

- New `Portal` section in the main navigation
- Functional create forms for portal accounts, documents, telemedicine sessions and async consults
- Detail modals with editable operational fields
- Work queue and dashboard alert integration

Next hardening targets:

- Dedicated owner portal shell and authentication journey
- Real-time video/media delivery
- Booking, billing and reminder flows in a true owner experience
