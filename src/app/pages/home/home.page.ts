import { Component } from '@angular/core';
import { ProductCardsComponent } from '../../components/product-card/product-card.component';
import { HeroComponent } from '../../components/hero/hero.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductCardsComponent, HeroComponent],
  templateUrl: './home.page.html'
})
export class Home {}