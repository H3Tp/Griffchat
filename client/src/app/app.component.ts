import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink ],
  template: `
  <div class="app-shell">
    <header class="navbar">
      <div class="brand">
        <div class="brand-badge">GC</div>
        <div>GriffChat</div>
      </div>
      <nav class="nav">
        <a routerLink="/dashboard" *ngIf="auth.isLoggedIn()">Dashboard</a>
        <a routerLink="/chat" *ngIf="auth.isLoggedIn()">Chat</a>
        <a routerLink="/admin" *ngIf="auth.hasAnyRole(['super','group-admin'])">Admin</a>
        <a routerLink="/login" *ngIf="!auth.isLoggedIn()">Login</a>
        <button class="btn" (click)="auth.logout()" *ngIf="auth.isLoggedIn()">Logout</button>
      </nav>
    </header>
    <main class="container"><router-outlet /></main>
    <footer class="footer">GriffChat</footer>
  </div>
  `
})
export class AppComponent { auth = inject(AuthService); }
