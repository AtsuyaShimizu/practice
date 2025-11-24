import { AfterViewInit, Component } from '@angular/core';
import { BoardComponent } from '../../parts/board/board';
import { ArrivalPlanActualLineChartComponent } from '../../parts/graph/arrival-plan-actual-line-chart';
import { arrivalPlans, arrivalActuals } from '../../../model/mock';

@Component({
  selector: 'app-arrival',
  imports: [BoardComponent, ArrivalPlanActualLineChartComponent],
  templateUrl: './arrival.html',
  styleUrl: './arrival.scss',
})
export class ArrivalComponent implements AfterViewInit {
  arrivalPlans = arrivalPlans;
  arrivalActuals = arrivalActuals;

  ngAfterViewInit(): void {
    console.log("予定：", arrivalPlans);
  }
}
