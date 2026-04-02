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

  // Filter options derived from displayed products so they reflect search results
  readonly categories = computed(() => {
    const categorySet = new Set(
      this.products()
        .map((product) => product.category)
        .filter((category) => category.trim().length > 0)
    );
    return Array.from(categorySet);
  });

  // Brand options derived from displayed products (reflects search results)
  readonly brands = computed(() => {
    const brandSet = new Set(
      this.products()
        .map((product) => (product.brand ?? '').trim())
        .filter((brand) => brand.length > 0)
    );
    return Array.from(brandSet);
  });

  readonly availableTags = computed(() => {
    const tagSet = new Set(
      this.products()
        .flatMap((product) => product.tags)
        .filter((tag) => this.staticTags.includes(tag))
    );
    return Array.from(tagSet).map((tag) => this.toTitleCase(tag));
  });

  // Highest price derived from displayed products so the price slider reflects search results
  readonly highestPrice = computed(() => {
    const prices = this.products().map((product) => product.price);
    return prices.length > 0 ? Math.ceil(Math.max(...prices)) : 0;
  });

  readonly selectedCategories = signal<string[]>([]);
  readonly selectedBrands = signal<string[]>([]);
  readonly maxPrice = signal(0);
  readonly selectedTags = signal<string[]>([]);
  readonly totalProducts = computed(() => this.filteredProducts().length);

  readonly PAGE_SIZE = 12;
  readonly currentPage = signal(1);
  readonly totalPages = computed(() => Math.ceil(this.filteredProducts().length / this.PAGE_SIZE));
  readonly paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.filteredProducts().slice(start, start + this.PAGE_SIZE);
  });
  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1) as (number | null)[];
    const pages: (number | null)[] = [1];
    if (current > 3) pages.push(null);
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push(null);
    pages.push(total);
    return pages;
  });

  goToPage(page: number): void { this.currentPage.set(page); }

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

      // Reset filters that are no longer relevant for the current product set
      this.selectedCategories.update((sel) => sel.filter((c) => this.categories().includes(c)));
      this.selectedBrands.update((sel) => sel.filter((b) => this.brands().includes(b)));
      this.selectedTags.update((sel) => sel.filter((t) => this.availableTags().includes(t)));
      this.maxPrice.set(this.highestPrice());
      this.currentPage.set(1);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not load products.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  toggleCategory(category: string): void {
    this.currentPage.set(1);
    this.selectedCategories.update((categories) => {
      if (categories.includes(category)) {
        return categories.filter((value) => value !== category);
      }
      return [...categories, category];
    });
  }

  toggleBrand(brand: string): void {
    this.currentPage.set(1);
    this.selectedBrands.update((brands) => {
      if (brands.includes(brand)) {
        return brands.filter((value) => value !== brand);
      }
      return [...brands, brand];
    });
  }

  updateMaxPrice(value: string): void {
    this.currentPage.set(1);
    const parsedValue = Number(value);
    const clampedValue = Math.max(0, Math.min(parsedValue, this.highestPrice()));
    this.maxPrice.set(clampedValue);
  }

  toggleTag(tag: string): void {
    this.currentPage.set(1);
    this.selectedTags.update((tags) => {
      if (tags.includes(tag)) {
        return tags.filter((value) => value !== tag);
      }
      return [...tags, tag];
    });
  }

  clearFilters(): void {
    this.currentPage.set(1);
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