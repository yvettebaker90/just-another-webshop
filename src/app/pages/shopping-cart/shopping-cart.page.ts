import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionTrashOutline } from '@ng-icons/ionicons';

interface CartItem {
  id: string;
  productId: string;
  title: string;
  category: string;
  price: number;
  image: string;
  quantity: number;
}

@Component({
  selector: 'app-shopping-cart-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgIcon],
  providers: [provideIcons({ ionTrashOutline })],
  templateUrl: './shopping-cart.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShoppingCart {
  constructor(private router: Router) {}
  cartItems: CartItem[] = [
    {
      id: 'cart-1',
      productId: '1',
      title: 'Minimal Ceramic Vase',
      category: 'Home Decor',
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1574421233376-06f2ccf017f7?w=300&h=300&fit=crop',
      quantity: 2,
    },
    {
      id: 'cart-2',
      productId: '2',
      title: 'Wireless Headphones',
      category: 'Electronics',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      quantity: 1,
    },
    {
      id: 'cart-3',
      productId: '3',
      title: 'Smart Watch',
      category: 'Electronics',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
      quantity: 1,
    },
  ];

  /* Calculations */
  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get shipping(): number {
    return this.subtotal > 50 ? 0 : 5.99;
  }

  get tax(): number {
    return this.subtotal * 0.08;
  }

  get total(): number {
    return this.subtotal + this.shipping + this.tax;
  }

  /* Eventhandlers - CartService */

  /* Decrease quantity with 1 */
  onDecrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity -= 1;
      // TODO: Call cartService.updateQuantity(item.id, item.quantity)
      console.log(`Quantity decreased to ${item.quantity} for ${item.title}`);
    }
  }

  /* Increase quantity with 1 */
  onIncrementQuantity(item: CartItem): void {
    item.quantity += 1;
    // TODO: Call cartService.updateQuantity(item.id, item.quantity)
    console.log(`Quantity increased to ${item.quantity} for ${item.title}`);
  }

  /* Delete item from cart */
  onRemoveItem(cartItemId: string): void {
    const index = this.cartItems.findIndex((item) => item.id === cartItemId);
    if (index > -1) {
      const removedItem = this.cartItems[index];
      this.cartItems.splice(index, 1);
      // TODO: Call cartService.removeFromCart(cartItemId)
      console.log(`Removed ${removedItem.title} from cart`);
    }
  }

  /* Proceed to checkout */
  onCheckout(): void {
    // TODO: Navigate to checkout-page
    console.log('Proceeding to checkout with total:', this.total);
  }

  /* Continue shopping (navigate to products-page) */
  onContinueShopping(): void {
    this.router.navigate(['/products']);
  }
  /* Start shopping (navigate to products-page) */
  onStartShopping(): void {
    this.router.navigate(['/products']);
  }
}