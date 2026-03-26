import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  templateUrl: './products-details.page.html'
})
export class ProductDetail {
  productId = '';

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.productId = params['id'];
    });
  }
}