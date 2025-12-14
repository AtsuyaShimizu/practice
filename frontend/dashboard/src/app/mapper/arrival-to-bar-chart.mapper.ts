import { ArrivalPlan, ArrivalActual } from '../model/domain';
import { BarChartModel, BarChartDataItem } from '../model/graph';

/**
 * 入荷予定と実績データを1時間ごとに集計
 */
interface HourlyAggregation {
  dateTime: string; // ISO形式の日時（時間まで）
  planTotal: number;
  actualTotal: number;
}

/**
 * 日時文字列から時間単位（YYYY-MM-DDTHH:00）を抽出
 */
function extractHour(dateTime: string): string {
  const date = new Date(dateTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:00`;
}

/**
 * 時間文字列を表示用フォーマットに変換（例: "2024-01-15T09:00" -> "09:00"）
 */
function formatHourLabel(dateTime: string): string {
  const date = new Date(dateTime);
  const hour = String(date.getHours()).padStart(2, '0');
  return `${hour}:00`;
}

/**
 * 入荷予定と実績データを1時間ごとに集計する
 */
function aggregateByHour(
  plans: ArrivalPlan[],
  actuals: ArrivalActual[]
): HourlyAggregation[] {
  const hourMap = new Map<string, HourlyAggregation>();

  // 予定データを集計
  plans.forEach(plan => {
    const hour = extractHour(plan.arrivalDateTime);
    const existing = hourMap.get(hour) || {
      dateTime: hour,
      planTotal: 0,
      actualTotal: 0,
    };
    existing.planTotal += plan.quantity;
    hourMap.set(hour, existing);
  });

  // 実績データを集計
  actuals.forEach(actual => {
    const hour = extractHour(actual.actualArrivalDateTime);
    const existing = hourMap.get(hour) || {
      dateTime: hour,
      planTotal: 0,
      actualTotal: 0,
    };
    existing.actualTotal += actual.quantity;
    hourMap.set(hour, existing);
  });

  // 時間順にソート
  return Array.from(hourMap.values()).sort((a, b) =>
    a.dateTime.localeCompare(b.dateTime)
  );
}

/**
 * 入荷予定と実績データを棒グラフモデルに変換する（時間ごとの比較）
 * @param plans 入荷予定データの配列
 * @param actuals 入荷実績データの配列
 * @param config グラフの設定（オプション）
 * @returns 棒グラフモデル
 */
export function mapArrivalToBarChart(
  plans: ArrivalPlan[],
  actuals: ArrivalActual[],
  config?: {
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
  }
): BarChartModel {
  const aggregated = aggregateByHour(plans, actuals);

  // 予定データの配列
  const planData: BarChartDataItem[] = aggregated.map(item => ({
    category: formatHourLabel(item.dateTime),
    value: item.planTotal,
  }));

  // 実績データの配列
  const actualData: BarChartDataItem[] = aggregated.map(item => ({
    category: formatHourLabel(item.dateTime),
    value: item.actualTotal,
  }));

  return {
    series: [
      {
        name: '入荷予定',
        data: planData,
        color: '#60A5FA',
      },
      {
        name: '入荷実績',
        data: actualData,
        color: '#F472B6',
      },
    ],
    config: {
      title: config?.title || '入荷予実推移（1時間単位）',
      xAxisLabel: config?.xAxisLabel || '時刻',
      yAxisLabel: config?.yAxisLabel || '数量',
      showLegend: true,
      showGrid: true,
      animation: true,
    },
  };
}
