import { Component } from '@angular/core';
import { BoardComponent } from '../../parts/board/board';

@Component({
  selector: 'app-shipment',
  imports: [BoardComponent],
  templateUrl: './shipment.html',
  styleUrl: './shipment.scss',
})
export class ShipmentComponent {
  title = '出荷予実';
}
