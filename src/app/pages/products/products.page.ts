import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionClose } from '@ng-icons/ionicons';
import { Subscription } from 'rxjs';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SearchFilterComponent } from '../../components/search-filter/search-filter.component';
import { Product, ProductService } from '../../services/product.service';

type ProductWithTags = Product & {
  tags: string[];
};

@Component({
  selector: 'app-products',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCardComponent, SearchFilterComponent, NgIcon],
  providers: [provideIcons({ ionClose })],
  templateUrl: './products.page.html'
})
// Products page component: displays all products with filtering, search, and pagination
export class Products implements OnDestroy {
  // Inject ProductService for data and ActivatedRoute for query params
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);

  // Subscription for query param changes
  private queryParamsSub: Subscription;

  // All products (unfiltered)
  readonly allProducts = signal<ProductWithTags[]>([]);
  // Products to display (filtered by search, filters, etc)
  readonly products = signal<ProductWithTags[]>([]);
  // Loading and error state
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  // Current search query from URL
  readonly searchQuery = signal('');
  readonly isFilterModalOpen = signal(false);

  // Unique categories from products
  readonly categories = computed(() => {
    const categorySet = new Set(
      this.products()
        .map((product) => product.category)
        .filter((category) => category.trim().length > 0)
    );
    return Array.from(categorySet);
  });

  // Unique brands from products
  readonly brands = computed(() => {
    const brandSet = new Set(
      this.products()
        .map((product) => (product.brand ?? '').trim())
        .filter((brand) => brand.length > 0)
    );
    return Array.from(brandSet);
  });

  // Available tags (sorted as: New, Popular, Sale)
  readonly availableTags = computed(() => {
    const tagSet = new Set(
      this.products()
        .flatMap((product) => product.tags)
    );
    return ['new', 'popular', 'sale']
      .filter(tag => tagSet.has(tag))
      .map(tag => this.toTitleCase(tag));
  });

  // Highest price among all products (for slider)
  readonly highestPrice = computed(() => {
    const prices = this.products().map((product) => product.price);
    return prices.length > 0 ? Math.ceil(Math.max(...prices)) : 0;
  });

  // State for selected filters
  readonly selectedCategories = signal<string[]>([]);
  readonly selectedBrands = signal<string[]>([]);
  readonly maxPrice = signal(0);
  readonly selectedTags = signal<string[]>([]);
  // Number of products after filtering
  readonly totalProducts = computed(() => this.filteredProducts().length);
  readonly activeFilterCount = computed(() =>
    this.selectedCategories().length +
    this.selectedBrands().length +
    this.selectedTags().length +
    (this.maxPrice() < this.highestPrice() ? 1 : 0)
  );

  // Pagination state
  readonly PAGE_SIZE = 12;
  readonly currentPage = signal(1);
  readonly totalPages = computed(() => Math.ceil(this.filteredProducts().length / this.PAGE_SIZE));
  // Products for current page
  readonly paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.filteredProducts().slice(start, start + this.PAGE_SIZE);
  });
  // Page numbers for pagination controls
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

  // Go to a specific page
  goToPage(page: number): void { this.currentPage.set(page); }

  openFilterModal(): void {
    this.isFilterModalOpen.set(true);
  }

  closeFilterModal(): void {
    this.isFilterModalOpen.set(false);
  }

  // Subscribe to query param changes and load products on init
  constructor() {
    this.queryParamsSub = this.route.queryParams.subscribe((params) => {
      const search = params['search'] ?? '';
      this.searchQuery.set(search);
      void this.loadProducts(search.trim() || undefined);
    });
  }

  // Unsubscribe from query param changes on destroy
  ngOnDestroy(): void {
    this.queryParamsSub.unsubscribe();
  }

  // Returns products filtered by all selected filters and search
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

  /* Loads all products (optionally filtered by search query) and updates all filter and pagination state */
  async loadProducts(search?: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      // ProductService already returns tags as array
      const allRaw = await this.productService.getProducts();
      this.allProducts.set(allRaw as ProductWithTags[]);

      if (search && search.length > 0) {
        const searchRaw = await this.productService.searchProducts(search);
        this.products.set(searchRaw as ProductWithTags[]);
      } else {
        this.products.set(allRaw as ProductWithTags[]);
      }

      // Remove any selected filters that are no longer valid
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

  // Toggle a category filter
  toggleCategory(category: string): void {
    this.currentPage.set(1);
    this.selectedCategories.update((categories) => {
      if (categories.includes(category)) {
        return categories.filter((value) => value !== category);
      }
      return [...categories, category];
    });
  }

  // Toggle a brand filter
  toggleBrand(brand: string): void {
    this.currentPage.set(1);
    this.selectedBrands.update((brands) => {
      if (brands.includes(brand)) {
        return brands.filter((value) => value !== brand);
      }
      return [...brands, brand];
    });
  }

  // Update the max price filter
  updateMaxPrice(value: string): void {
    this.currentPage.set(1);
    const parsedValue = Number(value);
    const clampedValue = Math.max(0, Math.min(parsedValue, this.highestPrice()));
    this.maxPrice.set(clampedValue);
  }

  // Toggle a tag filter
  toggleTag(tag: string): void {
    this.currentPage.set(1);
    this.selectedTags.update((tags) => {
      if (tags.includes(tag)) {
        return tags.filter((value) => value !== tag);
      }
      return [...tags, tag];
    });
  }

  // Clear all filters
  clearFilters(): void {
    this.currentPage.set(1);
    this.selectedCategories.set([]);
    this.selectedBrands.set([]);
    this.maxPrice.set(this.highestPrice());
    this.selectedTags.set([]);
  }

  // Utility: convert a string to Title Case
  private toTitleCase(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
