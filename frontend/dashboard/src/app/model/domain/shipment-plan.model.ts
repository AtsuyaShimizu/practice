import { HandlingUnitInfo } from './handling-unit.model';
import { ItemInfo } from './item-info.model';
import { SkuInfo } from './sku-info.model';

export interface ShipmentPlan {
  id: string;
  orderId: string;
  shipmentId: string;
  itemInfo: ItemInfo;
  skuInfo: SkuInfo;
  huInfo: HandlingUnitInfo;
  quantity: number;
  district: string;
  shipmentDateTime: string;
  customerId: string;
}
