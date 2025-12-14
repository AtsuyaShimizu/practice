import { ShipmentPlan, ShipmentActual } from '../model/domain';
import { BarChartModel, BarChartDataItem } from '../model/graph';

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
 * 日付を表示用フォーマットに変換（例: "2024-01-15" -> "01/15"）
 */
function formatDateLabel(date: string): string {
  const [year, month, day] = date.split('-');
  return `${month}/${day}`;
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
 * 出荷予定と実績データを棒グラフモデルに変換する（日付ごとの比較）
 * @param plans 出荷予定データの配列
 * @param actuals 出荷実績データの配列
 * @param config グラフの設定（オプション）
 * @returns 棒グラフモデル
 */
export function mapShipmentToBarChart(
  plans: ShipmentPlan[],
  actuals: ShipmentActual[],
  config?: {
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
  }
): BarChartModel {
  const aggregated = aggregateByDate(plans, actuals);

  // 予定データの配列
  const planData: BarChartDataItem[] = aggregated.map(item => ({
    category: formatDateLabel(item.date),
    value: item.planTotal,
  }));

  // 実績データの配列
  const actualData: BarChartDataItem[] = aggregated.map(item => ({
    category: formatDateLabel(item.date),
    value: item.actualTotal,
  }));

  return {
    series: [
      {
        name: '出荷予定',
        data: planData,
        color: '#50C878',
      },
      {
        name: '出荷実績',
        data: actualData,
        color: '#FF6B35',
      },
    ],
    config: {
      title: config?.title || '出荷予実推移（日次）',
      xAxisLabel: config?.xAxisLabel || '出荷日',
      yAxisLabel: config?.yAxisLabel || '数量',
      showLegend: true,
      showGrid: true,
      animation: true,
    },
  };
}
