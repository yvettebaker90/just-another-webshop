import { Routes } from '@angular/router';
import { Home } from './pages/home/home.page';
import { Products } from './pages/products/products.page';
import { ProductDetail } from './pages/products-detail/products-details.page';
import { ShoppingCart } from './pages/shopping-cart/shopping-cart.page';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'products', component: Products },
  { path: 'products/:id', component: ProductDetail },
  { path: 'shopping-cart', component: ShoppingCart },
  { path: '**', redirectTo: 'products' }
];
