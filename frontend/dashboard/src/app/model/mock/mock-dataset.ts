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

const pad = (value: number, length = 3): string => value.toString().padStart(length, '0');

// 商品カテゴリ定義（現実的な倉庫の商品分類）
type ItemCategory = 'food' | 'daily' | 'electronics' | 'beverage' | 'stationery';
interface CategoryConfig {
  namePrefix: string;
  typicalQuantity: { min: number; max: number };
  unit: string;
  palletSize: number; // 1パレットあたりの標準ケース数
}

const categoryConfigs: Record<ItemCategory, CategoryConfig> = {
  food: { namePrefix: '食品', typicalQuantity: { min: 100, max: 500 }, unit: 'ケース', palletSize: 40 },
  beverage: { namePrefix: '飲料', typicalQuantity: { min: 200, max: 800 }, unit: 'ケース', palletSize: 60 },
  daily: { namePrefix: '日用品', typicalQuantity: { min: 50, max: 300 }, unit: 'ケース', palletSize: 30 },
  electronics: { namePrefix: '電化製品', typicalQuantity: { min: 10, max: 80 }, unit: 'ケース', palletSize: 20 },
  stationery: { namePrefix: '文具', typicalQuantity: { min: 30, max: 200 }, unit: 'ケース', palletSize: 50 },
};

const categories: ItemCategory[] = ['food', 'beverage', 'daily', 'electronics', 'stationery'];

// より現実的な商品カタログ（カテゴリ別）
export const itemCatalog: ItemInfo[] = categories.flatMap((category, categoryIndex) => {
  const config = categoryConfigs[category];
  return Array.from({ length: 6 }, (_, itemIndex) => {
    const idNumber = categoryIndex * 6 + itemIndex + 1;
    return {
      id: `ITEM-${pad(idNumber)}`,
      name: `${config.namePrefix}${String.fromCharCode(65 + itemIndex)}`,
      description: `${config.namePrefix}${String.fromCharCode(65 + itemIndex)}の商品説明`,
    };
  });
});

export const skuCatalog: SkuInfo[] = itemCatalog.flatMap((item, index) => {
  const base = index + 1;
  return [
    {
      id: `SKU-${pad(base * 2 - 1)}`,
      goodsId: `GOODS-${pad(base)}-STD`,
      code: `SKU${pad(base)}S`,
      name: `${item.name} 標準`,
    },
    {
      id: `SKU-${pad(base * 2)}`,
      goodsId: `GOODS-${pad(base)}-LRG`,
      code: `SKU${pad(base)}L`,
      name: `${item.name} 大容量`,
    },
  ];
});

export const handlingUnits: HandlingUnitInfo[] = Array.from({ length: 100 }, (_, index) => {
  const idNumber = index + 1;
  const category = categories[index % categories.length];
  const config = categoryConfigs[category];

  return {
    id: `HU-${pad(idNumber)}`,
    quantity: randomIntInRange(5, config.palletSize),
    unit: config.unit,
    lotNumber: `LOT-${pad((index % 20) + 1)}`,
  };
});

// トラック便の時間帯定義（現実的な配送スケジュール）
interface TruckSlot {
  dayOffset: number;
  baseHour: number;
  baseMinute: number;
  itemsPerTruck: number; // 1台あたりの積載アイテム種類数
}

// 1日分の配送スケジュール（朝便・午前便・午後便・夕方便）
const generateTruckSchedule = (): TruckSlot[] => {
  const slots: TruckSlot[] = [];
  const day = 0; // 今日のデータのみ

  // 朝便（2-3台）
  const morningTrucks = randomIntInRange(2, 3);
  for (let i = 0; i < morningTrucks; i++) {
    slots.push({
      dayOffset: day,
      baseHour: 8,
      baseMinute: randomIntInRange(0, 30) + i * 20,
      itemsPerTruck: randomIntInRange(3, 6),
    });
  }

  // 午前便（1-2台）
  const morningLateTrucks = randomIntInRange(1, 2);
  for (let i = 0; i < morningLateTrucks; i++) {
    slots.push({
      dayOffset: day,
      baseHour: 10,
      baseMinute: randomIntInRange(15, 45) + i * 25,
      itemsPerTruck: randomIntInRange(2, 5),
    });
  }

  // 午後便（2-3台）
  const afternoonTrucks = randomIntInRange(2, 3);
  for (let i = 0; i < afternoonTrucks; i++) {
    slots.push({
      dayOffset: day,
      baseHour: 13,
      baseMinute: randomIntInRange(0, 40) + i * 20,
      itemsPerTruck: randomIntInRange(3, 7),
    });
  }

  // 夕方便（1-2台）
  const eveningTrucks = randomIntInRange(1, 2);
  for (let i = 0; i < eveningTrucks; i++) {
    slots.push({
      dayOffset: day,
      baseHour: 16,
      baseMinute: randomIntInRange(0, 30) + i * 25,
      itemsPerTruck: randomIntInRange(2, 4),
    });
  }

  return slots;
};

