import { Component, OnInit, input } from '@angular/core';
import { ArrivalPlan, ArrivalActual } from '../../../model/domain';
import { LineChartModel } from '../../../model/graph';
import { mapArrivalToLineChart } from '../../../mapper';

@Component({
  selector: 'app-arrival-plan-actual-line-chart',
  imports: [],
  templateUrl: './arrival-plan-actual-line-chart.html',
  styleUrl: './arrival-plan-actual-line-chart.scss',
})
export class ArrivalPlanActualLineChartComponent implements OnInit {
  plans = input.required<ArrivalPlan[]>();
  actuals = input.required<ArrivalActual[]>();
  title = input<string>('入荷予実推移（1時間単位）');

  chartData: LineChartModel | null = null;

  // SVGのサイズ設定
  readonly width = 800;
  readonly height = 300;
  readonly padding = { top: 20, right: 20, bottom: 40, left: 50 };
  readonly chartWidth = this.width - this.padding.left - this.padding.right;
  readonly chartHeight = this.height - this.padding.top - this.padding.bottom;

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
   * 全系列のY値の最小値と最大値を取得
   */
  private getYRange(): { min: number; max: number } {
    if (!this.chartData || this.chartData.series.length === 0) {
      return { min: 0, max: 100 };
    }

    const allValues = this.chartData.series.flatMap(s => s.data.map(d => d.y));
    const min = Math.min(...allValues, 0);
    const max = Math.max(...allValues, 100);

    // 余白を追加
    const range = max - min;
    return {
      min: min - range * 0.1,
      max: max + range * 0.1,
    };
  }

  /**
   * X軸の時間範囲を取得（1日分、24時間）
   */
  private getTimeRange(): { start: Date; end: Date } {
    if (!this.chartData || this.chartData.series.length === 0 || this.chartData.series[0].data.length === 0) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      return { start, end };
    }

    // データの最初の日付を基準に1日分の範囲を設定
    const firstDate = new Date(this.chartData.series[0].data[0].x as string);
    const start = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate(), 0, 0, 0);
    const end = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate(), 23, 59, 59);
    return { start, end };
  }

  /**
   * 時刻をX座標に変換
   */
  private timeToX(time: Date): number {
    const { start, end } = this.getTimeRange();
    const totalMs = end.getTime() - start.getTime();
    const currentMs = time.getTime() - start.getTime();
    return (currentMs / totalMs) * this.chartWidth;
  }

  /**
   * Y値をY座標に変換
   */
  private valueToY(value: number): number {
    const { min, max } = this.getYRange();
    const range = max - min || 1;
    return this.chartHeight - ((value - min) / range) * this.chartHeight;
  }

  /**
   * 線のポイント文字列を生成
   */
  getLinePoints(seriesIndex: number): string {
    if (!this.chartData || !this.chartData.series[seriesIndex]) {
      return '';
    }

    const series = this.chartData.series[seriesIndex];
    const points = series.data.map(d => {
      const x = this.timeToX(new Date(d.x as string));
      const y = this.valueToY(d.y);
      return `${x},${y}`;
    });

    return points.join(' ');
  }

  /**
   * エリアのパスを生成
   */
  getAreaPath(seriesIndex: number): string {
    if (!this.chartData || !this.chartData.series[seriesIndex]) {
      return '';
    }

    const series = this.chartData.series[seriesIndex];
    if (series.data.length === 0) return '';

    const points = series.data.map(d => {
      const x = this.timeToX(new Date(d.x as string));
      const y = this.valueToY(d.y);
      return { x, y };
    });

    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x},${points[i].y}`;
    }
    path += ` L ${points[points.length - 1].x},${this.chartHeight}`;
    path += ` L ${points[0].x},${this.chartHeight}`;
    path += ' Z';

    return path;
  }

  /**
   * データポイントの座標を取得
   */
  getPoints(seriesIndex: number): Array<{ x: number; y: number }> {
    if (!this.chartData || !this.chartData.series[seriesIndex]) {
      return [];
    }

    const series = this.chartData.series[seriesIndex];
    return series.data.map(d => ({
      x: this.timeToX(new Date(d.x as string)),
      y: this.valueToY(d.y),
    }));
  }

  /**
   * X軸のメモリ（1時間単位）を取得
   */
  getXAxisTicks(): Array<{ x: number; hour: number }> {
    const ticks = [];
    for (let hour = 0; hour <= 24; hour++) {
      const { start } = this.getTimeRange();
      const time = new Date(start);
      time.setHours(hour);
      const x = this.timeToX(time);
      ticks.push({ x, hour });
    }
    return ticks;
  }

  /**
   * X軸のラベル（4時間単位）を取得
   */
  getXAxisLabels(): Array<{ x: number; text: string }> {
    const labels = [];
    for (let hour = 0; hour <= 24; hour += 4) {
      const { start } = this.getTimeRange();
      const time = new Date(start);
      time.setHours(hour);
      const x = this.timeToX(time);
      const text = `${hour}:00`;
      labels.push({ x, text });
    }
    return labels;
  }

  /**
   * Y軸のメモリとラベルを取得
   */
  getYAxisTicks(): Array<{ y: number }> {
    const { min, max } = this.getYRange();
    const range = max - min;
    const step = range / 5;

    const ticks = [];
    for (let i = 0; i <= 5; i++) {
      const value = min + step * i;
      const y = this.valueToY(value);
      ticks.push({ y });
    }
    return ticks;
  }

  /**
   * Y軸のラベルを取得
   */
  getYAxisLabels(): Array<{ y: number; text: string }> {
    const { min, max } = this.getYRange();
    const range = max - min;
    const step = range / 5;

    const labels = [];
    for (let i = 0; i <= 5; i++) {
      const value = min + step * i;
      const y = this.valueToY(value);
      const text = Math.round(value).toString();
      labels.push({ y, text });
    }
    return labels;
  }

  /**
   * 水平グリッド線のY座標を取得
   */
  getHorizontalGridLines(): number[] {
    return this.getYAxisTicks().map(tick => tick.y);
  }
}
