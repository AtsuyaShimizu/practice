import { Component, OnInit, computed, input, output, signal } from '@angular/core';
import { ShipmentPlan, ShipmentActual } from '../../../model/domain';
import { BarChartModel } from '../../../model/graph';
import { mapShipmentToBarChart } from '../../../mapper';
import { BarChartComponent } from './bar-chart.component';
import { CardComponent, LegendItem } from '../card/card.component';

@Component({
  selector: 'app-shipment-plan-actual-bar-chart',
  imports: [BarChartComponent, CardComponent],
  templateUrl: './shipment-plan-actual-bar-chart.html',
  styleUrl: './shipment-plan-actual-bar-chart.scss',
})
export class ShipmentPlanActualBarChartComponent implements OnInit {
  plans = input.required<ShipmentPlan[]>();
  actuals = input.required<ShipmentActual[]>();
  title = input<string>('出荷予実推移（日次）');
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
      this.chartData = mapShipmentToBarChart(plans, actuals, {
        title: this.title(),
      });

      console.log("出荷棒グラフ変換後：", this.chartData);
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
