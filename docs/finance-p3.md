# P3 Finance Hub

Feature IDs: `F192-F236`

This step adds the finance layer for billing, payments, receivables, insurance workflows and wellness subscriptions.

Implemented surface:

- Invoice and estimate registry with VAT, discounts, bundles and e-invoicing placeholder fields.
- Coverage tracking for `F192-F206`, `F207-F222` and `F223-F236`.
- API endpoints for finance summary, invoices, payments, insurance claims and wellness plans.
- UI finance hub with alerts, invoice list, payment list, claims board and subscription plans.
- Create forms for invoices, payments, insurance claims and wellness plans.
- Action flows for approve estimate, issue invoice, capture payment, submit or approve claim, activate or pause plan.
- Detail modals for credit notes, payment edits, claim review and wellness plan updates.

Primary workflows now covered:

- Estimates, invoices, discounts, VAT, bundles and credit-note handling.
- Payment intake with manual, cash and provider placeholders plus split-payment state.
- Insurance claims, pre-authorization and direct-settlement visibility.
- Subscription and wellness program tracking with redemption and pause status.

Next enterprise hardening targets:

- Country-specific e-invoicing adapters and fiscal printer integrations.
- True aging buckets, reminder cadences and debt-collection automation.
- Subscription auto-billing and entitlement redemption sync into clinical workflows.
