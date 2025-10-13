import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
@Component({ standalone:true, selector:'app-startup-redirect', template:`` })
export class StartupRedirectComponent implements OnInit {
  private auth=inject(AuthService); private router=inject(Router);
  ngOnInit(){ this.router.navigateByUrl(this.auth.isLoggedIn()?'/dashboard':'/login'); }
}
