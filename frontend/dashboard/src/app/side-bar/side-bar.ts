import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

export interface NavigationItem {
  label: string;
  path: string;
  icon?: string;
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
    { label: '入荷予実', path: '/arrival' },
    { label: '出荷予実', path: '/shipment' },
  ];

  constructor(private router: Router) {}

  onNavigate(item: NavigationItem): void {
    this.router.navigate([item.path]);
  }

  onToggle(): void {
    this.toggleSidebar.emit();
  }
}
