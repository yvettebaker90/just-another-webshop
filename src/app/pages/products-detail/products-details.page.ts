import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionCartOutline, ionHeart, ionHeartOutline } from '@ng-icons/ionicons';
import { Product, ProductService } from '../../services/product.service';
import { ShoppingCartService, CartItem } from '../../services/shopping-cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  providers: [provideIcons({ ionCartOutline, ionHeart, ionHeartOutline })],
  templateUrl: './products-details.page.html',
})
export class ProductDetail {
  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly quantity = signal(1);
  readonly activeImage = signal('');
  readonly isFavorite = signal(false);
  readonly activeTab = signal<'description' | 'details'>('description');

  private readonly productService = inject(ProductService);
  private readonly cartService = inject(ShoppingCartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  async addToCart() {
    const p = this.product();
    if (!p) return;
    const item: CartItem = {
      id: p.id,
      title: p.title,
      brand: p.brand,
      price: p.price,
      image: p.image,
      category: p.category,
      quantity: this.quantity(),
    };
    await this.cartService.add(item);
  }

  constructor() {
    this.route.params.subscribe(params => {
      void this.loadProduct(Number(params['id']));
    });
  }

  private async loadProduct(id: number): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const product = await this.productService.getProductById(id);
      if (!product) {
        this.error.set('Product not found.');
      } else {
        this.product.set(product);
        this.activeImage.set(product.image);
      }
    } catch {
      this.error.set('Could not load product.');
    } finally {
      this.loading.set(false);
    }
  }

  get images(): string[] {
    const p = this.product();
    if (!p) return [];
    return [p.image, ...(p.image_1 ? [p.image_1] : [])].filter(Boolean);
  }

  increment(): void { this.quantity.update(q => q + 1); }
  decrement(): void { this.quantity.update(q => Math.max(1, q - 1)); }
  setActiveImage(img: string): void { this.activeImage.set(img); }
  toggleFavorite(): void { this.isFavorite.update(v => !v); }
  setActiveTab(tab: 'description' | 'details'): void { this.activeTab.set(tab); }
  goBack(): void { void this.router.navigate(['/products']); }
}