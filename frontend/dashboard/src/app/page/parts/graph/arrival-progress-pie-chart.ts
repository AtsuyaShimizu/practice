import { Component, OnInit, computed, input, output, signal } from '@angular/core';
import { ArrivalPlan, ArrivalActual, ArrivalProcess } from '../../../model/domain';
import { PieChartModel, PieChartSegment } from '../../../model/graph';
import { PieChartComponent } from './pie-chart.component';
import { CardComponent, LegendItem } from '../card/card.component';

export interface ProgressStatus {
  status: 'ahead' | 'on-track' | 'delayed';
  label: string;
  color: string;
}

export interface ProcessProgress {
  process: ArrivalProcess;
  plannedQuantity: number;
  actualQuantity: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-arrival-progress-pie-chart',
  imports: [PieChartComponent, CardComponent],
  templateUrl: './arrival-progress-pie-chart.html',
  styleUrl: './arrival-progress-pie-chart.scss',
})
export class ArrivalProgressPieChartComponent implements OnInit {
  plans = input.required<ArrivalPlan[]>();
  actuals = input.required<ArrivalActual[]>();
  title = input<string>('入荷進捗状況');
  showCloseButton = input<boolean>(false);

  onClose = output<void>();

  chartData: PieChartModel | null = null;
  isVisible = signal(true);

  // 進捗情報
  totalPlannedQuantity = 0;
  plannedUntilNow = 0;
  actualQuantity = 0;
  progressPercentage = 0;
  expectedProgressPercentage = 0;
  progressStatus: ProgressStatus = { status: 'on-track', label: '予定通り', color: '#34D399' };

  // 工程別進捗
  processProgresses: ProcessProgress[] = [];

  // カードコンポーネント用の凡例アイテム
  legendItems = computed<LegendItem[]>(() => {
    if (!this.chartData) return [];
    return this.chartData.segments.map(segment => ({
      name: segment.label,
      color: segment.color || '#ccc',
      shape: 'square' as const,
    }));
  });

  ngOnInit(): void {
    this.updateChart();
  }

  ngOnChanges(): void {
    this.updateChart();
  }

  private updateChart(): void {
    const plans = this.plans();
    const actuals = this.actuals();

    if (!plans || !actuals) return;

    // 進捗データを計算
    const progressData = this.calculateProgress(plans, actuals);

    // 進捗情報を保存
    this.totalPlannedQuantity = progressData.totalPlannedQuantity;
    this.plannedUntilNow = progressData.plannedUntilNow;
    this.actualQuantity = progressData.actualQuantity;
    this.progressPercentage = progressData.progressPercentage;
    this.expectedProgressPercentage = progressData.expectedProgressPercentage;
    this.progressStatus = progressData.status;

    // 工程別進捗を計算
    this.processProgresses = this.calculateProcessProgress(plans, actuals);

    // 円グラフデータを作成
    this.chartData = this.createPieChartData(progressData);
  }

  /**
   * 進捗データを計算
   */
  private calculateProgress(plans: ArrivalPlan[], actuals: ArrivalActual[]) {
    const now = new Date();

    // 一日の予定の総和を計算
    const totalPlannedQuantity = plans.reduce((sum, plan) => sum + plan.quantity, 0);

    // 現在時刻までの予定の総和を計算
    const plannedUntilNow = plans
      .filter(plan => new Date(plan.arrivalDateTime) <= now)
      .reduce((sum, plan) => sum + plan.quantity, 0);

    // 現在時刻までの実績の総和を計算
    const actualQuantity = actuals
      .filter(actual => new Date(actual.actualArrivalDateTime) <= now)
      .reduce((sum, actual) => sum + actual.quantity, 0);

    // 進捗率を計算
    const progressPercentage = totalPlannedQuantity > 0
      ? (actualQuantity / totalPlannedQuantity) * 100
      : 0;

    // 期待される進捗率（現在時刻までの予定 / 一日の予定）
    const expectedProgressPercentage = totalPlannedQuantity > 0
      ? (plannedUntilNow / totalPlannedQuantity) * 100
      : 0;

    // 進捗状況を判定
    const status = this.determineProgressStatus(
      actualQuantity,
      plannedUntilNow,
      totalPlannedQuantity
    );

    return {
      totalPlannedQuantity,
      plannedUntilNow,
      actualQuantity,
      progressPercentage,
      expectedProgressPercentage,
      status,
    };
  }

