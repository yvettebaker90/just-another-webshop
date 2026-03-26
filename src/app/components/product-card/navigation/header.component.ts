import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionHeartOutline, ionCartOutline, ionPersonOutline } from '@ng-icons/ionicons';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIcon, RouterModule, CommonModule],
  providers: [provideIcons({ ionHeartOutline, ionCartOutline, ionPersonOutline })],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  cartCount = 2;
}