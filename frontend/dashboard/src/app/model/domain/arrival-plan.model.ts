import { HandlingUnitInfo } from './handling-unit.model';
import { ItemInfo } from './item-info.model';
import { SkuInfo } from './sku-info.model';

/**
 * 入荷の工程
 */
export type ArrivalProcess = '入荷' | '検品' | '入庫';

export interface ArrivalPlan {
  id: string;
  arrivalId: string;
  itemInfo: ItemInfo;
  skuInfo: SkuInfo;
  huInfo: HandlingUnitInfo;
  quantity: number;
  arrivalDateTime: string;
  process?: ArrivalProcess;
}
