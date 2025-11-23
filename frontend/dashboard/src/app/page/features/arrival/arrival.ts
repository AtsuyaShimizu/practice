import { Component } from '@angular/core';
import { BoardComponent } from '../../parts/board/board';
import { ArrivalPlanActualLineChartComponent } from '../../parts/graph/arrival-plan-actual-line-chart';
import { arrivalPlans, arrivalActuals } from '../../../model/mock';
import { SearchFieldConfig, SearchFieldType, SearchFormValue } from '../../../model/domain';

@Component({
  selector: 'app-arrival',
  imports: [BoardComponent, ArrivalPlanActualLineChartComponent],
  templateUrl: './arrival.html',
  styleUrl: './arrival.scss',
})
export class ArrivalComponent {
  arrivalPlans = arrivalPlans;
  arrivalActuals = arrivalActuals;

  // 検索フィールドの定義
  searchFields: SearchFieldConfig[] = [
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
  ];

  /**
   * 検索を実行
   */
  handleSearch(searchValue: SearchFormValue): void {
    console.log('検索条件:', searchValue);
    // TODO: 検索条件に基づいてデータをフィルタリング
    // この実装は後で行う
  }

  /**
   * 検索条件をクリア
   */
  handleClear(): void {
    console.log('検索条件をクリア');
    // 元のデータに戻す
    this.arrivalPlans = arrivalPlans;
    this.arrivalActuals = arrivalActuals;
  }
}
