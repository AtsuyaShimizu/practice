import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchFieldConfig, SearchFieldType, SearchFormValue } from '../../../model/domain';

@Component({
  selector: 'app-search-modal',
  imports: [FormsModule],
  templateUrl: './search-modal.html',
  styleUrl: './search-modal.scss',
})
export class SearchModalComponent {
  fields = input<SearchFieldConfig[]>([]);
  title = input<string>('検索条件');

  onClose = output<void>();
  onSearch = output<SearchFormValue>();
  onClear = output<void>();

  formValue = signal<SearchFormValue>({});

  // SearchFieldTypeをテンプレートで使用できるようにする
  SearchFieldType = SearchFieldType;

  ngOnInit(): void {
    this.initializeFormValue();
    // モーダルが開いたときにbodyのスクロールを無効化
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    // モーダルが閉じたときにbodyのスクロールを有効化
    document.body.style.overflow = '';
  }

  ngOnChanges(): void {
    this.initializeFormValue();
  }

  /**
   * フォームの値を初期化
   */
  private initializeFormValue(): void {
    const initialValue: SearchFormValue = {};
    this.fields().forEach(field => {
      if (field.type === SearchFieldType.DateRange) {
        initialValue[`${field.key}_from`] = field.defaultValue?.from || '';
        initialValue[`${field.key}_to`] = field.defaultValue?.to || '';
      } else {
        initialValue[field.key] = field.defaultValue || '';
      }
    });
    this.formValue.set(initialValue);
  }

  /**
   * モーダルを閉じる
   */
  handleClose(): void {
    this.onClose.emit();
  }

  /**
   * 背景クリックでモーダルを閉じる
   */
  handleBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.handleClose();
    }
  }

  /**
   * 検索を実行
   */
  handleSearch(): void {
    this.onSearch.emit(this.formValue());
  }

  /**
   * フォームをクリア
   */
  handleClear(): void {
    this.initializeFormValue();
    this.onClear.emit();
  }

  /**
   * フォームの値を更新
   */
  updateValue(key: string, value: any): void {
    this.formValue.update(current => ({
      ...current,
      [key]: value,
    }));
  }

  /**
   * 日付範囲フィールドのキーを取得
   */
  getDateRangeKeys(fieldKey: string): { from: string; to: string } {
    return {
      from: `${fieldKey}_from`,
      to: `${fieldKey}_to`,
    };
  }
}
