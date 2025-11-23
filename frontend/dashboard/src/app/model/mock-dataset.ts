import { ArrivalActual } from './arrival-actual.model';
import { ArrivalPlan } from './arrival-plan.model';
import { HandlingUnitInfo } from './handling-unit.model';
import { ItemInfo } from './item-info.model';
import { ShipmentActual } from './shipment-actual.model';
import { ShipmentPlan } from './shipment-plan.model';
import { SkuInfo } from './sku-info.model';

const formatDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
};

const dateBuckets = [0, 1, 2].map(formatDate);

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
  const plannedQuantity = 50 + (index % 7) * 5;

  return {
    id: `APL-${pad(index + 1)}`,
    arrivalId: arrivalIdForIndex(index),
    itemInfo: item,
    skuInfo: sku,
    huInfo,
    quantity: plannedQuantity,
    arrivalDate: dateBuckets[index % dateBuckets.length],
  };
});

export const arrivalActuals: ArrivalActual[] = arrivalPlans.map((plan, index) => {
  const variance = (index % 5) - 2;
  const actualQuantity = Math.max(1, plan.quantity + variance);

  return {
    id: `AAC-${pad(index + 1)}`,
    arrivalId: plan.arrivalId,
    planId: plan.id,
    itemInfo: plan.itemInfo,
    skuInfo: plan.skuInfo,
    huInfo: plan.huInfo,
    quantity: actualQuantity,
    actualArrivalDate: plan.arrivalDate,
    recordedAt: `${plan.arrivalDate}T0${(index % 9) + 1}:15:00Z`,
  };
});

const districts = ['東日本', '西日本', '中部', '九州', '北海道'];
const customerIds = Array.from({ length: 20 }, (_, index) => `CUST-${pad(index + 1)}`);

export const shipmentPlans: ShipmentPlan[] = Array.from({ length: 100 }, (_, index) => {
  const item = itemCatalog[(index * 3) % itemCatalog.length];
  const sku = skuCatalog[(index * 2) % skuCatalog.length];
  const huInfo = handlingUnits[(index * 5) % handlingUnits.length];
  const plannedQuantity = 30 + (index % 6) * 4;

  return {
    id: `SPL-${pad(index + 1)}`,
    orderId: orderIdForIndex(index),
    shipmentId: shipmentIdForIndex(index),
    itemInfo: item,
    skuInfo: sku,
    huInfo,
    quantity: plannedQuantity,
    district: districts[index % districts.length],
    shipmentDate: dateBuckets[index % dateBuckets.length],
    customerId: customerIds[index % customerIds.length],
  };
});

export const shipmentActuals: ShipmentActual[] = shipmentPlans.map((plan, index) => {
  const variance = (index % 7) - 3;
  const actualQuantity = Math.max(1, plan.quantity + variance);

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
    shipmentDate: plan.shipmentDate,
    shippedAt: `${plan.shipmentDate}T1${(index % 8)}:45:00Z`,
    customerId: plan.customerId,
  };
});
