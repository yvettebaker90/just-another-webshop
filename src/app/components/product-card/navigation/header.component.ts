import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionHeartOutline, ionCartOutline, ionPersonOutline, ionHomeOutline, ionBagOutline, ionMailOutline } from '@ng-icons/ionicons';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../../searchbar/searchbar.component';
import { WishlistService } from '../../../services/wishlist.service';
import { ShoppingCartService } from '../../../services/shopping-cart.service';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIcon, RouterModule, SearchBarComponent, CommonModule],
  providers: [provideIcons({ ionHeartOutline, ionCartOutline, ionPersonOutline, ionHomeOutline, ionBagOutline, ionMailOutline })],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(ShoppingCartService);

  readonly wishlistCount = this.wishlistService.totalItems;
  get cartCount() {
    return this.cartService.totalItems();
  }
  mobileMenuOpen = false;
}