/**
 * 線グラフのデータポイント
 */
export interface LineChartDataPoint {
  x: number | string | Date;
  y: number;
}

/**
 * 線グラフのシリーズ（1つのライン）
 */
export interface LineChartSeries {
  name: string;
  data: LineChartDataPoint[];
  color?: string;
  lineWidth?: number;
  showPoints?: boolean;
  dashed?: boolean;
}

/**
 * 線グラフの設定
 */
export interface LineChartConfig {
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  animation?: boolean;
  height?: number;
  width?: number;
}

/**
 * 線グラフのデータモデル
 */
export interface LineChartModel {
  series: LineChartSeries[];
  config?: LineChartConfig;
}
