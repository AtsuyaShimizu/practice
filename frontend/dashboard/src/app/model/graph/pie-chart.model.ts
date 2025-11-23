/**
 * 円グラフのセグメント
 */
export interface PieChartSegment {
  label: string;
  value: number;
  color?: string;
  percentage?: number;
}

/**
 * 円グラフの設定
 */
export interface PieChartConfig {
  title?: string;
  showLegend?: boolean;
  showLabels?: boolean;
  showPercentages?: boolean;
  showValues?: boolean;
  innerRadius?: number;
  animation?: boolean;
  height?: number;
  width?: number;
  startAngle?: number;
}

/**
 * 円グラフのデータモデル
 */
export interface PieChartModel {
  segments: PieChartSegment[];
  config?: PieChartConfig;
}
