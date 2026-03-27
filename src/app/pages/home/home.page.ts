import { Component } from '@angular/core';
import { ProductCardsComponent } from '../../components/product-card/product-card.component';
import { SearchBarComponent } from '../../components/searchbar/searchbar.component';
import { HeroComponent } from '../../components/hero/hero.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductCardsComponent, SearchBarComponent, HeroComponent],
  templateUrl: './home.page.html'
})
export class Home {}