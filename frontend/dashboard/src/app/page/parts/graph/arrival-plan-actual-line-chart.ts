import { Component, OnInit, input } from '@angular/core';
import { ArrivalPlan, ArrivalActual } from '../../../model/domain';
import { LineChartModel } from '../../../model/graph';
import { mapArrivalToLineChart } from '../../../mapper';
import { LineChartComponent } from './line-chart.component';

@Component({
  selector: 'app-arrival-plan-actual-line-chart',
  imports: [LineChartComponent],
  templateUrl: './arrival-plan-actual-line-chart.html',
  styleUrl: './arrival-plan-actual-line-chart.scss',
})
export class ArrivalPlanActualLineChartComponent implements OnInit {
  plans = input.required<ArrivalPlan[]>();
  actuals = input.required<ArrivalActual[]>();
  title = input<string>('入荷予実推移（1時間単位）');

  chartData: LineChartModel | null = null;

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
}
