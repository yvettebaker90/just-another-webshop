import { Component } from '@angular/core';
import { ProductCardsComponent } from '../../components/product-card/product-card.component';
import { SearchBarComponent } from '../../components/searchbar/searchbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductCardsComponent, SearchBarComponent],
  templateUrl: './home.page.html'
})
export class Home {}