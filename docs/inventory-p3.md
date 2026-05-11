# P3 Inventory & Pharmacy

Feature IDs: `F169-F191`

This step adds the pharmacy inventory layer for medication catalog, stock control, purchasing and controlled-substance tracking.

Implemented surface:

- Inventory item registry with ATCvet code, dosage form, multilingual naming and restriction flags.
- Coverage tracking for `F169-F175`, `F176-F182` and `F183-F191`.
- API endpoints for inventory summary, stock items, purchase orders and controlled log.
- UI inventory hub with stock alerts, purchase orders and controlled-substance records.
- Create forms for inventory items and purchase orders.
- Action flows for receive, dispense, approve, receive PO and invoice matching.
- Controlled-log append when controlled substances move through inventory actions.

Primary workflows now covered:

- Catalog metadata for medication and nutrition items.
- Lot, expiry, warehouse and reorder visibility with stock movement history.
- Supplier and purchase-order operational workflow with receiving and invoice status.
- Controlled-substance reconciliation and authority-report risk visibility.

Next enterprise hardening targets:

- FEFO lot selection during dispense and automated deduction from earliest-expiry stock.
- Supplier invoice reconciliation with true 3-way match against received goods.
- Export-ready authority reports and periodic controlled-drug reconciliation packs.