const truckSchedule = generateTruckSchedule();

const arrivalIdForIndex = (truckIndex: number, itemIndex: number): string =>
  `ARR-${pad(truckIndex + 1)}-${pad(itemIndex + 1)}`;

// 入荷予定データ生成（トラック便単位で生成）
export const arrivalPlans: ArrivalPlan[] = truckSchedule.flatMap((truck, truckIndex) => {
  const arrivalDateTime = formatDateTime(truck.dayOffset, truck.baseHour, truck.baseMinute);

  return Array.from({ length: truck.itemsPerTruck }, (_, itemIndex) => {
    const item = itemCatalog[randomIntInRange(0, itemCatalog.length - 1)];
    const category = categories[Math.floor(itemCatalog.indexOf(item) / 6)];
    const config = categoryConfigs[category];
    const sku = skuCatalog[itemCatalog.indexOf(item) * 2 + randomIntInRange(0, 1)];
    const huInfo = handlingUnits[(truckIndex * truck.itemsPerTruck + itemIndex) % handlingUnits.length];

    // カテゴリに応じた現実的な数量
    const baseQuantity = randomIntInRange(config.typicalQuantity.min, config.typicalQuantity.max);
    // パレット単位に丸める（現実的な積載）
    const palletCount = Math.ceil(baseQuantity / config.palletSize);
    const plannedQuantity = palletCount * config.palletSize;

    return {
      id: `APL-${pad(truckIndex * 10 + itemIndex + 1, 4)}`,
      arrivalId: arrivalIdForIndex(truckIndex, itemIndex),
      itemInfo: item,
      skuInfo: sku,
      huInfo,
      quantity: plannedQuantity,
      arrivalDateTime,
    };
  });
});

// 入荷実績データ生成
export const arrivalActuals: ArrivalActual[] = arrivalPlans.map((plan, index) => {
  // 実績は予定に対して±5-10%のばらつき
  const actualQuantity = introduceQuantityVariance(plan.quantity, 8, 5);

  // トラックの遅延・早着（-20分～+60分）
  const arrivalVarianceMinutes = nonZeroVariance(-20, 60, 10);
  const actualArrivalDateTime = adjustMinutes(plan.arrivalDateTime, arrivalVarianceMinutes);

  // 検品・記録まで5-20分
  const recordingDelay = randomIntInRange(5, 20);

  return {
    id: `AAC-${pad(index + 1, 4)}`,
    arrivalId: plan.arrivalId,
    planId: plan.id,
    itemInfo: plan.itemInfo,
    skuInfo: plan.skuInfo,
    huInfo: plan.huInfo,
    quantity: actualQuantity,
    actualArrivalDateTime,
    recordedAt: adjustMinutes(actualArrivalDateTime, recordingDelay),
  };
});

const districts = ['東日本', '西日本', '中部', '九州', '北海道'];
const customerIds = Array.from({ length: 30 }, (_, index) => `CUST-${pad(index + 1)}`);

// 出荷スケジュール生成（午後～夜間の配送が中心）
interface ShipmentSlot {
  dayOffset: number;
  baseHour: number;
  baseMinute: number;
  itemsPerRoute: number; // 1配送ルートあたりのアイテム数
}

