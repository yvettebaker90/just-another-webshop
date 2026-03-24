import { Component } from '@angular/core';
import { ProductCardsComponent } from '../components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  imports: [ProductCardsComponent],
  templateUrl: './home.html'
})
export class Home {}