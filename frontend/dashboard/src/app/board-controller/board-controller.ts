import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SearchModalComponent } from '../page/parts/search-modal/search-modal';
import { LayoutModalComponent } from '../page/parts/layout-modal/layout-modal';
import { LayoutService } from '../services/layout.service';
import { SearchFieldConfig, SearchFieldType, LayoutType } from '../model/domain';

export interface BoardPage {
  label: string;
  path: string;
  searchFields: SearchFieldConfig[];
}

@Component({
  selector: 'app-board-controller',
  imports: [SearchModalComponent, LayoutModalComponent],
  templateUrl: './board-controller.html',
  styleUrl: './board-controller.scss',
})
export class BoardController {
  // ページ定義
  pages: BoardPage[] = [
    {
      label: '入荷予実',
      path: '/arrival',
      searchFields: [
        {
          key: 'arrivalId',
          label: '入荷ID',
          type: SearchFieldType.Text,
          placeholder: 'ARR-001',
        },
        {
          key: 'itemId',
          label: '品目ID',
          type: SearchFieldType.Text,
          placeholder: 'ITEM-001',
        },
        {
          key: 'skuId',
          label: 'SKU ID',
          type: SearchFieldType.Text,
          placeholder: 'SKU-001',
        },
        {
          key: 'arrivalDate',
          label: '入荷日',
          type: SearchFieldType.DateRange,
        },
        {
          key: 'quantity',
          label: '数量',
          type: SearchFieldType.Number,
          placeholder: '50',
        },
      ],
    },
    {
      label: '出荷予実',
      path: '/shipment',
      searchFields: [
        {
          key: 'shipmentId',
          label: '出荷ID',
          type: SearchFieldType.Text,
          placeholder: 'SHP-001',
        },
        {
          key: 'itemId',
          label: '品目ID',
          type: SearchFieldType.Text,
          placeholder: 'ITEM-001',
        },
        {
          key: 'shipmentDate',
          label: '出荷日',
          type: SearchFieldType.DateRange,
        },
      ],
    },
  ];

  // 現在のページインデックス
  currentPageIndex = signal(0);

  // 検索モーダルの表示状態
  isSearchModalOpen = signal(false);

  // レイアウト選択モーダルの表示状態
  isLayoutModalOpen = signal(false);

  private readonly layoutService = inject(LayoutService);

  constructor(private router: Router) {
    // 現在のルートに基づいてページインデックスを設定
    this.updateCurrentPageIndex();
  }

  /**
   * 現在のルートに基づいてページインデックスを更新
   */
  private updateCurrentPageIndex(): void {
    const currentPath = this.router.url;
    const index = this.pages.findIndex(page => currentPath.includes(page.path));
    if (index !== -1) {
      this.currentPageIndex.set(index);
    }
  }

  /**
   * 現在のページを取得
   */
  get currentPage(): BoardPage {
    return this.pages[this.currentPageIndex()];
  }

  /**
   * 前のページへ移動
   */
  goToPrevPage(): void {
    const currentIndex = this.currentPageIndex();
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      this.currentPageIndex.set(newIndex);
      const newPath = this.pages[newIndex].path;
      this.router.navigate([newPath]);
      // ページに応じて現在の画面を設定
      this.updateLayoutServicePage(newPath);
    }
  }

  /**
   * 次のページへ移動
   */
  goToNextPage(): void {
    const currentIndex = this.currentPageIndex();
    if (currentIndex < this.pages.length - 1) {
      const newIndex = currentIndex + 1;
      this.currentPageIndex.set(newIndex);
      const newPath = this.pages[newIndex].path;
      this.router.navigate([newPath]);
      // ページに応じて現在の画面を設定
      this.updateLayoutServicePage(newPath);
    }
  }

  /**
   * パスに応じてLayoutServiceの現在の画面を更新
   */
  private updateLayoutServicePage(path: string): void {
    if (path.includes('/arrival')) {
      this.layoutService.setCurrentPage('arrival');
    } else if (path.includes('/shipment')) {
      this.layoutService.setCurrentPage('shipment');
    }
  }

  /**
   * 前のページが存在するか
   */
  hasPrevPage(): boolean {
    return this.currentPageIndex() > 0;
  }

  /**
   * 次のページが存在するか
   */
  hasNextPage(): boolean {
    return this.currentPageIndex() < this.pages.length - 1;
  }

  /**
   * 検索モーダルを開く
   */
  openSearchModal(): void {
    this.isSearchModalOpen.set(true);
  }

  /**
   * 検索モーダルを閉じる
   */
  closeSearchModal(): void {
    this.isSearchModalOpen.set(false);
  }

  /**
   * 検索実行
   */
  handleSearch(value: any): void {
    console.log('Search value:', value);
    // TODO: 検索処理を実装
    this.closeSearchModal();
  }

  /**
   * 検索クリア
   */
  handleClear(): void {
    console.log('Clear search');
    // TODO: クリア処理を実装
  }

  /**
   * レイアウト選択モーダルを開く
   */
  openLayoutModal(): void {
    this.isLayoutModalOpen.set(true);
  }

  /**
   * レイアウト選択モーダルを閉じる
   */
  closeLayoutModal(): void {
    this.isLayoutModalOpen.set(false);
  }

  /**
   * レイアウト選択
   */
  handleLayoutSelect(layoutType: LayoutType): void {
    this.layoutService.setLayout(layoutType);
    this.closeLayoutModal();
  }
}
