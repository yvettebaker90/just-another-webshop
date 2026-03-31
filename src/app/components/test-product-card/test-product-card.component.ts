import { ChangeDetectionStrategy, Component, input, signal, Input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionCartOutline, ionHeart, ionHeartOutline } from '@ng-icons/ionicons';
import { Product } from '../../services/product.service';

type ProductCategoryGroup = {
    category: string;
    products: Product[];
};

@Component({
    selector: 'app-test-product-card',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgIcon],
    providers: [provideIcons({ ionCartOutline, ionHeart, ionHeartOutline })],
    host: {
        class: 'block h-full',
    },
    template: `
    <div class="relative flex h-full flex-col overflow-hidden bg-[var(--card)] shadow-[var(--shadow-soft)] transition-[transform,box-shadow] duration-200 ease-in-out hover:-translate-y-0.5 hover:border-[1px] hover:border-black/10 hover:shadow-[var(--shadow-hover)] cursor-pointer">
      <button
        type="button"
        class="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[var(--foreground)] shadow-sm transition hover:scale-105"
        [attr.aria-label]="isFavorite() ? 'Remove from favorites' : 'Add to favorites'"
        [attr.aria-pressed]="isFavorite()"
        (click)="toggleFavorite()"
      >
        <ng-icon [name]="isFavorite() ? 'ionHeart' : 'ionHeartOutline'" size="20"></ng-icon>
      </button>

      <div class="relative aspect-square overflow-hidden bg-[var(--secondary)]">
        <img [src]="image()" [alt]="'Picture of ' + title()" [title]="title()" class="h-full w-full object-cover" />
      </div>

      <div class="mb-4 flex flex-1 flex-col gap-2 p-4">
        <p class="text-sm tracking-wide text-[var(--primary)] capitalize">{{ brand() }} / {{ category() }}</p>
        <h3
          class="min-h-[3.4rem] text-lg font-bold [font-family:var(--font-heading)] leading-[1.3] tracking-[-0.02em] overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
          [title]="title()"
        >{{ title() }}</h3>
        <p class="text-lg font-semibold">{{ '$' + price() }}</p>
        <button type="button" class="btn btn-primary mt-auto inline-flex items-center gap-2">
          <ng-icon name="ionCartOutline" size="18" aria-hidden="true"></ng-icon>
          Add to cart
        </button>
      </div>     
    </div>
  `,
})

// Single product card component for displaying product details and favorite toggle
export class TestProductCardComponent {
    // Inputs for product properties
    category = input('');
    title = input('');
    price = input(0);
    image = input('');
    brand = input('');

    // Local state for favorite toggle
    isFavorite = signal(false);

    // Toggle favorite state
    toggleFavorite(): void {
        this.isFavorite.update((value) => !value);
    }
}

@Component({
    selector: 'app-test-product-cards',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TestProductCardComponent],
    templateUrl: './test-product-card.component.html',
})
// Product cards container component for displaying a list of products
export class TestProductCardsComponent {
    // Input array of products to display
    @Input() products: Product[] = [];
    // Loading and error state (not used in this version)
    loading = false;
    error: string | null = null;
    // Returns total number of products
    totalProducts = () => this.products.length;
    // Groups products by category
    groupedProducts = () => {
        const groups = new Map<string, Product[]>();
        for (const product of this.products) {
            const category = product.category?.trim() || 'Other';
            const existing = groups.get(category) ?? [];
            groups.set(category, [...existing, product]);
        }
        return Array.from(groups.entries()).map(([category, products]) => ({
            category,
            products,
        }));
    };
}
