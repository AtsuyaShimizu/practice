import { ShipmentPlan, ShipmentActual } from '../model/domain';
import { LineChartModel, LineChartDataPoint } from '../model/graph';

/**
 * 出荷予定と実績データを日付ごとに集計
 */
interface DateAggregation {
  date: string;
  planTotal: number;
  actualTotal: number;
}

/**
 * 日時文字列から日付部分のみを抽出
 */
function extractDate(dateTime: string): string {
  return dateTime.split('T')[0];
}

/**
 * 出荷予定と実績データを日付ごとに集計する
 */
function aggregateByDate(
  plans: ShipmentPlan[],
  actuals: ShipmentActual[]
): DateAggregation[] {
  const dateMap = new Map<string, DateAggregation>();

  // 予定データを集計
  plans.forEach(plan => {
    const date = extractDate(plan.shipmentDateTime);
    const existing = dateMap.get(date) || {
      date,
      planTotal: 0,
      actualTotal: 0,
    };
    existing.planTotal += plan.quantity;
    dateMap.set(date, existing);
  });

  // 実績データを集計
  actuals.forEach(actual => {
    const date = extractDate(actual.shipmentDateTime);
    const existing = dateMap.get(date) || {
      date,
      planTotal: 0,
      actualTotal: 0,
    };
    existing.actualTotal += actual.quantity;
    dateMap.set(date, existing);
  });

  // 日付順にソート
  return Array.from(dateMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

/**
 * 出荷予定と実績データを線グラフモデルに変換する
 * @param plans 出荷予定データの配列
 * @param actuals 出荷実績データの配列
 * @param config グラフの設定（オプション）
 * @returns 線グラフモデル
 */
export function mapShipmentToLineChart(
  plans: ShipmentPlan[],
  actuals: ShipmentActual[],
  config?: {
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
  }
): LineChartModel {
  const aggregated = aggregateByDate(plans, actuals);

  const planDataPoints: LineChartDataPoint[] = aggregated.map(item => ({
    x: item.date,
    y: item.planTotal,
  }));

  const actualDataPoints: LineChartDataPoint[] = aggregated.map(item => ({
    x: item.date,
    y: item.actualTotal,
  }));

  return {
    series: [
      {
        name: '出荷予定',
        data: planDataPoints,
        color: '#50C878',
        lineWidth: 2,
        showPoints: true,
      },
      {
        name: '出荷実績',
        data: actualDataPoints,
        color: '#FF6B35',
        lineWidth: 2,
        showPoints: true,
      },
    ],
    config: {
      title: config?.title || '出荷予実推移',
      xAxisLabel: config?.xAxisLabel || '出荷日',
      yAxisLabel: config?.yAxisLabel || '数量',
      showLegend: true,
      showGrid: true,
      animation: true,
      showXAxisLabel: false,
      showYAxisLabel: true,
    },
  };
}
