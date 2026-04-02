import { ChangeDetectionStrategy, Component } from '@angular/core';

type WishlistItem = {
  id: number;
  brand: string;
  title: string;
  price: string;
};

@Component({
  selector: 'app-wishlist',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wishlist.page.html'
})
export class WishlistPage {
  readonly wishlistItems: WishlistItem[] = [
    {
      id: 1,
      brand: 'Brand',
      title: 'Lorem Ipsum',
      price: '1 299 kr'
    },
    {
      id: 2,
      brand: 'Brand',
      title: 'Lorem Ipsum',
      price: '899 kr'
    },
    {
      id: 3,
      brand: 'Brand',
      title: 'Lorem Ipsum',
      price: '649 kr'
    },
    {
        id: 4,
        brand: 'Brand',
        title: 'Lorem Ipsum',
        price: '1 299 kr'
      },    
  ];
}