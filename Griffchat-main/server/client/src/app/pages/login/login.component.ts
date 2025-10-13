import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone:true, selector:'app-login', imports:[CommonModule,FormsModule],
  template:`
  <div class="card auth-card">
    <h2>Welcome</h2>
    <p class="muted">Sign in or create a new account</p>
    <form (ngSubmit)="doLogin()">
      <label>Username</label>
      <input [(ngModel)]="lu" name="lu" required>
      <label>Password</label>
      <input [(ngModel)]="lp" name="lp" type="password" required>
      <button class="btn primary" type="submit">Login</button>
      <div class="error" *ngIf="loginError">{{loginError}}</div>
    </form>
    <div class="divider"></div>
    <form (ngSubmit)="doRegister()">
      <label>New Username</label><input [(ngModel)]="ru" name="ru" required>
      <label>Email</label><input [(ngModel)]="re" name="re" type="email" required>
      <label>Password</label><input [(ngModel)]="rp" name="rp" type="password" required>
      <button class="btn" type="submit">Register</button>
      <div class="ok" *ngIf="regOk">{{regOk}}</div>
      <div class="error" *ngIf="regError">{{regError}}</div>
    </form>
  </div>`
})
export class LoginComponent {
  private auth=inject(AuthService);
  lu=''; lp=''; loginError=''; ru=''; re=''; rp=''; regOk=''; regError='';
  doLogin(){ const r=this.auth.login(this.lu.trim(), this.lp); this.loginError=r.ok?'':(r.message||'Login failed'); }
  doRegister(){ const r=this.auth.register(this.ru.trim(), this.re.trim(), this.rp); if(r.ok){ this.regOk='Registered. You can now log in.'; this.regError=''; } else { this.regError=r.message||'Registration failed'; this.regOk=''; } }
}
