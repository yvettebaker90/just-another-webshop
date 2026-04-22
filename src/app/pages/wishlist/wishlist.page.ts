import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
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
export class WishlistPage implements OnInit {
  private readonly wishlistService = inject(WishlistService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly wishlistItems = this.wishlistService.wishlistItems;
  readonly totalItems = this.wishlistService.totalItems;
  readonly subtitle = computed(() => {
    const total = this.totalItems();
    return `${total} item${total === 1 ? '' : 's'} saved`;
  });

  ngOnInit(): void {
    this.title.setTitle('Wishlist | Just Another Webshop');
    this.meta.updateTag({
      name: 'description',
      content: 'View your saved favorites and shop your wishlist at Just Another Webshop.',
    });
  }

  onStartShopping(): void {
    void this.router.navigate(['/products']);
  }
}
