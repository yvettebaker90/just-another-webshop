import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { ProductService, Product } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-supabase-test',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './supabase-test.component.html',
})
export class SupabaseTestComponent {
  private productService = inject(ProductService);
  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);


  // Hjälpmetod för fallback-bild om bild saknas
  getImage(img: string | null | undefined): string {
    return img && img.length > 0 ? img : 'https://via.placeholder.com/300x300?text=No+Image';
  }

  constructor() {
    this.load();
  }

  async load() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.productService.getProducts();
      this.products.set(data);
    } catch (e: any) {
      this.error.set(e.message || 'Något gick fel');
    } finally {
      this.loading.set(false);
    }
  }
}