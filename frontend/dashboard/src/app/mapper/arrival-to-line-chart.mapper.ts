import { ArrivalPlan, ArrivalActual } from '../model/domain';
import { LineChartModel, LineChartDataPoint } from '../model/graph';

/**
 * 入荷予定と実績データを日付ごとに集計
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
 * 入荷予定と実績データを日付ごとに集計する
 */
function aggregateByDate(
  plans: ArrivalPlan[],
  actuals: ArrivalActual[]
): DateAggregation[] {
  const dateMap = new Map<string, DateAggregation>();

  // 予定データを集計
  plans.forEach(plan => {
    const date = extractDate(plan.arrivalDateTime);
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
    const date = extractDate(actual.actualArrivalDateTime);
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
 * 入荷予定と実績データを線グラフモデルに変換する
 * @param plans 入荷予定データの配列
 * @param actuals 入荷実績データの配列
 * @param config グラフの設定（オプション）
 * @returns 線グラフモデル
 */
export function mapArrivalToLineChart(
  plans: ArrivalPlan[],
  actuals: ArrivalActual[],
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
        name: '入荷予定',
        data: planDataPoints,
        color: '#60A5FA',
        lineWidth: 2.5,
        showPoints: true,
      },
      {
        name: '入荷実績',
        data: actualDataPoints,
        color: '#F472B6',
        lineWidth: 2.5,
        showPoints: true,
      },
    ],
    config: {
      title: config?.title || '入荷予実推移',
      xAxisLabel: config?.xAxisLabel || '入荷日',
      yAxisLabel: config?.yAxisLabel || '数量',
      showLegend: true,
      showGrid: true,
      animation: true,
      showXAxisLabel: false,
      showYAxisLabel: true,
    },
  };
}
