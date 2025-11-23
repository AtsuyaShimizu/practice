import { HandlingUnitInfo } from './handling-unit.model';
import { ItemInfo } from './item-info.model';
import { SkuInfo } from './sku-info.model';

export interface ArrivalActual {
  id: string;
  arrivalId: string;
  planId?: string;
  itemInfo: ItemInfo;
  skuInfo: SkuInfo;
  huInfo: HandlingUnitInfo;
  quantity: number;
  actualArrivalDate: string;
  recordedAt?: string;
}
