import { Component, input, output } from '@angular/core';
import { SearchFormComponent } from '../search-form/search-form';
import { SearchFieldConfig, SearchFormValue } from '../../../model/domain';

@Component({
  selector: 'app-board',
  imports: [SearchFormComponent],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class BoardComponent {
  searchFields = input<SearchFieldConfig[]>([]);
  searchTitle = input<string>('検索条件');

  onSearch = output<SearchFormValue>();
  onClear = output<void>();

  handleSearch(value: SearchFormValue): void {
    this.onSearch.emit(value);
  }

  handleClear(): void {
    this.onClear.emit();
  }
}
