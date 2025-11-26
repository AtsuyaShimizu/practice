import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

export interface NavigationItem {
  label: string;
  path: string;
  iconType?: 'arrival' | 'shipment';
}

@Component({
  selector: 'app-side-bar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss',
})
export class SideBar {
  isOpen = input.required<boolean>();
  toggleSidebar = output<void>();

  navigationItems: NavigationItem[] = [
    {
      label: '入荷予実',
      path: '/arrival',
      iconType: 'arrival'
    },
    {
      label: '出荷予実',
      path: '/shipment',
      iconType: 'shipment'
    },
  ];

  constructor(private router: Router) {}

  onNavigate(item: NavigationItem): void {
    this.router.navigate([item.path]);
  }

  onToggle(): void {
    this.toggleSidebar.emit();
  }
}
