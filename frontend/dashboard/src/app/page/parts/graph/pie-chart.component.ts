import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, inject, input } from '@angular/core';
import { PieChartModel } from '../../../model/graph';

interface SegmentData {
  startAngle: number;
  endAngle: number;
  path: string;
  centerX: number;
  centerY: number;
  label: string;
  value: number;
  color: string;
  percentage: number;
}

@Component({
  selector: 'app-pie-chart',
  imports: [],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss',
})
export class PieChartComponent implements OnInit, AfterViewInit, OnDestroy {
  chartData = input.required<PieChartModel | null>();

  @ViewChild('chartContainer')
  private chartContainerRef?: ElementRef<HTMLDivElement>;

  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  // SVGのサイズ設定
  width = 400;
  height = 400;
  private resizeObserver?: ResizeObserver;

  // 円グラフの中心と半径
  centerX = 200;
  centerY = 200;
  radius = 150;

  // セグメントデータ
  segments: SegmentData[] = [];

  // ツールチップ
  tooltip = {
    visible: false,
    x: 0,
    y: 0,
    label: '',
    value: '',
    percentage: ''
  };

  ngOnInit(): void {
    this.updateSegments();
  }

  ngAfterViewInit(): void {
    this.observeContainerResize();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  ngOnChanges(): void {
    this.updateSegments();
  }

  private observeContainerResize(): void {
    if (!this.chartContainerRef) return;

    this.resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;

      this.ngZone.run(() => {
        const { width, height } = entry.contentRect;
        // 正方形を保つ
        const size = Math.min(width, height);
        this.width = size;
        this.height = size;
        this.recalculateChartSize();
        this.updateSegments();
        this.cdr.detectChanges();
      });
    });

    this.resizeObserver.observe(this.chartContainerRef.nativeElement);

    // 初回のサイズ計算を次のフレームに遅延
    requestAnimationFrame(() => {
      const rect = this.chartContainerRef!.nativeElement.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
      this.width = size;
      this.height = size;
      this.recalculateChartSize();
      this.updateSegments();
      this.cdr.detectChanges();
    });
  }

  private recalculateChartSize(): void {
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.radius = Math.min(this.width, this.height) * 0.42; // サイズの42%を半径に（より大きく）
  }

  /**
   * セグメントデータを更新
   */
  private updateSegments(): void {
    const data = this.chartData();
    if (!data || data.segments.length === 0) {
      this.segments = [];
      return;
    }

    // 総和を計算
    const total = data.segments.reduce((sum, seg) => sum + seg.value, 0);
    if (total === 0) {
      this.segments = [];
      return;
    }

    const config = data.config || {};
    const startAngle = config.startAngle !== undefined ? config.startAngle : -90; // デフォルトは上から開始

    let currentAngle = startAngle;
    const defaultColors = ['#60A5FA', '#F472B6', '#34D399', '#FBBF24', '#A78BFA', '#F87171'];

    this.segments = data.segments.map((segment, index) => {
      const percentage = (segment.value / total) * 100;
      const angleSize = (segment.value / total) * 360;
      const endAngle = currentAngle + angleSize;

      const path = this.createArcPath(
        this.centerX,
        this.centerY,
        this.radius,
        currentAngle,
        endAngle,
        config.innerRadius || 0
      );

      // ラベル位置を計算（セグメントの中央）
      const labelAngle = (currentAngle + endAngle) / 2;
      const labelRadius = config.innerRadius
        ? this.radius - (this.radius - config.innerRadius) / 2
        : this.radius * 0.65;
      const { x, y } = this.polarToCartesian(this.centerX, this.centerY, labelRadius, labelAngle);

      const segmentData: SegmentData = {
        startAngle: currentAngle,
        endAngle: endAngle,
        path,
        centerX: x,
        centerY: y,
        label: segment.label,
        value: segment.value,
        color: segment.color || defaultColors[index % defaultColors.length],
        percentage: Math.round(percentage * 10) / 10
      };

      currentAngle = endAngle;
      return segmentData;
    });
  }

  /**
   * 円弧のSVGパスを作成
   */
  private createArcPath(
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    innerRadius: number = 0
  ): string {
    const start = this.polarToCartesian(centerX, centerY, radius, startAngle);
    const end = this.polarToCartesian(centerX, centerY, radius, endAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    if (innerRadius === 0) {
      // 通常の円グラフ（パイチャート）
      return [
        `M ${centerX} ${centerY}`,
        `L ${start.x} ${start.y}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
        'Z'
      ].join(' ');
    } else {
      // ドーナツグラフ
      const innerStart = this.polarToCartesian(centerX, centerY, innerRadius, startAngle);
      const innerEnd = this.polarToCartesian(centerX, centerY, innerRadius, endAngle);

      return [
        `M ${start.x} ${start.y}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
        `L ${innerEnd.x} ${innerEnd.y}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
        'Z'
      ].join(' ');
    }
  }

  /**
   * 極座標をデカルト座標に変換
   */
  private polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ): { x: number; y: number } {
    const angleInRadians = (angleInDegrees * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  }

  /**
   * ツールチップを表示
   */
  showTooltip(event: MouseEvent, segment: SegmentData): void {
    const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
    const containerRect = this.chartContainerRef?.nativeElement.getBoundingClientRect();

    if (!containerRect) return;

    this.tooltip = {
      visible: true,
      x: event.clientX - containerRect.left,
      y: event.clientY - containerRect.top,
      label: segment.label,
      value: segment.value.toLocaleString(),
      percentage: segment.percentage.toFixed(1)
    };
  }

  /**
   * ツールチップを非表示
   */
  hideTooltip(): void {
    this.tooltip.visible = false;
  }

  /**
   * セグメントがラベルを表示するか（パーセンテージが一定以上）
   */
  shouldShowLabel(segment: SegmentData): boolean {
    const config = this.chartData()?.config;
    if (config?.showLabels === false) return false;
    return segment.percentage >= 5; // 5%以上の場合のみ表示
  }

  /**
   * ラベルのテキストを取得
   */
  getLabelText(segment: SegmentData): string {
    const config = this.chartData()?.config;
    const parts: string[] = [];

    if (config?.showLabels !== false) {
      parts.push(segment.label);
    }

    if (config?.showPercentages) {
      parts.push(`${segment.percentage.toFixed(1)}%`);
    }

    if (config?.showValues) {
      parts.push(segment.value.toLocaleString());
    }

    // デフォルトはパーセンテージのみ
    if (parts.length === 0) {
      parts.push(`${segment.percentage.toFixed(1)}%`);
    }

    return parts.join('\n');
  }
}
