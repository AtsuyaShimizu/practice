import { Component, input, output } from '@angular/core';

export interface LegendItem {
  name: string;
  color: string;
  shape?: 'line' | 'circle' | 'square'; // デフォルトはline
}

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  title = input<string>();
  showLegend = input<boolean>(false);
  legendItems = input<LegendItem[]>([]);
  showCloseButton = input<boolean>(false);

  onClose = output<void>();

  /**
   * 閉じるボタンがクリックされた
   */
  handleClose(event: Event): void {
    event.stopPropagation(); // 親要素へのイベント伝播を防ぐ
    this.onClose.emit();
  }
}
