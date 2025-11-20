import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

/**
 * Definición de rutas de la aplicación.
 * - Públicas: auth/login, auth/register.
 * - Protegidas por `authGuard`: home, products, clients y subrutas.
 * - Redirecciones: raíz -> auth/login, wildcard -> home.
 */

export const routes: Routes = [
  // Auth
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login.page').then(m => m.default),
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./auth/register/register.page').then(m => m.default),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  
  // Products
  {
    path: 'products',
    canActivate: [authGuard],
    loadComponent: () => import('./products/products-list/products.page').then(m => m.default),
  },
  {
    path: 'products/new',
    canActivate: [authGuard],
    loadComponent: () => import('./products/product-form/product-form.page').then(m => m.default),
  },
  {
    path: 'products/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./products/product-form/product-form.page').then(m => m.default),
  },
  // Clients
  {
    path: 'clients',
    canActivate: [authGuard],
    loadComponent: () => import('./clients/clients-list/clients.page').then(m => m.default),
  },
  {
    path: 'clients/new',
    canActivate: [authGuard],
    loadComponent: () => import('./clients/client-form/client-form.page').then(m => m.default),
  },
  {
    path: 'clients/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./clients/client-form/client-form.page').then(m => m.default),
  },
  // Bonus placeholders
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  { path: '**', redirectTo: 'home' },
];
