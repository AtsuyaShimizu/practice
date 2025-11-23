import { Component, OnInit, OnDestroy, signal } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class FooterComponent implements OnInit, OnDestroy {
  currentDateTime = signal<string>('');
  private intervalId?: number;

  ngOnInit(): void {
    this.updateDateTime();
    // 1秒ごとに時刻を更新
    this.intervalId = window.setInterval(() => {
      this.updateDateTime();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  /**
   * 現在の日時を更新
   */
  private updateDateTime(): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    this.currentDateTime.set(`${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`);
  }
}
