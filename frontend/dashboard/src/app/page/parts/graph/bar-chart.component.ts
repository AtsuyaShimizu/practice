import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, inject, input } from '@angular/core';
import { BarChartModel } from '../../../model/graph';

@Component({
  selector: 'app-bar-chart',
  imports: [],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss',
})
export class BarChartComponent implements OnInit, AfterViewInit, OnDestroy {
  chartData = input.required<BarChartModel | null>();

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
    category: '',
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
   */
  private roundUpToNice(value: number): number {
    if (value <= 0) return 0;

    const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
    const normalized = value / magnitude;

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
   */
  private calculateNiceStep(max: number, targetSteps: number = 5): number {
    const rawStep = max / targetSteps;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;

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
   * Y値の最小値と最大値を取得
   */
  private getYRange(): { min: number; max: number } {
    const data = this.chartData();
    if (!data || data.series.length === 0) {
      return { min: 0, max: 100 };
    }

    const allValues = data.series.flatMap(s => s.data.map(d => d.value));
    const dataMax = Math.max(...allValues, 0);

    const min = 0;
    const maxWithMargin = dataMax * 1.05;
    const max = this.roundUpToNice(maxWithMargin);

    return { min, max };
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
   * カテゴリの一覧を取得（重複なし、ソート済み）
   */
  getCategories(): string[] {
    const data = this.chartData();
    if (!data || data.series.length === 0) return [];

    const categories = new Set<string>();
    data.series.forEach(series => {
      series.data.forEach(item => categories.add(item.category));
    });

    return Array.from(categories).sort();
  }

  /**
   * 各カテゴリのグループの情報を取得
   * カテゴリごとに複数の棒（シリーズ）が横並びになる
   */
  getBarGroups(): Array<{
    category: string;
    x: number;
    bars: Array<{
      seriesIndex: number;
      seriesName: string;
      color: string;
      value: number;
      barX: number;
      barY: number;
      barHeight: number;
      barWidth: number;
    }>;
  }> {
    const data = this.chartData();
    if (!data) return [];

    const categories = this.getCategories();
    const seriesCount = data.series.length;

    // カテゴリごとのグループ幅とマージン
    const groupWidth = this.chartWidth / categories.length;
    const groupPadding = groupWidth * 0.2; // グループ間の余白
    const availableWidth = groupWidth - groupPadding;

    // 各棒の幅とマージン
    const barMargin = 4; // 棒同士の間隔
    const barWidth = (availableWidth - (seriesCount - 1) * barMargin) / seriesCount;

    return categories.map((category, categoryIndex) => {
      const groupX = categoryIndex * groupWidth + groupPadding / 2;

      const bars = data.series.map((series, seriesIndex) => {
        const dataItem = series.data.find(d => d.category === category);
        const value = dataItem?.value || 0;

        const barX = groupX + seriesIndex * (barWidth + barMargin);
        const barY = this.valueToY(value);
        const barHeight = this.chartHeight - barY;

        return {
          seriesIndex,
          seriesName: series.name,
          color: series.color || '#ccc',
          value,
          barX,
          barY,
          barHeight,
          barWidth,
        };
      });

      return {
        category,
        x: groupX + availableWidth / 2, // カテゴリラベルの中心位置
        bars,
      };
    });
  }

  /**
   * Y軸のメモリとラベルを取得
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
   * Y軸のラベルを取得
   */
  getYAxisLabels(): Array<{ y: number; text: string }> {
    const { min, max } = this.getYRange();
    const step = this.calculateNiceStep(max);

    const labels = [];
    for (let value = min; value <= max; value += step) {
      const y = this.valueToY(value);
      const text = value.toLocaleString();
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
  showTooltip(event: MouseEvent, bar: {
    seriesName: string;
    value: number;
    barX: number;
    barY: number;
    barWidth: number;
  }, category: string): void {
    const valueString = bar.value.toLocaleString();

    // 棒の中心位置にツールチップを配置
    this.tooltip = {
      visible: true,
      x: bar.barX + bar.barWidth / 2 + this.padding.left,
      y: bar.barY + this.padding.top - 10,
      seriesName: bar.seriesName,
      category: category,
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
