import { Routes } from '@angular/router';
import { Home } from './pages/home/home.page';
import { Products } from './pages/products/products.page';
import { ProductDetail } from './pages/products-detail/products-details.page';
import { ShoppingCart } from './pages/shopping-cart/shopping-cart.page';
import { ProductDetails } from './components/product-details/product-details.component';
import { WishlistPage } from './pages/wishlist/wishlist.page';
import { AccountPage } from './pages/account/account.page';
import { LoginPage } from './pages/login/login.page';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'products', component: Products },
  { path: 'products/:id', component: ProductDetail },
  { path: 'shopping-cart', component: ShoppingCart },
  { path: 'wishlist', component: WishlistPage },
  { path: 'product-details', component: ProductDetails },
  { path: 'account', component: AccountPage },
  { path: 'login', component: LoginPage },
  { path: 'home', component: Home },
  { path: '**', redirectTo: 'products' },
];
