import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'arrival',
    pathMatch: 'full'
  },
  {
    path: 'arrival',
    loadComponent: () => import('./page/features/arrival/arrival').then(m => m.ArrivalComponent)
  },
  {
    path: 'shipment',
    loadComponent: () => import('./page/features/shipment/shipment').then(m => m.ShipmentComponent)
  }
];
