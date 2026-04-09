import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'app-wishlist',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCardComponent],
  templateUrl: './wishlist.page.html'
})
export class WishlistPage {
  private readonly wishlistService = inject(WishlistService);

  readonly wishlistItems = this.wishlistService.wishlistItems;
  readonly totalItems = this.wishlistService.totalItems;
  readonly subtitle = computed(() => {
    const total = this.totalItems();
    return `${total} item${total === 1 ? '' : 's'} saved`;
  });
}