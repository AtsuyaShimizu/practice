import { AfterViewInit, Component, inject } from '@angular/core';
import { BoardComponent } from '../../parts/board/board';
import { SlotContentDirective } from '../../parts/board/slot-content.directive';
import { ShipmentPlanActualLineChartComponent } from '../../parts/graph/shipment-plan-actual-line-chart';
import { ShipmentPlanActualBarChartComponent } from '../../parts/graph/shipment-plan-actual-bar-chart';
import { ShipmentProgressPieChartComponent } from '../../parts/graph/shipment-progress-pie-chart';
import { shipmentPlans, shipmentActuals } from '../../../model/mock';
import { LayoutService } from '../../../services/layout.service';
import { GraphType } from '../../../model/domain';

@Component({
  selector: 'app-shipment',
  imports: [BoardComponent, SlotContentDirective, ShipmentPlanActualLineChartComponent, ShipmentPlanActualBarChartComponent, ShipmentProgressPieChartComponent],
  templateUrl: './shipment.html',
  styleUrl: './shipment.scss',
})
export class ShipmentComponent implements AfterViewInit {
  readonly layoutService = inject(LayoutService);

  shipmentPlans = shipmentPlans;
  shipmentActuals = shipmentActuals;

  // 最大スロット数（全レイアウトの最大値）
  readonly maxSlots = 4;

  // グラフタイプのenum
  readonly GraphType = GraphType;

  ngAfterViewInit(): void {
    console.log("出荷予定：", shipmentPlans);
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
