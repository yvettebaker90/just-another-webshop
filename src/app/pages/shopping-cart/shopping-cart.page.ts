import { Component, ChangeDetectionStrategy, computed, inject, signal, ChangeDetectorRef } from '@angular/core';
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
  // Track login state (must be public for template access)
  public isLoggedIn = false;
  // Inject the ShoppingCartService to access cart logic
  private readonly cartService = inject(ShoppingCartService);

  // Success message state for toast/notification
  showSuccess = false;
  successMessage = '';

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
  constructor(private router: Router, private cdr: ChangeDetectorRef) {
    // Check login state on component creation
    this.cartService['supabaseService'].client.auth.getUser().then(({ data: { user } }) => {
      this.isLoggedIn = !!user;
      this.cdr.markForCheck();
    });
  }

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

  // Handle the checkout button click: perform checkout and show a toast, stay on cart page
  async onCheckout() {
    if (!this.isLoggedIn) {
      this.showSuccessMessage('Please log in to continue');
      return;
    }
    await this.cartService.checkout();
    this.showSuccessMessage('Purchase successful!');
    // Stay on the cart page; cart will be empty after checkout
  }

  // Show a temporary success message (toast)
  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    this.showSuccess = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.showSuccess = false;
      this.cdr.markForCheck();
    }, 2000);
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
