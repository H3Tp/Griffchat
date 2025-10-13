import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { Group, Report, Role, SessionState, User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private USERS = 'users';
  private GROUPS = 'groups';
  private REPORTS = 'reports';
  private SESSION = 'session';

  constructor(private store: StorageService, private router: Router) {
    this.seed();
  }

  private seed() {
    const users = this.store.get<User[]>(this.USERS, []);
    if (!users.some(u => u.username === 'super')) {
      users.push({ id: crypto.randomUUID(), username: 'super', email: 'super@example.com', password: '123', roles: ['super'], groups: [] });
      this.store.set(this.USERS, users);
    }
    const groups = this.store.get<Group[]>(this.GROUPS, []);
    if (groups.length === 0) {
      const gId = crypto.randomUUID();
      const base: Group = {
        id: gId,
        name: 'General',
        owner: 'super',
        admins: ['super'],
        members: ['super'],
        pending: [],
        channels: [
          { id: crypto.randomUUID(), name: 'general', bannedUsers: [] },
          { id: crypto.randomUUID(), name: 'random', bannedUsers: [] }
        ]
      };
      this.store.set(this.GROUPS, [base]);
      const u = users.find(x => x.username === 'super');
      if (u && !u.groups.includes(gId)) { u.groups.push(gId); this.store.set(this.USERS, users); }
    }
    const reports = this.store.get<Report[]>(this.REPORTS, []);
    if (!reports) this.store.set(this.REPORTS, []);

    const s = this.store.get<SessionState>(this.SESSION, { user: null, activeGroupId: null, activeChannelId: null });
    this.store.set(this.SESSION, s);
  }

  isLoggedIn(): boolean { return !!this.currentUser(); }
  currentUser(): User | null { return this.session().user; }
  hasAnyRole(roles: Role[]): boolean { const u = this.currentUser(); return !!u && u.roles.some(r => roles.includes(r)); }

  session(): SessionState { return this.store.get<SessionState>(this.SESSION, { user: null, activeGroupId: null, activeChannelId: null }); }
  saveSession(s: SessionState) { this.store.set(this.SESSION, s); }

  login(username: string, password: string) {
    const users = this.allUsers();
    const m = users.find(u => u.username === username && u.password === password);
    if (!m) return { ok: false, message: 'Invalid credentials' };
    const s = this.session();
    s.user = m;
    if (!s.activeGroupId && m.groups[0]) s.activeGroupId = m.groups[0];
    this.saveSession(s);
    this.router.navigateByUrl('/dashboard');
    return { ok: true };
  }

  logout() {
    const s = this.session();
    s.user = null; s.activeGroupId = null; s.activeChannelId = null;
    this.saveSession(s);
    this.router.navigateByUrl('/login');
  }

  register(username: string, email: string, password: string) {
    const users = this.allUsers();
    if (users.some(u => u.username === username)) return { ok: false, message: 'Username exists' };
    users.push({ id: crypto.randomUUID(), username, email, password, roles: ['user'], groups: [] });
    this.saveUsers(users);
    return { ok: true };
  }

  allUsers(): User[] { return this.store.get<User[]>(this.USERS, []); }
  saveUsers(users: User[]) {
    this.store.set(this.USERS, users);
    const s = this.session();
    if (s.user) {
      const refresh = users.find(u => u.id === s.user!.id) || null;
      s.user = refresh;
      this.saveSession(s);
    }
  }

  groups(): Group[] { return this.store.get<Group[]>(this.GROUPS, []); }
  saveGroups(groups: Group[]) { this.store.set(this.GROUPS, groups); }

  reports(): Report[] { return this.store.get<Report[]>(this.REPORTS, []); }
  saveReports(reps: Report[]) { this.store.set(this.REPORTS, reps); }
}
