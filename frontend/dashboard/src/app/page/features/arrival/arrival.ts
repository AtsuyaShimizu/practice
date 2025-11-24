import { AfterViewInit, Component, inject, signal } from '@angular/core';
import { BoardComponent } from '../../parts/board/board';
import { ArrivalPlanActualLineChartComponent } from '../../parts/graph/arrival-plan-actual-line-chart';
import { arrivalPlans, arrivalActuals } from '../../../model/mock';
import { LayoutService } from '../../../services/layout.service';

@Component({
  selector: 'app-arrival',
  imports: [BoardComponent, ArrivalPlanActualLineChartComponent],
  templateUrl: './arrival.html',
  styleUrl: './arrival.scss',
})
export class ArrivalComponent implements AfterViewInit {
  private readonly layoutService = inject(LayoutService);

  arrivalPlans = arrivalPlans;
  arrivalActuals = arrivalActuals;

  // グラフの表示状態
  showGraph = signal(true);

  ngAfterViewInit(): void {
    console.log("予定：", arrivalPlans);
  }

  /**
   * グラフが閉じられたときの処理
   */
  handleGraphClose(): void {
    // グラフを非表示にする
    this.showGraph.set(false);

    // LayoutServiceからも削除
    const graph = this.layoutService.getGraphAtSlot(0);
    if (graph) {
      this.layoutService.removeGraph(graph.id);
    }
  }
}
