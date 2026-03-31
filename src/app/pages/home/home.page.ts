import { Component, signal, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TestProductCardsComponent } from '../../components/test-product-card/test-product-card.component';
import { SearchBarComponent } from '../../components/searchbar/searchbar.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { Product } from '../../services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TestProductCardsComponent, SearchBarComponent, HeroComponent],
  templateUrl: './home.page.html'
})
export class Home {
  searchResults = signal<Product[] | null>(null);
  private router = inject(Router);
  public route = inject(ActivatedRoute);

  onSearchResults(results: Product[], query?: string) {
    this.searchResults.set(results.length > 0 ? results : null);
    if (typeof query === 'string') {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { q: query || null },
        queryParamsHandling: 'merge',
      });
    }
  }
}