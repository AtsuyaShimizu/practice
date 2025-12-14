import { Component, OnInit, computed, input, output, signal } from '@angular/core';
import { ArrivalPlan, ArrivalActual } from '../../../model/domain';
import { BarChartModel } from '../../../model/graph';
import { mapArrivalToBarChart } from '../../../mapper';
import { BarChartComponent } from './bar-chart.component';
import { CardComponent, LegendItem } from '../card/card.component';

@Component({
  selector: 'app-arrival-plan-actual-bar-chart',
  imports: [BarChartComponent, CardComponent],
  templateUrl: './arrival-plan-actual-bar-chart.html',
  styleUrl: './arrival-plan-actual-bar-chart.scss',
})
export class ArrivalPlanActualBarChartComponent implements OnInit {
  plans = input.required<ArrivalPlan[]>();
  actuals = input.required<ArrivalActual[]>();
  title = input<string>('入荷予実推移（1時間単位）');
  showCloseButton = input<boolean>(false);

  onClose = output<void>();

  chartData: BarChartModel | null = null;
  isVisible = signal(true);

  // カードコンポーネント用の凡例アイテム
  legendItems = computed<LegendItem[]>(() => {
    if (!this.chartData) return [];
    return this.chartData.series.map(series => ({
      name: series.name,
      color: series.color || '#ccc',
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

    if (plans && actuals) {
      this.chartData = mapArrivalToBarChart(plans, actuals, {
        title: this.title(),
      });

      console.log("棒グラフ変換後：", this.chartData);
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
