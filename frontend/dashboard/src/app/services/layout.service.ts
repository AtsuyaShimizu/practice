import { Injectable, signal, computed } from '@angular/core';
import { LayoutType, PlacedGraph, GraphType } from '../model/domain';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  // 現在のレイアウトタイプ
  private currentLayoutType = signal<LayoutType>(LayoutType.Single);

  // 配置されたグラフ
  private placedGraphs = signal<PlacedGraph[]>([]);

  // 現在のレイアウトタイプを取得
  readonly layoutType = this.currentLayoutType.asReadonly();

  // 配置されたグラフを取得
  readonly graphs = this.placedGraphs.asReadonly();

  // スロット数を計算
  readonly slotCount = computed(() => {
    switch (this.currentLayoutType()) {
      case LayoutType.Single:
        return 1;
      case LayoutType.TwoColumns:
      case LayoutType.TwoRows:
        return 2;
      case LayoutType.TopOne:
      case LayoutType.BottomOne:
        return 3;
      case LayoutType.Grid2x2:
        return 4;
      default:
        return 1;
    }
  });

  /**
   * レイアウトタイプを変更
   */
  setLayout(layoutType: LayoutType): void {
    const currentSlotCount = this.slotCount();
    const newSlotCount = this.getSlotCountForLayout(layoutType);

    this.currentLayoutType.set(layoutType);

    // スロット数が減った場合、余分なグラフを削除
    if (newSlotCount < currentSlotCount) {
      this.placedGraphs.update(graphs =>
        graphs.filter(g => g.slotIndex < newSlotCount)
      );
    }
  }

  /**
   * グラフを追加
   */
  addGraph(graphType: GraphType, slotIndex: number): void {
    const id = `${graphType}-${Date.now()}`;
    const newGraph: PlacedGraph = {
      id,
      type: graphType,
      slotIndex,
    };

    this.placedGraphs.update(graphs => {
      // 同じスロットに既にグラフがある場合は置き換え
      const filtered = graphs.filter(g => g.slotIndex !== slotIndex);
      return [...filtered, newGraph];
    });
  }

  /**
   * グラフを削除
   */
  removeGraph(graphId: string): void {
    this.placedGraphs.update(graphs =>
      graphs.filter(g => g.id !== graphId)
    );
  }

  /**
   * 特定のスロットのグラフを取得
   */
  getGraphAtSlot(slotIndex: number): PlacedGraph | undefined {
    return this.placedGraphs().find(g => g.slotIndex === slotIndex);
  }

  /**
   * レイアウトタイプに応じたスロット数を取得
   */
  private getSlotCountForLayout(layoutType: LayoutType): number {
    switch (layoutType) {
      case LayoutType.Single:
        return 1;
      case LayoutType.TwoColumns:
      case LayoutType.TwoRows:
        return 2;
      case LayoutType.TopOne:
      case LayoutType.BottomOne:
        return 3;
      case LayoutType.Grid2x2:
        return 4;
      default:
        return 1;
    }
  }

  /**
   * グリッドテンプレートを取得
   */
  getGridTemplate(): string {
    switch (this.currentLayoutType()) {
      case LayoutType.Single:
        return '1fr';
      case LayoutType.TwoColumns:
        return '1fr / 1fr 1fr'; // 1行2列
      case LayoutType.TwoRows:
        return '1fr 1fr / 1fr'; // 2行1列
      case LayoutType.Grid2x2:
        return '1fr 1fr / 1fr 1fr';
      case LayoutType.TopOne:
        return '1fr 1fr / 1fr 1fr';
      case LayoutType.BottomOne:
        return '1fr 1fr / 1fr 1fr';
      default:
        return '1fr';
    }
  }

  /**
   * スロットのグリッド位置を取得
   */
  getSlotGridArea(slotIndex: number): string {
    const layoutType = this.currentLayoutType();

    switch (layoutType) {
      case LayoutType.TopOne:
        if (slotIndex === 0) return '1 / 1 / 2 / 3'; // 上段全体
        if (slotIndex === 1) return '2 / 1 / 3 / 2'; // 下段左
        if (slotIndex === 2) return '2 / 2 / 3 / 3'; // 下段右
        break;

      case LayoutType.BottomOne:
        if (slotIndex === 0) return '1 / 1 / 2 / 2'; // 上段左
        if (slotIndex === 1) return '1 / 2 / 2 / 3'; // 上段右
        if (slotIndex === 2) return '2 / 1 / 3 / 3'; // 下段全体
        break;
    }

    return 'auto'; // デフォルト（グリッドの自動配置）
  }
}
