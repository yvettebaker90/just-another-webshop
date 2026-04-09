import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionHeartOutline, ionCartOutline, ionPersonOutline, ionHomeOutline, ionBagOutline } from '@ng-icons/ionicons';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../../searchbar/searchbar.component';
import { WishlistService } from '../../../services/wishlist.service';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIcon, RouterModule, SearchBarComponent, CommonModule],
  providers: [provideIcons({ ionHeartOutline, ionCartOutline, ionPersonOutline, ionHomeOutline, ionBagOutline })],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly wishlistService = inject(WishlistService);

  cartCount = 2; // Example (change to dynamic value later)
  readonly wishlistCount = this.wishlistService.totalItems;
  mobileMenuOpen = false;
}