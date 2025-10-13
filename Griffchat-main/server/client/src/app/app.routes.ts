import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/startup-redirect/startup-redirect.component').then(m => m.StartupRedirectComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', canActivate: [() => import('./guards/auth.guard').then(m => m.authGuard)], loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'chat', canActivate: [() => import('./guards/auth.guard').then(m => m.authGuard)], loadComponent: () => import('./pages/chat/chat.component').then(m => m.ChatComponent) },
  { path: 'admin', data: { roles: ['super','group-admin'] }, canActivate: [() => import('./guards/role.guard').then(m => m.roleGuard)], loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent) },
  { path: '**', redirectTo: '' }
];
