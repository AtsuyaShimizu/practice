/**
 * 検索フィールドのタイプ
 */
export enum SearchFieldType {
  Text = 'text',
  Date = 'date',
  DateRange = 'dateRange',
  Select = 'select',
  Number = 'number',
}

/**
 * セレクトボックスのオプション
 */
export interface SelectOption {
  label: string;
  value: string | number;
}

/**
 * 検索フィールドの定義
 */
export interface SearchFieldConfig {
  key: string;
  label: string;
  type: SearchFieldType;
  placeholder?: string;
  options?: SelectOption[];
  defaultValue?: any;
}

/**
 * 検索フォームの値
 */
export type SearchFormValue = Record<string, any>;
