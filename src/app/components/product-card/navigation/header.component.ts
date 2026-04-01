import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionHeartOutline, ionCartOutline, ionPersonOutline, ionHomeOutline, ionBagOutline } from '@ng-icons/ionicons';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../../searchbar/searchbar.component';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIcon, RouterModule, SearchBarComponent, CommonModule],
  providers: [provideIcons({ ionHeartOutline, ionCartOutline, ionPersonOutline, ionHomeOutline, ionBagOutline })],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  cartCount = 2;
  mobileMenuOpen = false;
}