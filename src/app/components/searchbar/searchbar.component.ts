import { Component, ChangeDetectionStrategy, signal, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionSearchOutline } from '@ng-icons/ionicons';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, NgIcon],
  viewProviders: [provideIcons({ ionSearchOutline })],
  templateUrl: './searchbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

// Search bar component displayed in the header
// On input, debounces 500ms (0.5 sec) then navigates to /products?search=<query>
// The products page reads the query param and fetches filtered results from Supabase
export class SearchBarComponent implements OnDestroy {
  private readonly router = inject(Router);
  // Reference to the debounce timer so it can be cleared
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  // Reactive state for the current search input value
  readonly searchQuery = signal('');

  // Called on every keystroke. Debounces navigation by 500ms
  onSearch(query: string): void {
    this.searchQuery.set(query);

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.navigateToProducts(query.trim());
    }, 500);
  }

  // Clears the search input and navigates to /products without search param
  clearSearch(): void {
    this.searchQuery.set('');
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.navigateToProducts('');
  }

  // Navigates to the products page with or without a search query param
  private navigateToProducts(query: string): void {
    if (query.length > 0) {
      this.router.navigate(['/products'], { queryParams: { search: query } });
    } else {
      this.router.navigate(['/products'], { queryParams: {} });
    }
  }

  // Clean up the debounce timer when the component is destroyed
  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}