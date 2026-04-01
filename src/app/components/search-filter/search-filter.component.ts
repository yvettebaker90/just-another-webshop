import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-search-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-filter.component.html',
})
export class SearchFilterComponent {
  categories = input<string[]>([]);
  selectedCategories = input<string[]>([]);
  categoryToggled = output<string>();
  brands = input<string[]>([]);
  selectedBrands = input<string[]>([]);
  brandToggled = output<string>();
  availableTags = input<string[]>([]);
  selectedTags = input<string[]>([]);
  tagToggled = output<string>();
  maxPrice = input(100);
  highestPrice = input(0);
  maxPriceChanged = output<string>();
  
  isCategorySelected(category: string): boolean {
    return this.selectedCategories().includes(category);
  }

  isBrandSelected(brand: string): boolean {
    return this.selectedBrands().includes(brand);
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags().includes(tag);
  }

  onCategoryClick(category: string): void {
    this.categoryToggled.emit(category);
  }

  onBrandClick(brand: string): void {
    this.brandToggled.emit(brand);
  }

  formatCategoryLabel(category: string): string {
    return category
      .replace(/-/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  onMaxPriceChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.maxPriceChanged.emit(target?.value ?? String(this.highestPrice()));
  }

  onTagToggle(tag: string): void {
    this.tagToggled.emit(tag);
  }
}
