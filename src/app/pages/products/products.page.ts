import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
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
export class Products implements OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly staticTags = ['new', 'popular', 'sale'];
  // Subscription to query params; unsubscribed in ngOnDestroy to prevent memory leaks
  private queryParamsSub: Subscription;

  // All products from Supabase — used for building filter options (categories, brands, price)
  readonly allProducts = signal<ProductWithTags[]>([]);
  // Displayed products — either all products or search results from Supabase
  readonly products = signal<ProductWithTags[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  // Current search query from the URL ?search= param
  readonly searchQuery = signal('');

  // Filter options derived from all products so they stay unchanged during search
  readonly categories = computed(() => {
    const categorySet = new Set(
      this.allProducts()
        .map((product) => product.category)
        .filter((category) => category.trim().length > 0)
    );
    return Array.from(categorySet);
  });

  // Brand options derived from all products (not affected by search)
  readonly brands = computed(() => {
    const brandSet = new Set(
      this.allProducts()
        .map((product) => (product.brand ?? '').trim())
        .filter((brand) => brand.length > 0)
    );
    return Array.from(brandSet);
  });

  readonly availableTags = computed(() => this.staticTags.map((tag) => this.toTitleCase(tag)));

  // Highest price derived from all products so the price slider range is always correct
  readonly highestPrice = computed(() => {
    const prices = this.allProducts().map((product) => product.price);
    return prices.length > 0 ? Math.ceil(Math.max(...prices)) : 0;
  });

  readonly selectedCategories = signal<string[]>([]);
  readonly selectedBrands = signal<string[]>([]);
  readonly maxPrice = signal(0);
  readonly selectedTags = signal<string[]>([]);
  readonly totalProducts = computed(() => this.filteredProducts().length);

  // Subscribe to URL query params to react when the searchbar navigates here
  constructor() {
    this.queryParamsSub = this.route.queryParams.subscribe((params) => {
      const search = params['search'] ?? '';
      this.searchQuery.set(search);
      void this.loadProducts(search.trim() || undefined);
    });
  }

  // Clean up query params subscription
  ngOnDestroy(): void {
    this.queryParamsSub.unsubscribe();
  }

  readonly filteredProducts = computed(() => {
    const categories = this.selectedCategories();
    const brands = this.selectedBrands();
    const max = this.maxPrice();
    const tags = this.selectedTags().map((tag) => tag.toLowerCase());

    return this.products().filter((product) => {
      const inCategory = categories.length === 0 || categories.includes(product.category);
      const inBrand = brands.length === 0 || brands.includes(product.brand ?? '');
      const inPriceRange = product.price <= max;
      const hasSelectedTags = tags.length === 0 || tags.every((tag) => product.tags.includes(tag));

      return inCategory && inBrand && inPriceRange && hasSelectedTags;
    });
  });

  async loadProducts(search?: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      // Always fetch all products so filter options (categories, brands, price) stay complete
      const allRaw = await this.productService.getProducts();
      const allNormalized: ProductWithTags[] = allRaw.map((product) => ({
        ...product,
        image: product.image || product.image_1 || '',
        tags: this.normalizeTags(product),
      }));
      this.allProducts.set(allNormalized);

      // If a search query exists, fetch matching products from Supabase otherwise display all products
      if (search && search.length > 0) {
        const searchRaw = await this.productService.searchProducts(search);
        const searchNormalized: ProductWithTags[] = searchRaw.map((product) => ({
          ...product,
          image: product.image || product.image_1 || '',
          tags: this.normalizeTags(product),
        }));
        this.products.set(searchNormalized);
      } else {
        this.products.set(allNormalized);
      }

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

  toggleBrand(brand: string): void {
    this.selectedBrands.update((brands) => {
      if (brands.includes(brand)) {
        return brands.filter((value) => value !== brand);
      }
      return [...brands, brand];
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
    this.selectedBrands.set([]);
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