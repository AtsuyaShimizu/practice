import { Component, OnInit, computed, input, output, signal } from '@angular/core';
import { ShipmentPlan, ShipmentActual } from '../../../../model/domain';
import { LineChartModel } from '../../../../model/graph';
import { mapShipmentToLineChart } from '../../../../mapper';
import { LineChartComponent } from '../line-chart/line-chart.component';
import { CardComponent, LegendItem } from '../../card/card.component';

@Component({
  selector: 'app-shipment-plan-actual-line-chart',
  imports: [LineChartComponent, CardComponent],
  templateUrl: './shipment-plan-actual-line-chart.html',
  styleUrl: './shipment-plan-actual-line-chart.scss',
})
export class ShipmentPlanActualLineChartComponent implements OnInit {
  plans = input.required<ShipmentPlan[]>();
  actuals = input.required<ShipmentActual[]>();
  title = input<string>('出荷予実推移（日次）');
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
      this.chartData = mapShipmentToLineChart(plans, actuals, {
        title: this.title(),
      });

      console.log("出荷線グラフ変換後：", this.chartData);
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