  /**
   * 工程別進捗を計算
   */
  private calculateProcessProgress(plans: ArrivalPlan[], actuals: ArrivalActual[]): ProcessProgress[] {
    const now = new Date();
    const processes: ArrivalProcess[] = ['入荷', '検品', '入庫'];
    const processColors: Record<ArrivalProcess, string> = {
      '入荷': '#60A5FA',
      '検品': '#FBBF24',
      '入庫': '#34D399',
    };

    return processes.map(process => {
      // 該当工程の予定総数（現在時刻まで）
      const plannedQuantity = plans
        .filter(plan => plan.process === process && new Date(plan.arrivalDateTime) <= now)
        .reduce((sum, plan) => sum + plan.quantity, 0);

      // 該当工程の実績総数（現在時刻まで）
      const actualQuantity = actuals
        .filter(actual => actual.process === process && new Date(actual.actualArrivalDateTime) <= now)
        .reduce((sum, actual) => sum + actual.quantity, 0);

      // 進捗率
      const percentage = plannedQuantity > 0
        ? Math.min(100, (actualQuantity / plannedQuantity) * 100)
        : 0;

      return {
        process,
        plannedQuantity,
        actualQuantity,
        percentage,
        color: processColors[process],
      };
    });
  }

  /**
   * 進捗状況を判定
   */
  private determineProgressStatus(
    actualQuantity: number,
    plannedUntilNow: number,
    totalPlannedQuantity: number
  ): ProgressStatus {
    if (totalPlannedQuantity === 0) {
      return { status: 'on-track', label: '予定通り', color: '#34D399' };
    }

    // 許容範囲（±5%）
    const tolerance = totalPlannedQuantity * 0.05;
    const difference = actualQuantity - plannedUntilNow;

    if (difference > tolerance) {
      return { status: 'ahead', label: '先行', color: '#60A5FA' };
    } else if (difference < -tolerance) {
      return { status: 'delayed', label: '遅延', color: '#F87171' };
    } else {
      return { status: 'on-track', label: '予定通り', color: '#34D399' };
    }
  }

  /**
   * 円グラフデータを作成
   */
  private createPieChartData(progressData: {
    totalPlannedQuantity: number;
    actualQuantity: number;
    progressPercentage: number;
  }): PieChartModel {
    const segments: PieChartSegment[] = [];
    const { totalPlannedQuantity, actualQuantity } = progressData;

    if (totalPlannedQuantity === 0) {
      // 予定がない場合
      segments.push({
        label: '予定なし',
        value: 100,
        color: '#9CA3AF',
      });
    } else {
      // 実績セグメント
      if (actualQuantity > 0) {
        segments.push({
          label: '実績',
          value: actualQuantity,
          color: this.progressStatus.color,
        });
      }

      // 残りのセグメント
      const remaining = totalPlannedQuantity - actualQuantity;
      if (remaining > 0) {
        segments.push({
          label: '未完了',
          value: remaining,
          color: '#3a3a3a',
        });
      } else if (remaining < 0) {
        // 超過分を表示（実績を100%として超過分を追加）
        const total = actualQuantity;
        segments[0].value = totalPlannedQuantity; // 予定分
        segments.push({
          label: '超過',
          value: Math.abs(remaining),
          color: '#FBBF24',
        });
      }
    }

    return {
      segments,
      config: {
        showLegend: true,
        showLabels: true,
        showPercentages: true,
        showValues: false,
        innerRadius: 90, // ドーナツチャートにする（中央のテキストと干渉しないよう大きめに）
        startAngle: -90, // 上から開始
      },
    };
  }

  /**
   * グラフを閉じる
   */
  handleClose(): void {
    this.isVisible.set(false);
    this.onClose.emit();
  }

  /**
   * 進捗率のテキストを取得（中央に表示用）
   */
  getProgressText(): string {
    return `${Math.round(this.progressPercentage)}%`;
  }

  /**
   * 進捗状況の詳細テキストを取得
   */
  getProgressDetailText(): string {
    return `実績: ${this.actualQuantity.toLocaleString()} / 予定: ${this.totalPlannedQuantity.toLocaleString()}`;
  }

  /**
   * 現在時刻までの予定との比較テキストを取得
   */
  getExpectedProgressText(): string {
    const diff = this.actualQuantity - this.plannedUntilNow;
    const diffAbs = Math.abs(diff);

    if (diff > 0) {
      return `予定より ${diffAbs.toLocaleString()} 先行`;
    } else if (diff < 0) {
      return `予定より ${diffAbs.toLocaleString()} 遅延`;
    } else {
      return '予定通り';
    }
  }
}
