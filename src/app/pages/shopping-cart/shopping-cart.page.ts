import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ShoppingCartService } from '../../services/shopping-cart.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionTrashOutline } from '@ng-icons/ionicons';

import type { CartItem } from '../../services/shopping-cart.service';

@Component({
  selector: 'app-shopping-cart-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgIcon],
  providers: [provideIcons({ ionTrashOutline })],
  templateUrl: './shopping-cart.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShoppingCart {
  private readonly cartService = inject(ShoppingCartService);
  cartItems = this.cartService.cartItems;

  subtotal = computed(() => this.cartItems().reduce((sum, item) => sum + item.price * item.quantity, 0));
  shipping = computed(() => this.subtotal() > 50 ? 0 : 5.99);
  tax = computed(() => this.subtotal() * 0.08);
  total = computed(() => this.subtotal() + this.shipping() + this.tax());

  constructor(private router: Router) { }

  async onDecrementQuantity(item: CartItem) {
    if (item.quantity > 1) {
      await this.cartService.updateQuantity(item.id, item.quantity - 1);
    }
  }

  async onIncrementQuantity(item: CartItem) {
    await this.cartService.updateQuantity(item.id, item.quantity + 1);
  }

  async onRemoveItem(productId: number) {
    await this.cartService.remove(productId);
  }

  onCheckout(): void {
    // TODO: Navigate to checkout-page
    console.log('Proceeding to checkout with total:', this.total());
  }

  onContinueShopping(): void {
    this.router.navigate(['/products']);
  }
  onStartShopping(): void {
    this.router.navigate(['/products']);
  }
}