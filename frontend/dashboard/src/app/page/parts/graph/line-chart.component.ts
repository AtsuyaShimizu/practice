import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, inject, input } from '@angular/core';
import { LineChartModel } from '../../../model/graph';

@Component({
  selector: 'app-line-chart',
  imports: [],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
})
export class LineChartComponent implements OnInit, AfterViewInit, OnDestroy {
  chartData = input.required<LineChartModel | null>();

  @ViewChild('chartContainer')
  private chartContainerRef?: ElementRef<HTMLDivElement>;

  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  // SVGのサイズ設定
  width = 800;
  height = 300;
  readonly padding = { top: 20, right: 20, bottom: 40, left: 70 };
  chartWidth = this.width - this.padding.left - this.padding.right;
  chartHeight = this.height - this.padding.top - this.padding.bottom;
  private resizeObserver?: ResizeObserver;

  // ツールチップ
  tooltip = {
    visible: false,
    x: 0,
    y: 0,
    seriesName: '',
    time: '',
    value: ''
  };

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.observeContainerResize();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private observeContainerResize(): void {
    if (!this.chartContainerRef) return;

    this.resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;

      this.ngZone.run(() => {
        const { width, height } = entry.contentRect;
        this.width = width;
        this.height = height;
        this.recalculateChartSize();
        this.cdr.detectChanges();
      });
    });

    this.resizeObserver.observe(this.chartContainerRef.nativeElement);

    // 初回のサイズ計算を次のフレームに遅延
    requestAnimationFrame(() => {
      this.recalculateChartSize();
      this.cdr.detectChanges();
    });
  }

  private recalculateChartSize(): void {
    this.chartWidth = Math.max(this.width - this.padding.left - this.padding.right, 0);
    this.chartHeight = Math.max(this.height - this.padding.top - this.padding.bottom, 0);
  }

  /**
   * 切りの良い数値に切り上げる
   * 例: 5500 → 6000, 7200 → 8000, 90 → 100, 350 → 400
   */
  private roundUpToNice(value: number): number {
    if (value <= 0) return 0;

    // 桁数を取得
    const magnitude = Math.pow(10, Math.floor(Math.log10(value)));

    // 正規化された値（1-10の範囲）
    const normalized = value / magnitude;

    // 切りの良い値を選択 (1, 1.5, 2, 2.5, 4, 5, 6, 8, 10)
    // データに近い適切な値を選ぶことで無駄な余白を減らす
    let niceNormalized: number;
    if (normalized <= 1) niceNormalized = 1;
    else if (normalized <= 1.5) niceNormalized = 1.5;
    else if (normalized <= 2) niceNormalized = 2;
    else if (normalized <= 2.5) niceNormalized = 2.5;
    else if (normalized <= 4) niceNormalized = 4;
    else if (normalized <= 5) niceNormalized = 5;
    else if (normalized <= 6) niceNormalized = 6;
    else if (normalized <= 8) niceNormalized = 8;
    else niceNormalized = 10;

    return niceNormalized * magnitude;
  }

  /**
   * 適切なステップサイズを計算
   * 例: 最大値8000 → 2000, 最大値6000 → 1500, 最大値100 → 20
   */
  private calculateNiceStep(max: number, targetSteps: number = 5): number {
    const rawStep = max / targetSteps;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;

    // 切りの良いステップを選択 (1, 1.5, 2, 2.5, 5, 10)
    let niceNormalized: number;
    if (normalized <= 1) niceNormalized = 1;
    else if (normalized <= 1.5) niceNormalized = 1.5;
    else if (normalized <= 2) niceNormalized = 2;
    else if (normalized <= 2.5) niceNormalized = 2.5;
    else if (normalized <= 5) niceNormalized = 5;
    else niceNormalized = 10;

    return niceNormalized * magnitude;
  }

  /**
   * 全系列のY値の最小値と最大値を取得（0始まり、切りの良い最大値）
   */
  private getYRange(): { min: number; max: number } {
    const data = this.chartData();
    if (!data || data.series.length === 0) {
      return { min: 0, max: 100 };
    }

    const allValues = data.series.flatMap(s => s.data.map(d => d.y));
    const dataMax = Math.max(...allValues, 0);

    // 最小値は常に0
    const min = 0;

    // 最大値は切りの良い値に切り上げ（5%の余白）
    const maxWithMargin = dataMax * 1.05;
    const max = this.roundUpToNice(maxWithMargin);

    return { min, max };
  }

  /**
   * X軸の時間範囲を取得（データの実際の範囲に基づく）
   */
  private getTimeRange(): { start: Date; end: Date } {
    const data = this.chartData();
    if (!data || data.series.length === 0 || data.series[0].data.length === 0) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      return { start, end };
    }

    // 全系列のデータから時間範囲を取得
    const allTimes = data.series.flatMap(s => s.data.map(d => new Date(d.x as string).getTime()));
    const minTime = Math.min(...allTimes);
    const maxTime = Math.max(...allTimes);

    // 少し余白を持たせる（前後30分）
    const padding = 30 * 60 * 1000; // 30分をミリ秒に変換
    const start = new Date(minTime - padding);
    const end = new Date(maxTime + padding);

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
    const data = this.chartData();
    if (!data || !data.series[seriesIndex]) {
      return '';
    }

    const series = data.series[seriesIndex];
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
    const data = this.chartData();
    if (!data || !data.series[seriesIndex]) {
      return '';
    }

    const series = data.series[seriesIndex];
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
    const data = this.chartData();
    if (!data || !data.series[seriesIndex]) {
      return [];
    }

    const series = data.series[seriesIndex];
    return series.data.map(d => ({
      x: this.timeToX(new Date(d.x as string)),
      y: this.valueToY(d.y),
    }));
  }

  /**
   * X軸のメモリ（1時間単位）を取得
   */
  getXAxisTicks(): Array<{ x: number; hour: number }> {
    const { start, end } = this.getTimeRange();
    const ticks = [];

    // 開始時刻を1時間単位に切り上げ
    const startHour = new Date(start);
    startHour.setMinutes(0, 0, 0);
    if (start.getMinutes() > 0) {
      startHour.setHours(startHour.getHours() + 1);
    }

    // 1時間ごとにティックを生成
    const currentTime = new Date(startHour);
    while (currentTime <= end) {
      const x = this.timeToX(currentTime);
      const hour = currentTime.getHours();
      ticks.push({ x, hour });
      currentTime.setHours(currentTime.getHours() + 1);
    }

    return ticks;
  }

  /**
   * X軸のラベル（2時間単位）を取得
   */
  getXAxisLabels(): Array<{ x: number; text: string }> {
    const { start, end } = this.getTimeRange();
    const labels = [];

    // 開始時刻を2時間単位に切り上げ（偶数時間）
    const startHour = new Date(start);
    startHour.setMinutes(0, 0, 0);
    const hourOfDay = startHour.getHours();
    if (hourOfDay % 2 !== 0 || start.getMinutes() > 0) {
      startHour.setHours(hourOfDay + (2 - hourOfDay % 2));
    }

    // 2時間ごとにラベルを生成
    const currentTime = new Date(startHour);
    while (currentTime <= end) {
      const x = this.timeToX(currentTime);
      const hour = currentTime.getHours();
      const text = `${hour}:00`;
      labels.push({ x, text });
      currentTime.setHours(currentTime.getHours() + 2);
    }

    return labels;
  }

  /**
   * Y軸のメモリとラベルを取得（切りの良い間隔で）
   */
  getYAxisTicks(): Array<{ y: number }> {
    const { min, max } = this.getYRange();
    const step = this.calculateNiceStep(max);

    const ticks = [];
    for (let value = min; value <= max; value += step) {
      const y = this.valueToY(value);
      ticks.push({ y });
    }
    return ticks;
  }

  /**
   * Y軸のラベルを取得（切りの良い間隔で）
   */
  getYAxisLabels(): Array<{ y: number; text: string }> {
    const { min, max } = this.getYRange();
    const step = this.calculateNiceStep(max);

    const labels = [];
    for (let value = min; value <= max; value += step) {
      const y = this.valueToY(value);
      const text = value.toLocaleString(); // カンマ区切りで見やすく
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

  /**
   * ツールチップを表示
   */
  showTooltip(event: MouseEvent, seriesIndex: number, pointIndex: number): void {
    const data = this.chartData();
    if (!data || !data.series[seriesIndex]) return;

    const series = data.series[seriesIndex];
    const point = series.data[pointIndex];

    // データポイントの値を取得
    const time = new Date(point.x as string);
    const value = point.y;

    // 時刻をフォーマット
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    // 値をカンマ区切りでフォーマット
    const valueString = value.toLocaleString();

    // SVG要素の位置を取得
    const pointX = (event.target as SVGCircleElement).cx.baseVal.value;
    const pointY = (event.target as SVGCircleElement).cy.baseVal.value;

    // ツールチップの位置を計算（SVGの座標系 + padding）
    this.tooltip = {
      visible: true,
      x: pointX + this.padding.left,
      y: pointY + this.padding.top - 10, // データポイントの少し上に表示
      seriesName: series.name,
      time: timeString,
      value: valueString
    };
  }

  /**
   * ツールチップを非表示
   */
  hideTooltip(): void {
    this.tooltip.visible = false;
  }
}
