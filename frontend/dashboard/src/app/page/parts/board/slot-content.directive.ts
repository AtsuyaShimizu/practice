import { Directive, input, TemplateRef } from '@angular/core';

/**
 * スロットにコンテンツを投影するためのディレクティブ
 * 親コンポーネントがこのディレクティブを使用して、各スロットの内容を定義する
 */
@Directive({
  selector: '[appSlotContent]',
  standalone: true,
})
export class SlotContentDirective {
  // スロットのインデックス
  slotIndex = input.required<number>({ alias: 'appSlotContent' });

  constructor(public templateRef: TemplateRef<any>) {}
}
