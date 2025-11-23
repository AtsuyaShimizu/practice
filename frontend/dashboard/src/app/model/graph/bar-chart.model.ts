/**
 * 棒グラフのデータ項目
 */
export interface BarChartDataItem {
  category: string;
  value: number;
}

/**
 * 棒グラフのシリーズ（1つのグループ）
 */
export interface BarChartSeries {
  name: string;
  data: BarChartDataItem[];
  color?: string;
  barWidth?: number;
}

/**
 * 棒グラフの向き
 */
export enum BarChartOrientation {
  Vertical = 'vertical',
  Horizontal = 'horizontal'
}

/**
 * 棒グラフの設定
 */
export interface BarChartConfig {
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  orientation?: BarChartOrientation;
  showLegend?: boolean;
  showGrid?: boolean;
  showValues?: boolean;
  stacked?: boolean;
  animation?: boolean;
  height?: number;
  width?: number;
}

/**
 * 棒グラフのデータモデル
 */
export interface BarChartModel {
  series: BarChartSeries[];
  config?: BarChartConfig;
}
