import { HandlingUnitInfo } from './handling-unit.model';
import { ItemInfo } from './item-info.model';
import { SkuInfo } from './sku-info.model';

export interface ShipmentActual {
  id: string;
  orderId: string;
  shipmentId: string;
  planId?: string;
  itemInfo: ItemInfo;
  skuInfo: SkuInfo;
  huInfo: HandlingUnitInfo;
  quantity: number;
  district: string;
  actualShipmentDateTime: string;
  customerId: string;
}
