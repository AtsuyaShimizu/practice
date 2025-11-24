import { Component, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { LayoutType, LayoutPattern } from '../../../model/domain';

@Component({
  selector: 'app-layout-modal',
  imports: [NgClass],
  templateUrl: './layout-modal.html',
  styleUrl: './layout-modal.scss',
})
export class LayoutModalComponent {
  onClose = output<void>();
  onSelect = output<LayoutType>();

  // レイアウトパターンの定義
  layouts: LayoutPattern[] = [
    {
      type: LayoutType.Single,
      label: '1×1',
      description: '1つのグラフを表示',
      slots: 1,
      gridTemplate: '1fr',
    },
    {
      type: LayoutType.TwoColumns,
      label: '1×2',
      description: '横に2つのグラフを表示',
      slots: 2,
      gridTemplate: '1fr / 1fr 1fr', // 1行2列
    },
    {
      type: LayoutType.TwoRows,
      label: '2×1',
      description: '縦に2つのグラフを表示',
      slots: 2,
      gridTemplate: '1fr 1fr / 1fr', // 2行1列
    },
    {
      type: LayoutType.Grid2x2,
      label: '2×2',
      description: '4つのグラフをグリッド表示',
      slots: 4,
      gridTemplate: '1fr 1fr / 1fr 1fr',
    },
    {
      type: LayoutType.TopOne,
      label: '上1下2',
      description: '上に1つ、下に2つのグラフを表示',
      slots: 3,
      gridTemplate: '1fr 1fr / 1fr 1fr',
    },
    {
      type: LayoutType.BottomOne,
      label: '上2下1',
      description: '上に2つ、下に1つのグラフを表示',
      slots: 3,
      gridTemplate: '1fr 1fr / 1fr 1fr',
    },
  ];

  ngOnInit(): void {
    // モーダルが開いたときにbodyのスクロールを無効化
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    // モーダルが閉じたときにbodyのスクロールを有効化
    document.body.style.overflow = '';
  }

  /**
   * モーダルを閉じる
   */
  handleClose(): void {
    this.onClose.emit();
  }

  /**
   * 背景クリックでモーダルを閉じる
   */
  handleBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.handleClose();
    }
  }

  /**
   * レイアウトを選択
   */
  selectLayout(layoutType: LayoutType): void {
    this.onSelect.emit(layoutType);
  }

  /**
   * レイアウトタイプに応じたプレビュークラスを取得
   */
  getPreviewClass(type: LayoutType): string {
    return `layout-preview-${type}`;
  }
}
