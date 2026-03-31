import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionSearchOutline } from '@ng-icons/ionicons';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';
import { Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, NgIcon, FormsModule],
  viewProviders: [provideIcons({ ionSearchOutline })],
  templateUrl: './searchbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

/* Search bar component for product search with debounced 
  input and server-side querying */
export class SearchBarComponent {
  // Inject the product service for API calls
  private productService = inject(ProductService);
  // Initial search query (from query param)
  @Input() initialQuery: string = '';
  // Emits search results and query to parent
  @Output() resultsChanged = new EventEmitter<{ results: Product[]; query: string }>();

  // Local state for search input
  searchQuery = signal('');
  // Local state for search results
  searchResults = signal<Product[]>([]);
  // Loading indicator
  isLoading = signal(false);
  // Error message state
  error = signal<string | null>(null);

  // Debounce timeout reference
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  /* Called when the user types in the search field.
    Uses debouncing to reduce API calls */
  async onSearch(query: string) {
    this.searchQuery.set(query);

    // Clear previous debounce timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Set new debounce timeout (500ms)
    this.searchTimeout = setTimeout(async () => {
      await this.performSearch(query);
    }, 500);
  }

  /* Performs the search against the server (Supabase) */
  private async performSearch(query: string) {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const results = await this.productService.searchProducts(query);
      this.searchResults.set(results);
      this.resultsChanged.emit({ results, query });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Search failed. Try again.';
      this.error.set(errorMsg);
      this.searchResults.set([]);
      console.error('Search error:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  /* Clears the search input and results */
  clearSearch() {
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.error.set(null);
    this.resultsChanged.emit({ results: [], query: '' });

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  /* Cleanup on component destroy */
  ngOnDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}