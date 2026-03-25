import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ProductCardComponent } from '../components/product-card/product-card.component';

@Component({
  selector: 'app-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCardComponent],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class Products {
  readonly products = [
    {
      id: 1,
      category: 'Makeup',
      title: 'Essence Mascara Lash Princess',
      price: 9.99,
      image: 'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp',
      tags: ['new', 'vegan']
    },
    {
      id: 2,
      category: 'Makeup',
      title: 'Red Lipstick',
      price: 12.99,
      image: 'https://cdn.dummyjson.com/product-images/beauty/red-lipstick/thumbnail.webp',
      tags: ['sale', 'editor-pick']
    },
    {
      id: 3,
      category: 'Fragrances',
      title: "Dior J'adore",
      price: 89.99,
      image: "https://cdn.dummyjson.com/product-images/fragrances/dior-j'adore/thumbnail.webp",
      tags: ['premium']
    },
    {
      id: 4,
      category: 'Fragrances',
      title: 'Gucci Bloom Eau de Parfum',
      price: 79.99,
      image: 'https://cdn.dummyjson.com/product-images/fragrances/gucci-bloom-eau-de/thumbnail.webp',
      tags: ['bestseller', 'premium']
    },
    {
      id: 5,
      category: 'Skincare',
      title: 'Calming Daily Cleanser',
      price: 18.5,
      image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=800&q=80',
      tags: ['vegan']
    },
    {
      id: 6,
      category: 'Skincare',
      title: 'Hydrating Cloud Cream',
      price: 34,
      image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?auto=format&fit=crop&w=800&q=80',
      tags: ['new', 'editor-pick']
    },
    {
      id: 7,
      category: 'Haircare',
      title: 'Repair & Shine Hair Serum',
      price: 24,
      image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
      tags: ['sale']
    },
    {
      id: 8,
      category: 'Haircare',
      title: 'Coconut Volume Shampoo',
      price: 19,
      image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80',
      tags: ['bestseller']
    },
    {
      id: 9,
      category: 'Accessories',
      title: 'Rose Quartz Face Roller',
      price: 27,
      image: 'https://images.unsplash.com/photo-1629198724024-f2c6f96f7ad5?auto=format&fit=crop&w=800&q=80',
      tags: ['giftable', 'new']
    }
  ];

  readonly categories = ['All', 'Makeup', 'Fragrances', 'Skincare', 'Haircare', 'Accessories'];
  readonly availableTags = ['new', 'sale', 'bestseller', 'vegan', 'premium', 'editor-pick', 'giftable'];
  readonly lowestPrice = 0;
  readonly highestPrice = 100;

  readonly selectedCategory = signal('All');
  readonly minPrice = signal(0);
  readonly maxPrice = signal(100);
  readonly selectedTags = signal<string[]>([]);

  readonly filteredProducts = computed(() => {
    const category = this.selectedCategory();
    const min = this.minPrice();
    const max = this.maxPrice();
    const tags = this.selectedTags();

    return this.products.filter((product) => {
      const inCategory = category === 'All' || product.category === category;
      const inPriceRange = product.price >= min && product.price <= max;
      const hasSelectedTags = tags.length === 0 || tags.every((tag) => product.tags.includes(tag));

      return inCategory && inPriceRange && hasSelectedTags;
    });
  });

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  updateMinPrice(value: string): void {
    const parsedValue = Number(value);
    this.minPrice.set(parsedValue);
    if (parsedValue > this.maxPrice()) {
      this.maxPrice.set(parsedValue);
    }
  }

  updateMaxPrice(value: string): void {
    const parsedValue = Number(value);
    this.maxPrice.set(parsedValue);
    if (parsedValue < this.minPrice()) {
      this.minPrice.set(parsedValue);
    }
  }

  toggleTag(tag: string): void {
    this.selectedTags.update((tags) => {
      if (tags.includes(tag)) {
        return tags.filter((value) => value !== tag);
      }
      return [...tags, tag];
    });
  }

  clearFilters(): void {
    this.selectedCategory.set('All');
    this.minPrice.set(this.lowestPrice);
    this.maxPrice.set(this.highestPrice);
    this.selectedTags.set([]);
  }
}