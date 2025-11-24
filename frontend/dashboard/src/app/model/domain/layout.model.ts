/**
 * レイアウトパターンの種類
 */
export enum LayoutType {
  Single = '1x1',       // 1行1列
  TwoColumns = '1x2',   // 1行2列
  TwoRows = '2x1',      // 2行1列
  Grid2x2 = '2x2',      // 2行2列
  TopOne = 'top-1',     // 上1、下2
  BottomOne = 'bottom-1', // 上2、下1
}

/**
 * レイアウトパターンの定義
 */
export interface LayoutPattern {
  type: LayoutType;
  label: string;
  description: string;
  slots: number; // スロット数
  gridTemplate: string; // CSS Grid template
}

/**
 * グラフの種類
 */
export enum GraphType {
  ArrivalPlanActualLine = 'arrival-plan-actual-line',
  ShipmentPlanActualLine = 'shipment-plan-actual-line',
  ArrivalPie = 'arrival-pie',
  ShipmentPie = 'shipment-pie',
  ArrivalBar = 'arrival-bar',
  ShipmentBar = 'shipment-bar',
}

/**
 * グラフの定義
 */
export interface GraphDefinition {
  type: GraphType;
  label: string;
  description: string;
  category: 'arrival' | 'shipment';
}

/**
 * 配置されたグラフ
 */
export interface PlacedGraph {
  id: string;
  type: GraphType;
  slotIndex: number;
}

/**
 * ダッシュボードのレイアウト状態
 */
export interface DashboardLayout {
  layoutType: LayoutType;
  graphs: PlacedGraph[];
}
