import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

export function roleGuard(route: ActivatedRouteSnapshot) {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data?.['roles'] as string[]) || [];
  if (roles.length === 0) return true;
  if (auth.hasAnyRole(roles as any)) return true;
  router.navigateByUrl('/dashboard');
  return false;
}
