import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface TabItem {
  label: string;
  path: string;
}

@Component({
  selector: 'app-tab-navigation',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './tab-navigation.html',
  styleUrl: './tab-navigation.scss',
})
export class TabNavigation {
  tabs: TabItem[] = [
    { label: '入荷予実', path: '/arrival' },
    { label: '出荷予実', path: '/shipment' },
  ];
}
