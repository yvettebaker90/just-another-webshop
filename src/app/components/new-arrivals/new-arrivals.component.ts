import { Component, OnInit, signal } from '@angular/core';
import { ProductService, Product } from '../../services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-new-arrivals',
    standalone: true,
    imports: [ProductCardComponent, RouterModule, CommonModule],
    templateUrl: './new-arrivals.component.html'
})
export class NewArrivalsComponent implements OnInit {
    // Holds the filtered list of products with the 'new' tag
    newArrivals = signal<Product[]>([]);

    // Inject the ProductService to fetch products
    constructor(private productService: ProductService) { }

    // On component initialization, fetch all products and filter for 'new' arrivals
    async ngOnInit() {
        // Fetch all products from Supabase
        const products = await this.productService.getProducts();
        // Filter products that have the 'new' tag (tags are already parsed to lowercase arrays)
        this.newArrivals.set(
            products
                .filter(p => p.tags?.includes('new'))
        );
    }
}
