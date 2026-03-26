import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SearchFilterComponent } from '../../components/search-filter/search-filter.component';
import { Product, ProductService } from '../../services/product.service';

type ProductWithTags = Product & {
  tags: string[];
};

@Component({
  selector: 'app-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCardComponent, SearchFilterComponent],
  templateUrl: './products.page.html'
})
export class Products {
  private readonly productService = inject(ProductService);
  private readonly staticTags = ['new', 'popular', 'sale'];

  readonly products = signal<ProductWithTags[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly categories = computed(() => {
    const categorySet = new Set(
      this.products()
        .map((product) => product.category)
        .filter((category) => category.trim().length > 0)
    );

    return Array.from(categorySet);
  });

  readonly availableTags = computed(() => this.staticTags.map((tag) => this.toTitleCase(tag)));

  readonly highestPrice = computed(() => {
    const prices = this.products().map((product) => product.price);
    return prices.length > 0 ? Math.ceil(Math.max(...prices)) : 0;
  });

  readonly selectedCategories = signal<string[]>([]);
  readonly maxPrice = signal(0);
  readonly selectedTags = signal<string[]>([]);
  readonly totalProducts = computed(() => this.filteredProducts().length);

  constructor() {
    void this.loadProducts();
  }

  readonly filteredProducts = computed(() => {
    const categories = this.selectedCategories();
    const max = this.maxPrice();
    const tags = this.selectedTags().map((tag) => tag.toLowerCase());

    return this.products().filter((product) => {
      const inCategory = categories.length === 0 || categories.includes(product.category);
      const inPriceRange = product.price <= max;
      const hasSelectedTags = tags.length === 0 || tags.every((tag) => product.tags.includes(tag));

      return inCategory && inPriceRange && hasSelectedTags;
    });
  });

  async loadProducts(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const products = await this.productService.getProducts();

      const normalizedProducts: ProductWithTags[] = products.map((product) => ({
        ...product,
        image: product.image || product.image_1 || '',
        tags: this.normalizeTags(product),
      }));

      this.products.set(normalizedProducts);

      this.maxPrice.set(this.highestPrice());
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not load products.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  toggleCategory(category: string): void {
    this.selectedCategories.update((categories) => {
      if (categories.includes(category)) {
        return categories.filter((value) => value !== category);
      }
      return [...categories, category];
    });
  }

  updateMaxPrice(value: string): void {
    const parsedValue = Number(value);
    const clampedValue = Math.max(0, Math.min(parsedValue, this.highestPrice()));
    this.maxPrice.set(clampedValue);
  }

  toggleTag(tag: string): void {
    this.selectedTags.update((tags) => {
      if (tags.includes(tag)) {
        return tags.filter((value) => value !== tag);
      }
      return [...tags, tag];
    });
  }

  clearFilters(): void {
    this.selectedCategories.set([]);
    this.maxPrice.set(this.highestPrice());
    this.selectedTags.set([]);
  }

  private normalizeTags(product: Product): string[] {
    const tagsRaw = (product as Product & { tags?: unknown }).tags;
    if (Array.isArray(tagsRaw)) {
      return tagsRaw
        .map((tag) => String(tag).trim().toLowerCase())
        .filter((tag) => this.staticTags.includes(tag));
    }

    if (typeof tagsRaw === 'string') {
      return tagsRaw
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => this.staticTags.includes(tag));
    }

    return [];
  }

  private toTitleCase(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}