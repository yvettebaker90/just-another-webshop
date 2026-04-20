import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products/products.page').then((m) => m.Products),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./pages/products-detail/products-details.page').then(
        (m) => m.ProductDetail
      ),
  },
  {
    path: 'wishlist',
    loadComponent: () =>
      import('./pages/wishlist/wishlist.page').then((m) => m.WishlistPage),
  },
  {
    path: 'shopping-cart',
    loadComponent: () =>
      import('./pages/shopping-cart/shopping-cart.page').then(
        (m) => m.ShoppingCart
      ),
  },
  {
    path: 'product-details',
    loadComponent: () =>
      import('./components/product-details/product-details.component').then(
        (m) => m.ProductDetails
      ),
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./pages/account/account.page').then((m) => m.AccountPage),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.page').then((m) => m.ContactFormPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.Home),
  },
  { path: '**', redirectTo: 'products' },
];
