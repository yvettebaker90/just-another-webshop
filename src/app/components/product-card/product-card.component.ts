import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionCartOutline, ionHeart, ionHeartOutline } from '@ng-icons/ionicons';
import { Product, ProductService } from '../../services/product.service';

type ProductCategoryGroup = {
  category: string;
  products: Product[];
};

@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  providers: [provideIcons({ ionCartOutline, ionHeart, ionHeartOutline })],
  host: {
    class: 'block h-full',
  },
  template: `
    <div (click)="navigateToDetail()" class="relative flex h-full flex-col overflow-hidden bg-[var(--card)] shadow-[var(--shadow-soft)] transition-[transform,box-shadow] duration-200 ease-in-out hover:-translate-y-0.5 hover:border-[1px] hover:border-black/10 hover:shadow-[var(--shadow-hover)] cursor-pointer">
      <button
        type="button"
        class="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[var(--foreground)] shadow-sm transition hover:scale-105"
        [attr.aria-label]="isFavorite() ? 'Remove from favorites' : 'Add to favorites'"
        [attr.aria-pressed]="isFavorite()"
        (click)="$event.stopPropagation(); toggleFavorite()"
      >
        <ng-icon [name]="isFavorite() ? 'ionHeart' : 'ionHeartOutline'" size="20"></ng-icon>
      </button>

      <div class="relative aspect-square overflow-hidden bg-[var(--secondary)]">
        <img [src]="image()" [alt]="'Picture of ' + title()" [title]="title()" class="h-full w-full object-cover" />
      </div>

      <div class="mb-4 flex flex-1 flex-col gap-2 p-4">
        <p class="text-sm tracking-wide text-[var(--primary)] capitalize">{{ category() }}</p>
        <h3
          class="min-h-[3.4rem] text-lg font-bold [font-family:var(--font-heading)] leading-[1.3] tracking-[-0.02em] overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
          [title]="title()"
        >{{ title() }}</h3>
        <p class="text-lg font-semibold">{{ '$' + price() }}</p>
        <button type="button" (click)="$event.stopPropagation()" class="btn btn-primary mt-auto inline-flex items-center gap-2">
          <ng-icon name="ionCartOutline" size="18" aria-hidden="true"></ng-icon>
          Add to cart
        </button>
      </div>     
    </div>
  `,
})
export class ProductCardComponent {
  private readonly router = inject(Router);

  id = input(0);
  category = input('');
  title = input('');
  price = input(0);
  image = input('');

  isFavorite = signal(false);

  navigateToDetail(): void {
    void this.router.navigate(['/products', this.id()]);
  }

  toggleFavorite(): void {
    this.isFavorite.update((value) => !value);
  }
}

@Component({
  selector: 'app-product-cards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCardComponent],
  templateUrl: './product-card.component.html',
})
export class ProductCardsComponent {
  private readonly productService = inject(ProductService);

  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  totalProducts = computed(() => this.products().length);
  groupedProducts = computed<ProductCategoryGroup[]>(() => {
    const groups = new Map<string, Product[]>();

    for (const product of this.products()) {
      const category = product.category?.trim() || 'Other';
      const existing = groups.get(category) ?? [];
      groups.set(category, [...existing, product]);
    }

    return Array.from(groups.entries()).map(([category, products]) => ({
      category,
      products,
    }));
  });

  constructor() {
    void this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const products = await this.productService.getProducts();
      this.products.set(products);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not load products.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }
}