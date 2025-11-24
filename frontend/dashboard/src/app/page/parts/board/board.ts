import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from '../../../services/layout.service';
import { GraphSelectorComponent } from '../graph-selector/graph-selector';
import { GraphType } from '../../../model/domain';

@Component({
  selector: 'app-board',
  imports: [GraphSelectorComponent],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class BoardComponent {
  readonly layoutService = inject(LayoutService);
  private readonly router = inject(Router);

  // グラフ選択モーダルの表示状態
  isGraphSelectorOpen = signal(false);
  selectedSlotIndex = signal<number | null>(null);

  // 現在のページカテゴリ
  readonly currentCategory = computed<'arrival' | 'shipment'>(() => {
    const url = this.router.url;
    return url.includes('shipment') ? 'shipment' : 'arrival';
  });

  // レイアウト情報
  readonly slotCount = this.layoutService.slotCount;
  readonly layoutType = this.layoutService.layoutType;
  readonly placedGraphs = this.layoutService.graphs;

  // スロットの配列を生成
  readonly slots = computed(() => {
    return Array.from({ length: this.slotCount() }, (_, i) => i);
  });

  /**
   * スロットをクリック
   */
  onSlotClick(slotIndex: number): void {
    const existingGraph = this.layoutService.getGraphAtSlot(slotIndex);
    if (!existingGraph) {
      // グラフがない場合、選択モーダルを開く
      this.selectedSlotIndex.set(slotIndex);
      this.isGraphSelectorOpen.set(true);
    }
  }

  /**
   * グリッドテンプレートを取得
   */
  getGridTemplate(): string {
    return this.layoutService.getGridTemplate();
  }

  /**
   * スロットのグリッドエリアを取得
   */
  getSlotGridArea(slotIndex: number): string {
    return this.layoutService.getSlotGridArea(slotIndex);
  }

  /**
   * グラフ選択モーダルを閉じる
   */
  closeGraphSelector(): void {
    this.isGraphSelectorOpen.set(false);
    this.selectedSlotIndex.set(null);
  }

  /**
   * グラフを選択
   */
  onGraphSelect(graphType: GraphType): void {
    const slotIndex = this.selectedSlotIndex();
    if (slotIndex !== null) {
      this.layoutService.addGraph(graphType, slotIndex);
      this.closeGraphSelector();
    }
  }

  /**
   * グラフを削除
   */
  onGraphRemove(graphId: string): void {
    this.layoutService.removeGraph(graphId);
  }
}
