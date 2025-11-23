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
  title = input<string>('入荷予実推移');

  chartData: LineChartModel | null = null;
  viewBox = '0 0 800 300';

  // グラフの描画領域の設定
  readonly margin = { top: 30, right: 120, bottom: 50, left: 60 };
  readonly width = 800;
  readonly height = 300;
  readonly chartWidth = this.width - this.margin.left - this.margin.right;
  readonly chartHeight = this.height - this.margin.top - this.margin.bottom;

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
    }
  }

  /**
   * データポイントをSVG座標に変換
   */
  getDataPoints(seriesIndex: number): string {
    if (!this.chartData || !this.chartData.series[seriesIndex]) {
      return '';
    }

    const series = this.chartData.series[seriesIndex];
    const data = series.data;

    if (data.length === 0) {
      return '';
    }

    // X軸の範囲を計算
    const xValues = data.map(d => new Date(d.x as string).getTime());
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const xRange = maxX - minX || 1;

    // Y軸の範囲を計算（全シリーズの最大値を使用）
    const allYValues = this.chartData.series.flatMap(s => s.data.map(d => d.y));
    const maxY = Math.max(...allYValues);
    const minY = Math.min(...allYValues, 0);
    const yRange = maxY - minY || 1;

    // データポイントをSVG座標に変換
    const points = data.map(point => {
      const x = ((new Date(point.x as string).getTime() - minX) / xRange) * this.chartWidth;
      const y = this.chartHeight - ((point.y - minY) / yRange) * this.chartHeight;
      return `${x},${y}`;
    });

    return points.join(' ');
  }

  /**
   * 個別のポイント座標を取得（円を描画するため）
   */
  getPointCoordinates(seriesIndex: number): Array<{ x: number; y: number; value: number }> {
    if (!this.chartData || !this.chartData.series[seriesIndex]) {
      return [];
    }

    const series = this.chartData.series[seriesIndex];
    const data = series.data;

    if (data.length === 0) {
      return [];
    }

    const xValues = data.map(d => new Date(d.x as string).getTime());
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const xRange = maxX - minX || 1;

    const allYValues = this.chartData.series.flatMap(s => s.data.map(d => d.y));
    const maxY = Math.max(...allYValues);
    const minY = Math.min(...allYValues, 0);
    const yRange = maxY - minY || 1;

    return data.map(point => ({
      x: ((new Date(point.x as string).getTime() - minX) / xRange) * this.chartWidth,
      y: this.chartHeight - ((point.y - minY) / yRange) * this.chartHeight,
      value: point.y,
    }));
  }

  /**
   * X軸のラベルを生成
   */
  getXAxisLabels(): Array<{ x: number; label: string }> {
    if (!this.chartData || this.chartData.series.length === 0) {
      return [];
    }

    const firstSeries = this.chartData.series[0];
    const data = firstSeries.data;

    if (data.length === 0) {
      return [];
    }

    const xValues = data.map(d => new Date(d.x as string).getTime());
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const xRange = maxX - minX || 1;

    return data.map(point => {
      const x = ((new Date(point.x as string).getTime() - minX) / xRange) * this.chartWidth;
      const date = new Date(point.x as string);
      const label = `${date.getMonth() + 1}/${date.getDate()}`;
      return { x, label };
    });
  }

  /**
   * Y軸のラベルを生成
   */
  getYAxisLabels(): Array<{ y: number; label: string }> {
    if (!this.chartData || this.chartData.series.length === 0) {
      return [];
    }

    const allYValues = this.chartData.series.flatMap(s => s.data.map(d => d.y));
    const maxY = Math.max(...allYValues);
    const minY = Math.min(...allYValues, 0);
    const yRange = maxY - minY || 1;

    const labelCount = 5;
    const step = yRange / (labelCount - 1);

    return Array.from({ length: labelCount }, (_, i) => {
      const value = minY + step * i;
      const y = this.chartHeight - ((value - minY) / yRange) * this.chartHeight;
      return { y, label: Math.round(value).toString() };
    });
  }

  /**
   * グリッド線のY座標を取得
   */
  getGridLines(): number[] {
    return this.getYAxisLabels().map(label => label.y);
  }

  /**
   * エリアチャート用のパスを生成（線の下を塗りつぶす）
   */
  getAreaPath(seriesIndex: number): string {
    if (!this.chartData || !this.chartData.series[seriesIndex]) {
      return '';
    }

    const series = this.chartData.series[seriesIndex];
    const data = series.data;

    if (data.length === 0) {
      return '';
    }

    const xValues = data.map(d => new Date(d.x as string).getTime());
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const xRange = maxX - minX || 1;

    const allYValues = this.chartData.series.flatMap(s => s.data.map(d => d.y));
    const maxY = Math.max(...allYValues);
    const minY = Math.min(...allYValues, 0);
    const yRange = maxY - minY || 1;

    const points = data.map(point => {
      const x = ((new Date(point.x as string).getTime() - minX) / xRange) * this.chartWidth;
      const y = this.chartHeight - ((point.y - minY) / yRange) * this.chartHeight;
      return { x, y };
    });

    if (points.length === 0) return '';

    // パスの開始
    let path = `M ${points[0].x},${points[0].y}`;

    // 線を描画
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x},${points[i].y}`;
    }

    // 底辺に戻る
    path += ` L ${points[points.length - 1].x},${this.chartHeight}`;
    path += ` L ${points[0].x},${this.chartHeight}`;
    path += ' Z';

    return path;
  }
}
