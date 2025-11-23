import { Component } from '@angular/core';
import { BoardComponent } from '../../parts/board/board';

@Component({
  selector: 'app-arrival',
  imports: [BoardComponent],
  templateUrl: './arrival.html',
  styleUrl: './arrival.scss',
})
export class ArrivalComponent {
  title = '入荷予実';
}
