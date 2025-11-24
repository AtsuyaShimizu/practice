import { Component, OnInit, computed, input, output, signal } from '@angular/core';
import { ArrivalPlan, ArrivalActual } from '../../../model/domain';
import { LineChartModel } from '../../../model/graph';
import { mapArrivalToLineChart } from '../../../mapper';
import { LineChartComponent } from './line-chart.component';
import { CardComponent, LegendItem } from '../card/card.component';

@Component({
  selector: 'app-arrival-plan-actual-line-chart',
  imports: [LineChartComponent, CardComponent],
  templateUrl: './arrival-plan-actual-line-chart.html',
  styleUrl: './arrival-plan-actual-line-chart.scss',
})
export class ArrivalPlanActualLineChartComponent implements OnInit {
  plans = input.required<ArrivalPlan[]>();
  actuals = input.required<ArrivalActual[]>();
  title = input<string>('入荷予実推移（1時間単位）');
  showCloseButton = input<boolean>(false);

  onClose = output<void>();

  chartData: LineChartModel | null = null;
  isVisible = signal(true);

  // カードコンポーネント用の凡例アイテム
  legendItems = computed<LegendItem[]>(() => {
    if (!this.chartData) return [];
    return this.chartData.series.map(series => ({
      name: series.name,
      color: series.color || '#ccc',
      shape: 'line' as const,
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

    if (plans && actuals) {
      this.chartData = mapArrivalToLineChart(plans, actuals, {
        title: this.title(),
      });

      console.log("変換後：", this.chartData);
    }
  }

  /**
   * グラフを閉じる
   */
  handleClose(): void {
    this.isVisible.set(false);
    this.onClose.emit();
  }
}
