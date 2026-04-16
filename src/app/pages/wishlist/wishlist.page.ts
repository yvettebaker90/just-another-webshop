import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionHeartOutline } from '@ng-icons/ionicons';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCardComponent, NgIcon],
  providers: [provideIcons({ ionHeartOutline })],
  templateUrl: './wishlist.page.html'
})
export class WishlistPage {
  private readonly wishlistService = inject(WishlistService);
  private readonly router = inject(Router);

  readonly wishlistItems = this.wishlistService.wishlistItems;
  readonly totalItems = this.wishlistService.totalItems;
  readonly subtitle = computed(() => {
    const total = this.totalItems();
    return `${total} item${total === 1 ? '' : 's'} saved`;
  });

  onStartShopping(): void {
    void this.router.navigate(['/products']);
  }
}
