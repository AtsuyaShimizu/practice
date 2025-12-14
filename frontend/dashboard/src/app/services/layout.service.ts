import { Injectable, signal, computed } from '@angular/core';
import { LayoutType, PlacedGraph, GraphType } from '../model/domain';

/**
 * 画面の種類
 */
export type PageType = 'arrival' | 'shipment';

/**
 * 各画面の状態
 */
interface PageState {
  layoutType: LayoutType;
  graphs: PlacedGraph[];
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  // 現在の画面
  private currentPage = signal<PageType>('arrival');

  // 各画面の状態を保持（signalとして管理）
  private pageStates = signal(new Map<PageType, PageState>([
    ['arrival', { layoutType: LayoutType.Single, graphs: [] }],
    ['shipment', { layoutType: LayoutType.Single, graphs: [] }],
  ]));

  // 現在の画面の状態を取得するcomputed
  private currentPageState = computed(() => {
    return this.pageStates().get(this.currentPage())!;
  });

  // 現在のレイアウトタイプを取得
  readonly layoutType = computed(() => this.currentPageState().layoutType);

  // 配置されたグラフを取得
  readonly graphs = computed(() => this.currentPageState().graphs);

  // スロット数を計算
  readonly slotCount = computed(() => {
    switch (this.layoutType()) {
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
   * 現在の画面を設定
   */
  setCurrentPage(page: PageType): void {
    this.currentPage.set(page);
  }

  /**
   * 現在の画面を取得
   */
  getCurrentPage(): PageType {
    return this.currentPage();
  }

  /**
   * レイアウトタイプを変更
   */
  setLayout(layoutType: LayoutType): void {
    const currentSlotCount = this.slotCount();
    const newSlotCount = this.getSlotCountForLayout(layoutType);

    const page = this.currentPage();
    const currentStates = this.pageStates();
    const state = currentStates.get(page)!;

    // 新しい状態を作成（浅いコピー）
    const newState: PageState = {
      layoutType: layoutType,
      graphs: newSlotCount < currentSlotCount
        ? state.graphs.filter(g => g.slotIndex < newSlotCount)
        : state.graphs
    };

    // 新しいMapを作成して状態を更新
    const newStates = new Map(currentStates);
    newStates.set(page, newState);
    this.pageStates.set(newStates);
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

    const page = this.currentPage();
    const currentStates = this.pageStates();
    const state = currentStates.get(page)!;

    // 同じスロットに既にグラフがある場合は置き換え
    const filtered = state.graphs.filter(g => g.slotIndex !== slotIndex);

    // 新しい状態を作成（浅いコピー）
    const newState: PageState = {
      layoutType: state.layoutType,
      graphs: [...filtered, newGraph]
    };

    // 新しいMapを作成して状態を更新
    const newStates = new Map(currentStates);
    newStates.set(page, newState);
    this.pageStates.set(newStates);
  }

  /**
   * グラフを削除
   */
  removeGraph(graphId: string): void {
    const page = this.currentPage();
    const currentStates = this.pageStates();
    const state = currentStates.get(page)!;

    // 新しい状態を作成（浅いコピー）
    const newState: PageState = {
      layoutType: state.layoutType,
      graphs: state.graphs.filter(g => g.id !== graphId)
    };

    // 新しいMapを作成して状態を更新
    const newStates = new Map(currentStates);
    newStates.set(page, newState);
    this.pageStates.set(newStates);
  }

  /**
   * 特定のスロットのグラフを取得
   */
  getGraphAtSlot(slotIndex: number): PlacedGraph | undefined {
    return this.graphs().find(g => g.slotIndex === slotIndex);
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
    switch (this.layoutType()) {
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
    const layoutType = this.layoutType();

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
