import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [],
  templateUrl: './products.html'
})
export class Products {
  products = [
    { id: 1, name: 'Product 1', price: 99 },
    { id: 2, name: 'Product 2', price: 199 },
    { id: 3, name: 'Product 3', price: 299 }
  ];

  constructor(private router: Router) {}

  goToProduct(id: number) {
    this.router.navigate(['/products', id]);
  }
}