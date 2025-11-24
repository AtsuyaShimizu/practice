import { AfterViewInit, Component, inject } from '@angular/core';
import { BoardComponent } from '../../parts/board/board';
import { SlotContentDirective } from '../../parts/board/slot-content.directive';
import { ArrivalPlanActualLineChartComponent } from '../../parts/graph/arrival-plan-actual-line-chart';
import { arrivalPlans, arrivalActuals } from '../../../model/mock';
import { LayoutService } from '../../../services/layout.service';
import { GraphType } from '../../../model/domain';

@Component({
  selector: 'app-arrival',
  imports: [BoardComponent, SlotContentDirective, ArrivalPlanActualLineChartComponent],
  templateUrl: './arrival.html',
  styleUrl: './arrival.scss',
})
export class ArrivalComponent implements AfterViewInit {
  readonly layoutService = inject(LayoutService);

  arrivalPlans = arrivalPlans;
  arrivalActuals = arrivalActuals;

  // 最大スロット数（全レイアウトの最大値）
  readonly maxSlots = 4;

  // グラフタイプのenum
  readonly GraphType = GraphType;

  ngAfterViewInit(): void {
    console.log("予定：", arrivalPlans);
  }

  /**
   * 指定されたスロットにグラフがあるかチェック
   */
  hasGraphAtSlot(slotIndex: number): boolean {
    return this.layoutService.getGraphAtSlot(slotIndex) !== undefined;
  }

  /**
   * グラフが閉じられたときの処理
   */
  handleGraphClose(graphId: string): void {
    this.layoutService.removeGraph(graphId);
  }
}
