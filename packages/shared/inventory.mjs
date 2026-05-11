// P3 Inventory & Pharmacy coverage: F169-F191.
import { getPatientById } from "./clinic-core.mjs";

export const inventoryFeatureCoverage = [
  {
    range: "F169-F175",
    area: "Catalog",
    description:
      "ATCvet catalog, dosage forms, multi-language names, concentration, restrictions and controlled flags.",
  },
  {
    range: "F176-F182",
    area: "Stock Management",
    description:
      "Lot tracking, FEFO readiness, multi-warehouse stock, reorder alerts, wastage and audit movements.",
  },
  {
    range: "F183-F191",
    area: "Supply & Controlled Drugs",
    description:
      "Supplier flow, purchase orders, receiving, invoice matching and controlled-substance reconciliation.",
  },
];

function collection(state, key) {
  return Array.isArray(state?.[key]) ? state[key] : [];
}

function totalUnits(record) {
  return collection(record, "warehouses").reduce(
    (sum, warehouse) => sum + Number(warehouse.onHandUnits || 0),
    0,
  );
}

function earliestExpiry(record) {
  return collection(record, "warehouses")
    .map((warehouse) => warehouse.expiresAt)
    .filter(Boolean)
    .sort()[0];
}

function valueCents(record) {
  return totalUnits(record) * Number(record.avcoCostCents || 0);
}

export function inventoryRiskStatus(record) {
  const onHand = totalUnits(record);
  if (
    record.controlledSubstance &&
    onHand <= Number(record.reorderThreshold || 0)
  ) {
    return "controlled-low";
  }
  if (onHand <= 0) return "out-of-stock";
  if (onHand <= Number(record.reorderThreshold || 0)) return "reorder";
  if (Number(record.wastageUnits || 0) > 0) return "wastage";
  if (Number(record.stocktakeVariance || 0) !== 0) return "variance";
  return "healthy";
}

export function purchaseOrderRiskStatus(record) {
  if (record.approvalStatus !== "approved") return "approval";
  if (record.receivingStatus !== "received") return "receiving";
  if (record.invoiceMatchStatus !== "matched") return "invoice";
  return "closed";
}

export function controlledRiskStatus(record) {
  if (record.authorityReportStatus === "required") return "report-required";
  if (record.reconciliationStatus !== "closed") return "reconcile";
  return "logged";
}

export function listInventoryItems(state) {
  return collection(state, "inventoryItems")
    .map((record) => ({
      ...record,
      totalUnits: totalUnits(record),
      earliestExpiry: earliestExpiry(record),
      totalValueCents: valueCents(record),
      warehouseCount: collection(record, "warehouses").length,
      movementCount: collection(record, "movements").length,
      riskStatus: inventoryRiskStatus(record),
    }))
    .sort((a, b) =>
      String(a.medicationName).localeCompare(String(b.medicationName)),
    );
}

export function listPurchaseOrders(state) {
  return collection(state, "purchaseOrders")
    .map((record) => ({
      ...record,
      lineCount: collection(record, "lines").length,
      totalCostCents: collection(record, "lines").reduce(
        (sum, line) =>
          sum + Number(line.quantity || 0) * Number(line.unitCostCents || 0),
        0,
      ),
      riskStatus: purchaseOrderRiskStatus(record),
    }))
    .sort((a, b) => String(b.expectedAt).localeCompare(String(a.expectedAt)));
}

export function listControlledLog(state) {
  return collection(state, "controlledLog")
    .map((record) => ({
      ...record,
      patient: getPatientById(state, record.patientId),
      inventoryItem: collection(state, "inventoryItems").find(
        (entry) => entry.id === record.inventoryItemId,
      ),
      riskStatus: controlledRiskStatus(record),
    }))
    .sort((a, b) => String(b.at).localeCompare(String(a.at)));
}

export function getInventorySummary(state) {
  const items = listInventoryItems(state);
  const purchaseOrders = listPurchaseOrders(state);
  const controlledLog = listControlledLog(state);
  const alerts = [
    ...items.filter((record) =>
      [
        "controlled-low",
        "out-of-stock",
        "reorder",
        "wastage",
        "variance",
      ].includes(record.riskStatus),
    ),
    ...purchaseOrders.filter((record) =>
      ["approval", "receiving", "invoice"].includes(record.riskStatus),
    ),
    ...controlledLog.filter((record) =>
      ["report-required", "reconcile"].includes(record.riskStatus),
    ),
  ];

  return {
    featureCoverage: inventoryFeatureCoverage,
    counts: {
      items: items.length,
      lowStock: items.filter((record) =>
        ["controlled-low", "out-of-stock", "reorder"].includes(
          record.riskStatus,
        ),
      ).length,
      controlled: items.filter((record) => record.controlledSubstance).length,
      openPurchaseOrders: purchaseOrders.filter(
        (record) => record.riskStatus !== "closed",
      ).length,
      controlledOpen: controlledLog.filter(
        (record) => record.riskStatus !== "logged",
      ).length,
      totalValueCents: items.reduce(
        (sum, record) => sum + Number(record.totalValueCents || 0),
        0,
      ),
    },
    alerts,
    nextBuildTargets: [
      "Auto-dispense from FEFO lot selection",
      "3-way invoice match workflow",
      "Authority-ready controlled drug export",
    ],
  };
}
