import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ShoppingCartService } from '../../services/shopping-cart.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionTrashOutline, ionCartOutline } from '@ng-icons/ionicons';

// Import CartItem type for type safety
import type { CartItem } from '../../services/shopping-cart.service';

@Component({
  selector: 'app-shopping-cart-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgIcon],
  providers: [provideIcons({ ionTrashOutline, ionCartOutline })],
  templateUrl: './shopping-cart.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShoppingCart {
  // Inject the ShoppingCartService to access cart logic
  private readonly cartService = inject(ShoppingCartService);

  // Observable signal for cart items
  cartItems = this.cartService.cartItems;

  // Computed property for cart subtotal (sum of all item prices * quantity)
  subtotal = computed(() => this.cartItems().reduce((sum, item) => sum + item.price * item.quantity, 0));

  // Computed property for shipping cost (free over $50)
  shipping = computed(() => this.subtotal() > 50 ? 0 : 5.99);

  // Computed property for tax (8% of subtotal)
  tax = computed(() => this.subtotal() * 0.08);

  // Computed property for total cost (subtotal + shipping + tax)
  total = computed(() => this.subtotal() + this.shipping() + this.tax());

  // Inject Angular Router for navigation
  constructor(private router: Router) { }

  // Decrease the quantity of a cart item (minimum 1)
  async onDecrementQuantity(item: CartItem) {
    if (item.quantity > 1) {
      await this.cartService.updateQuantity(item.id, item.quantity - 1);
    }
  }

  // Increase the quantity of a cart item
  async onIncrementQuantity(item: CartItem) {
    await this.cartService.updateQuantity(item.id, item.quantity + 1);
  }

  // Remove an item from the cart
  async onRemoveItem(productId: number) {
    await this.cartService.remove(productId);
  }

  // Handle the checkout button click.
  // This method should trigger the checkout process, such as reducing stock in the database
  // and navigating to a confirmation or checkout page.
  onCheckout(): void {
    // TODO: Implement checkout logic here (e.g., call a service method to update stock)
    // For now, just log the total amount to the console.
    console.log('Proceeding to checkout with total:', this.total());
  }

  // Navigate to the products page to continue shopping
  onContinueShopping(): void {
    this.router.navigate(['/products']);
  }

  // Navigate to the products page to start shopping
  onStartShopping(): void {
    this.router.navigate(['/products']);
  }
}