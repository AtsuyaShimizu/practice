import { Component, computed, inject, signal, ContentChildren, QueryList, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from '../../../services/layout.service';
import { GraphSelectorComponent } from '../graph-selector/graph-selector';
import { GraphType } from '../../../model/domain';
import { SlotContentDirective } from './slot-content.directive';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-board',
  imports: [GraphSelectorComponent, NgTemplateOutlet],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class BoardComponent {
  readonly layoutService = inject(LayoutService);
  private readonly router = inject(Router);

  // 親コンポーネントから提供されるスロットコンテンツ
  @ContentChildren(SlotContentDirective) slotContents!: QueryList<SlotContentDirective>;

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

  /**
   * 指定されたスロットのテンプレートを取得
   */
  getTemplateForSlot(slotIndex: number): TemplateRef<any> | null {
    const content = this.slotContents?.find(c => c.slotIndex() === slotIndex);
    return content?.templateRef || null;
  }
}
