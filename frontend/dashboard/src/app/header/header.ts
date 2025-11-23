import { Component, signal, input, output } from '@angular/core';
import { AccountModal } from '../account-modal/account-modal';

@Component({
  selector: 'app-header',
  imports: [AccountModal],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  title: string = 'DashBoard';
  isMenuOpen = signal(false);
  isSidebarOpen = input.required<boolean>();
  toggleSidebar = output<void>();

  toggleMenu(): void {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onSettings(): void {
    console.log('Settings clicked');
    this.isMenuOpen.set(false);
    // TODO: Navigate to settings page
  }

  onLogout(): void {
    console.log('Logout clicked');
    this.isMenuOpen.set(false);
    // TODO: Implement logout logic
  }
}
