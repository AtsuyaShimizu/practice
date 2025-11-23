import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account-modal',
  imports: [CommonModule],
  templateUrl: './account-modal.html',
  styleUrl: './account-modal.scss',
})
export class AccountModal {
  isOpen = input.required<boolean>();
  settings = output<void>();
  logout = output<void>();

  onSettings(): void {
    this.settings.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }
}
