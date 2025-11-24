import { Component, input, output } from '@angular/core';
import { GraphType, GraphDefinition } from '../../../model/domain';

@Component({
  selector: 'app-graph-selector',
  imports: [],
  templateUrl: './graph-selector.html',
  styleUrl: './graph-selector.scss',
})
export class GraphSelectorComponent {
  category = input.required<'arrival' | 'shipment'>();

  onClose = output<void>();
  onSelect = output<GraphType>();

  // 利用可能なグラフの定義
  readonly availableGraphs: GraphDefinition[] = [
    {
      type: GraphType.ArrivalPlanActualLine,
      label: '入荷予実推移（折れ線）',
      description: '時間単位の入荷予定と実績を折れ線グラフで表示',
      category: 'arrival',
    },
    {
      type: GraphType.ArrivalPie,
      label: '入荷状況（円グラフ）',
      description: '入荷状況を円グラフで表示',
      category: 'arrival',
    },
    {
      type: GraphType.ArrivalBar,
      label: '入荷実績（棒グラフ）',
      description: '入荷実績を棒グラフで表示',
      category: 'arrival',
    },
    {
      type: GraphType.ShipmentPlanActualLine,
      label: '出荷予実推移（折れ線）',
      description: '時間単位の出荷予定と実績を折れ線グラフで表示',
      category: 'shipment',
    },
    {
      type: GraphType.ShipmentPie,
      label: '出荷状況（円グラフ）',
      description: '出荷状況を円グラフで表示',
      category: 'shipment',
    },
    {
      type: GraphType.ShipmentBar,
      label: '出荷実績（棒グラフ）',
      description: '出荷実績を棒グラフで表示',
      category: 'shipment',
    },
  ];

  // カテゴリーに応じたグラフをフィルタリング
  get filteredGraphs(): GraphDefinition[] {
    return this.availableGraphs.filter(g => g.category === this.category());
  }

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
   * グラフを選択
   */
  selectGraph(graphType: GraphType): void {
    this.onSelect.emit(graphType);
  }

  /**
   * グラフタイプに応じたアイコンSVGを取得
   */
  getGraphIcon(type: GraphType): string {
    if (type.includes('line')) {
      return 'line';
    } else if (type.includes('pie')) {
      return 'pie';
    } else if (type.includes('bar')) {
      return 'bar';
    }
    return 'line';
  }
}
