import { ArrivalActual, ArrivalPlan, HandlingUnitInfo, ItemInfo, ShipmentPlan, ShipmentActual, SkuInfo } from '../domain/index';

const formatDateTime = (daysAgo: number, hours: number, minutes = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

const adjustMinutes = (isoDate: string, minutes: number): string => {
  const date = new Date(isoDate);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
};

const randomIntInRange = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const nonZeroVariance = (min: number, max: number, fallback = 5): number => {
  const delta = randomIntInRange(min, max);
  if (delta !== 0) {
    return delta;
  }

  const fallbackDirection = Math.random() < 0.5 ? -1 : 1;
  return fallbackDirection * Math.abs(fallback);
};

const introduceQuantityVariance = (
  base: number,
  spreadPercent: number,
  minimumStep = 1,
): number => {
  const percentDelta = randomIntInRange(-spreadPercent, spreadPercent);
  const stepDelta = randomIntInRange(-minimumStep, minimumStep);
  const delta = Math.round((base * percentDelta) / 100) + stepDelta;

  if (delta !== 0) {
    return Math.max(1, base + delta);
  }

  const forcedShift = minimumStep * (percentDelta >= 0 ? 1 : -1);
  return Math.max(1, base + forcedShift);
};

const arrivalScheduleTimes = [
  formatDateTime(0, 9, 30),
  formatDateTime(1, 11, 15),
  formatDateTime(2, 14, 45),
];

const shipmentScheduleTimes = [
  formatDateTime(0, 17, 10),
  formatDateTime(1, 15, 5),
  formatDateTime(2, 10, 20),
];

const pad = (value: number, length = 3): string => value.toString().padStart(length, '0');

export const itemCatalog: ItemInfo[] = Array.from({ length: 10 }, (_, index) => {
  const idNumber = index + 1;
  return {
    id: `ITEM-${pad(idNumber)}`,
    name: `品目${idNumber}`,
    description: `品目${idNumber}の説明です。`,
  };
});

export const skuCatalog: SkuInfo[] = itemCatalog.flatMap((item, index) => {
  const base = index + 1;
  return [
    {
      id: `SKU-${pad(base * 2 - 1)}`,
      goodsId: `GOODS-${pad(base)}-A`,
      code: `SKU${pad(base)}A`,
      name: `${item.name} 標準仕様`,
    },
    {
      id: `SKU-${pad(base * 2)}`,
      goodsId: `GOODS-${pad(base)}-B`,
      code: `SKU${pad(base)}B`,
      name: `${item.name} 大容量仕様`,
    },
  ];
});

export const handlingUnits: HandlingUnitInfo[] = Array.from({ length: 50 }, (_, index) => {
  const idNumber = index + 1;
  return {
    id: `HU-${pad(idNumber)}`,
    quantity: ((index % 5) + 1) * 5,
    unit: 'ケース',
    lotNumber: `LOT-${pad((index % 10) + 1)}`,
  };
});

const arrivalIdForIndex = (index: number): string => `ARR-${pad(Math.floor(index / 2) + 1)}`;
const orderIdForIndex = (index: number): string => `ORD-${pad(Math.floor(index / 2) + 1)}`;
const shipmentIdForIndex = (index: number): string => `SHP-${pad(Math.floor(index / 2) + 1)}`;

export const arrivalPlans: ArrivalPlan[] = Array.from({ length: 100 }, (_, index) => {
  const item = itemCatalog[index % itemCatalog.length];
  const sku = skuCatalog[index % skuCatalog.length];
  const huInfo = handlingUnits[index % handlingUnits.length];
  const plannedQuantity = Math.max(20, 50 + (index % 7) * 5 + randomIntInRange(-4, 8));

  return {
    id: `APL-${pad(index + 1)}`,
    arrivalId: arrivalIdForIndex(index),
    itemInfo: item,
    skuInfo: sku,
    huInfo,
    quantity: plannedQuantity,
    arrivalDateTime: arrivalScheduleTimes[index % arrivalScheduleTimes.length],
  };
});

export const arrivalActuals: ArrivalActual[] = arrivalPlans.map((plan, index) => {
  const actualQuantity = introduceQuantityVariance(plan.quantity, 12, 2);
  const arrivalVarianceMinutes = nonZeroVariance(-40, 90, 10);
  const actualArrivalDateTime = adjustMinutes(plan.arrivalDateTime, arrivalVarianceMinutes);

  return {
    id: `AAC-${pad(index + 1)}`,
    arrivalId: plan.arrivalId,
    planId: plan.id,
    itemInfo: plan.itemInfo,
    skuInfo: plan.skuInfo,
    huInfo: plan.huInfo,
    quantity: actualQuantity,
    actualArrivalDateTime,
    recordedAt: adjustMinutes(actualArrivalDateTime, randomIntInRange(10, 25)),
  };
});

const districts = ['東日本', '西日本', '中部', '九州', '北海道'];
const customerIds = Array.from({ length: 20 }, (_, index) => `CUST-${pad(index + 1)}`);

export const shipmentPlans: ShipmentPlan[] = Array.from({ length: 100 }, (_, index) => {
  const item = itemCatalog[(index * 3) % itemCatalog.length];
  const sku = skuCatalog[(index * 2) % skuCatalog.length];
  const huInfo = handlingUnits[(index * 5) % handlingUnits.length];
  const plannedQuantity = Math.max(10, 30 + (index % 6) * 4 + randomIntInRange(-3, 6));

  return {
    id: `SPL-${pad(index + 1)}`,
    orderId: orderIdForIndex(index),
    shipmentId: shipmentIdForIndex(index),
    itemInfo: item,
    skuInfo: sku,
    huInfo,
    quantity: plannedQuantity,
    district: districts[index % districts.length],
    shipmentDateTime: shipmentScheduleTimes[index % shipmentScheduleTimes.length],
    customerId: customerIds[index % customerIds.length],
  };
});

export const shipmentActuals: ShipmentActual[] = shipmentPlans.map((plan, index) => {
  const actualQuantity = introduceQuantityVariance(plan.quantity, 15, 1);
  const shipmentVarianceMinutes = nonZeroVariance(-30, 80, 12);
  const actualShipmentStart = adjustMinutes(plan.shipmentDateTime, shipmentVarianceMinutes);

  return {
    id: `SAC-${pad(index + 1)}`,
    orderId: plan.orderId,
    shipmentId: plan.shipmentId,
    planId: plan.id,
    itemInfo: plan.itemInfo,
    skuInfo: plan.skuInfo,
    huInfo: plan.huInfo,
    quantity: actualQuantity,
    district: plan.district,
    shipmentDateTime: plan.shipmentDateTime,
    shippedAt: adjustMinutes(actualShipmentStart, randomIntInRange(5, 20)),
    customerId: plan.customerId,
  };
});
