import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionCartOutline, ionHeart, ionHeartOutline } from '@ng-icons/ionicons';
import { Product, ProductService } from '../../services/product.service';
import { WishlistService } from '../../services/wishlist.service';
import { ShoppingCartService } from '../../services/shopping-cart.service';

type ProductCategoryGroup = {
  category: string;
  products: Product[];
};

@Component({
  selector: 'app-product-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, CommonModule],
  providers: [provideIcons({ ionCartOutline, ionHeart, ionHeartOutline })],
  host: {
    class: 'block h-full',
  },
  template: `
    <div (click)="navigateToDetail()" class="card relative flex h-full flex-col overflow-hidden transition-[transform,box-shadow] duration-200 ease-in-out hover:-translate-y-0.5 hover:border-black/10 hover:shadow-(--shadow-hover) cursor-pointer">
      <button
        type="button"
        class="text-foreground absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-105"
        [attr.aria-label]="isFavorite() ? 'Remove from favorites' : 'Add to favorites'"
        [attr.aria-pressed]="isFavorite()"
        (click)="$event.stopPropagation(); toggleFavorite()"
      >
        <ng-icon [name]="isFavorite() ? 'ionHeart' : 'ionHeartOutline'" size="20"></ng-icon>
      </button>

      <div class="bg-secondary relative aspect-square overflow-hidden">
        <img
          [src]="image()"
          [alt]="'Picture of ' + title()"
          [title]="title()"
          loading="lazy"
          decoding="async"
          class="h-full w-full object-cover"
        />
        @if (tags().length) {
          <div class="absolute left-2 top-2 z-10 flex flex-col gap-1">
            @for (tag of tags(); track tag) {
              <span [class]="getBadgeClass(tag)">{{ formatTag(tag) }}</span>
            }
          </div>
        }
      </div>

      <div class="mb-4 flex flex-1 flex-col gap-2 p-4">
        <p class="text-primary text-sm tracking-wide capitalize">{{ brand() }} / {{ category() }}</p>
        <h3
          class="font-heading min-h-[3.4rem] overflow-hidden text-lg font-bold leading-[1.3] tracking-[-0.02em] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
          [title]="title()"
        >{{ title() }}</h3>
        @if (isOnSale()) {
          <div class="space-y-1">
            <p class="text-sm text-black/45 line-through">{{ formatPrice(price()) }}</p>
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-lg font-semibold text-red-600">{{ formatPrice(discountedPrice()) }}</p>
              <span class="text-sm font-semibold text-red-600">-{{ salePercentage() }}%</span>
            </div>
          </div>
        } @else {
          <p class="text-lg font-semibold">{{ formatPrice(price()) }}</p>
        }
        <div class="mt-auto flex flex-col gap-2">
          <button type="button" (click)="$event.stopPropagation(); addToCart()" class="btn btn-primary inline-flex items-center gap-2">
            <ng-icon name="ionCartOutline" size="18" aria-hidden="true"></ng-icon>
            Add to cart
          </button>
          @if (showDeleteAction()) {
            <button
              type="button"
              (click)="$event.stopPropagation(); removeFromWishlist()"
              class="btn btn-outline text-destructive"
              aria-label="Delete {{ title() }} from wishlist"
            >
              Delete
            </button>
          }
        </div>
      </div>     
    </div>
  `,
})
export class ProductCardComponent {
  private readonly router = inject(Router);
  private readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(ShoppingCartService);

  id = input(0);
  category = input('');
  title = input('');
  price = input(0);
  image = input('');
  brand = input('');
  tags = input<string[]>([]);
  discountPercentage = input<number | undefined>(undefined);
  showDeleteAction = input(false);

  readonly isFavorite = computed(() => {
    const productId = this.id();
    return productId > 0 && this.wishlistService.isInWishlist(productId);
  });
  readonly salePercentage = computed(() => {
    const rawValue = this.discountPercentage();
    if (rawValue === undefined || rawValue === null) {
      return 0;
    }

    const normalized = Math.round(rawValue);
    return normalized > 0 ? Math.min(normalized, 100) : 0;
  });
  readonly hasSaleTag = computed(() => this.tags().some((tag) => tag.toLowerCase() === 'sale'));
  readonly isOnSale = computed(() => this.hasSaleTag() && this.salePercentage() > 0);
  readonly discountedPrice = computed(() => {
    const originalPrice = this.price();
    const percentage = this.salePercentage();

    if (percentage <= 0) {
      return originalPrice;
    }

    return originalPrice * (1 - percentage / 100);
  });

  addToCart() {
    this.cartService.add({
      id: this.id(),
      title: this.title(),
      brand: this.brand(),
      price: this.price(),
      image: this.image(),
      category: this.category(),
      quantity: 1
    });
  }

  removeFromWishlist(): void {
    const productId = this.id();
    if (productId <= 0) {
      return;
    }

    void this.wishlistService.remove(productId);
  }

  navigateToDetail(): void {
    void this.router.navigate(['/products', this.id()]);
  }

  toggleFavorite(): void {
    const productId = this.id();
    if (productId <= 0) {
      return;
    }

    void this.wishlistService.toggle({
      id: productId,
      title: this.title(),
      brand: this.brand(),
      price: this.price(),
      image: this.image(),
      category: this.category(),
      tags: this.tags(),
      discount_percentage: this.discountPercentage(),
    });
  }

  getBadgeClass(tag: string): string {
    const baseClass = 'badge ';
    const lowerTag = tag.toLowerCase();

    if (lowerTag === 'new') {
      return baseClass + 'badge-new';
    } else if (lowerTag === 'popular') {
      return baseClass + 'badge-popular';
    } else if (lowerTag === 'sale') {
      return baseClass + 'badge-sale';
    }

    return baseClass;
  }

  formatTag(tag: string): string {
    return tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
  }

  formatPrice(value: number): string {
    return `$${value.toFixed(2)}`;
  }
}

@Component({
  selector: 'app-product-cards',
  standalone: true,
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