const generateShipmentSchedule = (): ShipmentSlot[] => {
  const slots: ShipmentSlot[] = [];
  const day = 0; // 今日のデータのみ

  // 午後便（14:00-16:00）- 3-4ルート
  const afternoonRoutes = randomIntInRange(3, 4);
  for (let i = 0; i < afternoonRoutes; i++) {
    slots.push({
      dayOffset: day,
      baseHour: 14,
      baseMinute: randomIntInRange(0, 45) + i * 15,
      itemsPerRoute: randomIntInRange(2, 5),
    });
  }

  // 夕方便（16:00-18:00）- 4-5ルート（ピーク時間帯）
  const eveningRoutes = randomIntInRange(4, 5);
  for (let i = 0; i < eveningRoutes; i++) {
    slots.push({
      dayOffset: day,
      baseHour: 16,
      baseMinute: randomIntInRange(0, 50) + i * 12,
      itemsPerRoute: randomIntInRange(3, 6),
    });
  }

  // 夜間便（18:00-20:00）- 2-3ルート
  const nightRoutes = randomIntInRange(2, 3);
  for (let i = 0; i < nightRoutes; i++) {
    slots.push({
      dayOffset: day,
      baseHour: 18,
      baseMinute: randomIntInRange(0, 40) + i * 20,
      itemsPerRoute: randomIntInRange(2, 4),
    });
  }

  return slots;
};

const shipmentSchedule = generateShipmentSchedule();

// 出荷予定データ生成（配送ルート単位で生成）
export const shipmentPlans: ShipmentPlan[] = shipmentSchedule.flatMap((route, routeIndex) => {
  const shipmentDateTime = formatDateTime(route.dayOffset, route.baseHour, route.baseMinute);

  return Array.from({ length: route.itemsPerRoute }, (_, itemIndex) => {
    const item = itemCatalog[randomIntInRange(0, itemCatalog.length - 1)];
    const category = categories[Math.floor(itemCatalog.indexOf(item) / 6)];
    const config = categoryConfigs[category];
    const sku = skuCatalog[itemCatalog.indexOf(item) * 2 + randomIntInRange(0, 1)];
    const huInfo = handlingUnits[(routeIndex * route.itemsPerRoute + itemIndex) % handlingUnits.length];

    // 出荷数量は入荷より少なめ（30-70%程度）
    const baseQuantity = randomIntInRange(
      Math.floor(config.typicalQuantity.min * 0.3),
      Math.floor(config.typicalQuantity.max * 0.7)
    );
    const plannedQuantity = Math.max(10, baseQuantity);

    return {
      id: `SPL-${pad(routeIndex * 10 + itemIndex + 1, 4)}`,
      orderId: `ORD-${pad(Math.floor((routeIndex * route.itemsPerRoute + itemIndex) / 3) + 1, 4)}`,
      shipmentId: `SHP-${pad(routeIndex + 1, 4)}`,
      itemInfo: item,
      skuInfo: sku,
      huInfo,
      quantity: plannedQuantity,
      district: districts[randomIntInRange(0, districts.length - 1)],
      shipmentDateTime,
      customerId: customerIds[randomIntInRange(0, customerIds.length - 1)],
    };
  });
});

// 出荷実績データ生成
export const shipmentActuals: ShipmentActual[] = shipmentPlans.map((plan, index) => {
  // 出荷実績のばらつきは小さめ（在庫管理が厳密なため）
  const actualQuantity = introduceQuantityVariance(plan.quantity, 5, 1);

  // 出荷時刻のばらつき（-15分～+45分）
  const shipmentVarianceMinutes = nonZeroVariance(-15, 45, 8);
  const actualShipmentStart = adjustMinutes(plan.shipmentDateTime, shipmentVarianceMinutes);

  // ピッキング・梱包時間（10-30分）
  const preparationTime = randomIntInRange(10, 30);

  return {
    id: `SAC-${pad(index + 1, 4)}`,
    orderId: plan.orderId,
    shipmentId: plan.shipmentId,
    planId: plan.id,
    itemInfo: plan.itemInfo,
    skuInfo: plan.skuInfo,
    huInfo: plan.huInfo,
    quantity: actualQuantity,
    district: plan.district,
    shipmentDateTime: plan.shipmentDateTime,
    shippedAt: adjustMinutes(actualShipmentStart, preparationTime),
    customerId: plan.customerId,
  };
});
