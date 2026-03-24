import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionCartOutline, ionHeart, ionHeartOutline } from '@ng-icons/ionicons';

@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  providers: [provideIcons({ ionCartOutline, ionHeart, ionHeartOutline })],
  template: `
    <div class="relative overflow-hidden bg-[var(--card)] shadow-[var(--shadow-soft)] transition-[transform,box-shadow] duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)] hover:border-[1px] hover:border-black/10 cursor-pointer">
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

      <div class="flex flex-col gap-2 p-4 mb-4">
        <p class="text-sm tracking-wide text-[var(--primary)]">{{ category() }}</p>
        <h3 class="text-lg font-bold [font-family:var(--font-heading)] leading-[1.3] tracking-[-0.02em]">{{ title() }}</h3>
        <p class="text-lg font-semibold">{{ '$' + price() }}</p>
        <button type="button" class="btn btn-primary inline-flex items-center gap-2">
          <ng-icon name="ionCartOutline" size="18" aria-hidden="true"></ng-icon>
          Add to cart
        </button>
      </div>     
    </div>
  `,
})
export class ProductCardComponent {
  category = input('');
  title = input('');
  price = input();
  image = input('');

  isFavorite = signal(false);

  toggleFavorite(): void {
    this.isFavorite.update((value) => !value);
  }
}

@Component({
  selector: 'app-product-cards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCardComponent],
  templateUrl: './product-card.html',
})
export class ProductCardsComponent {
  products = [
    {
    category: 'Makeup',
      title: 'Essence Mascara Lash Princess',
      price: 9.99,
      image: 'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp',
    },
    {
      category: 'Makeup',
      title: 'Red Lipstick',
      price: 12.99,
      image: 'https://cdn.dummyjson.com/product-images/beauty/red-lipstick/thumbnail.webp',
    },
    {
      category: 'Fragrances',
      title: "Dior J'adore",
      price: 89.99,
      image: "https://cdn.dummyjson.com/product-images/fragrances/dior-j'adore/thumbnail.webp",
    },
    {
      category: 'Fragrances',
      title: 'Gucci Bloom Eau de',
      price: 79.99,
      image: 'https://cdn.dummyjson.com/product-images/fragrances/gucci-bloom-eau-de/thumbnail.webp',
    },
        {
    category: 'Makeup',
      title: 'Essence Mascara Lash Princess',
      price: 9.99,
      image: 'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp',
    },
    {
      category: 'Makeup',
      title: 'Red Lipstick',
      price: 12.99,
      image: 'https://cdn.dummyjson.com/product-images/beauty/red-lipstick/thumbnail.webp',
    },
    {
      category: 'Fragrances',
      title: "Dior J'adore",
      price: 89.99,
      image: "https://cdn.dummyjson.com/product-images/fragrances/dior-j'adore/thumbnail.webp",
    },
    {
      category: 'Fragrances',
      title: 'Gucci Bloom Eau de',
      price: 79.99,
      image: 'https://cdn.dummyjson.com/product-images/fragrances/gucci-bloom-eau-de/thumbnail.webp',
    },   
  ];
}