import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-search-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-filter.component.html',
})
export class SearchFilterComponent {
  categories = input<string[]>([]);
  availableTags = input<string[]>([]);
  selectedCategories = input<string[]>([]);
  selectedTags = input<string[]>([]);
  maxPrice = input(100);
  highestPrice = input(0);

  categoryToggled = output<string>();
  maxPriceChanged = output<string>();
  tagToggled = output<string>();

  isCategorySelected(category: string): boolean {
    return this.selectedCategories().includes(category);
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags().includes(tag);
  }

  onCategoryClick(category: string): void {
    this.categoryToggled.emit(category);
  }

  onMaxPriceChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.maxPriceChanged.emit(target?.value ?? String(this.highestPrice()));
  }

  onTagToggle(tag: string): void {
    this.tagToggled.emit(tag);
  }
}
