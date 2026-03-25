import { Routes } from '@angular/router';
import { Home } from './pages/home';
import { Products } from './pages/products';
import { ProductDetail } from './pages/products-details';
import { ShoppingCart } from './pages/shopping-cart';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'products', component: Products },
  { path: 'products/:id', component: ProductDetail },
  { path: 'shopping-cart', component: ShoppingCart },
  { path: '**', redirectTo: 'products' }
];
