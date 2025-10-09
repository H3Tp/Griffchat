import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Group, Message, Report, User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DataService {
  private MSGS = 'messages';

  constructor(private auth: AuthService) {}

  me(): User | null { return this.auth.currentUser(); }
  allUsers(): User[] { return this.auth.allUsers(); }
  saveUsers(u: User[]) { this.auth.saveUsers(u); }

  groups(): Group[] { return this.auth.groups(); }
  saveGroups(gs: Group[]) { this.auth.saveGroups(gs); }

  reports(): Report[] { return this.auth.reports(); }
  saveReports(rs: Report[]) { this.auth.saveReports(rs); }

  allPublicGroups(): Group[] { return this.groups(); }
  myGroups(): Group[] { const me = this.me();
    if (!me) return []; return this.groups().filter(g => g.members.includes(me.username)); }

  canAdminister(g: Group): boolean {
    const me = this.me(); if (!me) return false;
    if (me.roles.includes('super')) return true;
    return g.admins.includes(me.username);
  }

  canDeleteGroup(g: Group): boolean {
    const me = this.me(); if (!me) return false;
    if (me.roles.includes('super')) return true;
    return g.owner === me.username;
  }

  setActive(groupId: string | null, channelId: string | null) {
    const s = this.auth.session();
    s.activeGroupId = groupId; s.activeChannelId = channelId;
    this.auth.saveSession(s);
  }
  activeGroup(): Group | null {
    const s = this.auth.session();
    if (!s.activeGroupId) return null;
    return this.groups().find(g => g.id === s.activeGroupId) || null;
  }
  activeChannelId(): string | null { return this.auth.session().activeChannelId; }

  createGroup(name: string) {
    const me = this.me(); if (!me) return { ok: false, message: 'Not authenticated' };
    if (!(me.roles.includes('super') || me.roles.includes('group-admin'))) return { ok: false, message: 'Not authorized' };
    const gs = this.groups();
    if (gs.some(g => g.name.toLowerCase() === name.toLowerCase())) return { ok: false, message: 'Group already exists' };
    const newG: Group = { id: crypto.randomUUID(), name, owner: me.username, admins: [me.username], members: [me.username], pending: [], channels: [] };
    gs.push(newG);
    this.saveGroups(gs);
    const users = this.allUsers();
    const u = users.find(x => x.username === me.username);
    if (u && !u.groups.includes(newG.id)) u.groups.push(newG.id);
    this.saveUsers(users);
    return { ok: true, group: newG };
  }

  deleteGroup(groupId: string) {
    const me = this.me(); if (!me) return { ok: false, message: 'Not authenticated' };
    const gs = this.groups();
    const g = gs.find(x => x.id === groupId); if (!g) return { ok: false, message: 'Group not found' };
    if (!this.canDeleteGroup(g)) return { ok: false, message: 'Not authorized to delete this group' };
    const remaining = gs.filter(x => x.id !== groupId);
    this.saveGroups(remaining);
    const users = this.allUsers();
    users.forEach(u => u.groups = u.groups.filter(id => id !== groupId));
    this.saveUsers(users);
    const s = this.auth.session();
    if (s.activeGroupId === groupId) { s.activeGroupId = null; s.activeChannelId = null; this.auth.saveSession(s); }
    this.saveMessages(this.messages().filter(m => m.groupId !== groupId));
    return { ok: true };
  }

  addChannel(groupId: string, name: string) {
    const me = this.me(); if (!me) return { ok: false, message: 'Not authenticated' };
    const gs = this.groups(); const g = gs.find(x => x.id === groupId);
    if (!g) return { ok: false, message: 'Group not found' };
    if (!this.canAdminister(g)) return { ok: false, message: 'Not authorized' };
    if (g.channels.some(c => c.name.toLowerCase() === name.toLowerCase())) return { ok: false, message: 'Channel exists' };
    g.channels.push({ id: crypto.randomUUID(), name, bannedUsers: [] });
    this.saveGroups(gs);
    return { ok: true };
  }

  deleteChannel(groupId: string, channelId: string) {
    const me = this.me(); if (!me) return { ok: false, message: 'Not authenticated' };
    const gs = this.groups(); const g = gs.find(x => x.id === groupId);
    if (!g) return { ok: false, message: 'Group not found' };
    if (!this.canAdminister(g)) return { ok: false, message: 'Not authorized' };
    g.channels = g.channels.filter(c => c.id !== channelId);
    this.saveGroups(gs);
    const s = this.auth.session();
    if (s.activeChannelId === channelId) { s.activeChannelId = null; this.auth.saveSession(s); }
    this.saveMessages(this.messages().filter(m => !(m.groupId===groupId && m.channelId===channelId)));
    return { ok: true };
  }

  requestJoin(groupId: string) {
    const me = this.me(); if (!me) return { ok: false, message: 'Not authenticated' };
    const gs = this.groups(); const g = gs.find(x => x.id === groupId);
    if (!g) return { ok: false, message: 'Group not found' };
    if (g.members.includes(me.username)) return { ok: false, message: 'Already a member' };
    if (!g.pending.includes(me.username)) g.pending.push(me.username);
    this.saveGroups(gs);
    return { ok: true };
  }

  approveJoin(groupId: string, username: string) {
    const me = this.me(); if (!me) return { ok: false, message: 'Not authenticated' };
    const gs = this.groups(); const g = gs.find(x => x.id === groupId);
    if (!g) return { ok: false, message: 'Group not found' };
    if (!this.canAdminister(g)) return { ok: false, message: 'Not authorized' };
    g.pending = g.pending.filter(p => p !== username);
    if (!g.members.includes(username)) g.members.push(username);
    const users = this.allUsers();
    const u = users.find(x => x.username === username);
    if (u && !u.groups.includes(groupId)) u.groups.push(groupId);
    this.saveUsers(users);
    this.saveGroups(gs);
    return { ok: true };
  }

  addUserToGroup(groupId: string, username: string) {
    const me = this.me(); if (!me) return { ok: false, message: 'Not authenticated' };
    const gs = this.groups(); const g = gs.find(x => x.id === groupId);
    if (!g) return { ok: false, message: 'Group not found' };
    if (!this.canAdminister(g)) return { ok: false, message: 'Not authorized' };
    if (!g.members.includes(username)) g.members.push(username);
    const users = this.allUsers(); const u = users.find(x => x.username === username);
    if (u && !u.groups.includes(groupId)) u.groups.push(groupId);
    this.saveUsers(users); this.saveGroups(gs);
    return { ok: true };
  }

  removeUserFromGroup(groupId: string, username: string) {
    const me = this.me(); if (!me) return { ok: false, message: 'Not authenticated' };
    const gs = this.groups(); const g = gs.find(x => x.id === groupId);
    if (!g) return { ok: false, message: 'Group not found' };
    if (!this.canAdminister(g)) return { ok: false, message: 'Not authorized' };
    g.members = g.members.filter(m => m !== username);
    g.admins = g.admins.filter(a => a !== username);
    const users = this.allUsers(); const u = users.find(x => x.username === username);
    if (u) u.groups = u.groups.filter(id => id !== groupId);
    if (g.admins.length === 0) { if (!g.admins.includes('super')) g.admins.push('super'); g.owner = 'super'; }
    this.saveUsers(users); this.saveGroups(gs);
    const s = this.auth.session();
    if (this.me()?.username === username && s.activeGroupId === groupId) { s.activeGroupId = null; s.activeChannelId = null; this.auth.saveSession(s); }
    return { ok: true };
  }

  promoteToGroupAdmin(username: string) {
    const me = this.me(); if (!me || !me.roles.includes('super')) return { ok: false, message: 'Only super can promote' };
    const users = this.allUsers(); const u = users.find(x => x.username === username);
    if (!u) return { ok: false, message: 'User not found' };
    if (!u.roles.includes('group-admin')) u.roles.push('group-admin');
    this.saveUsers(users);
    return { ok: true };
  }

  upgradeToSuper(username: string) {
    const me = this.me(); if (!me || !me.roles.includes('super')) return { ok: false, message: 'Only super can upgrade' };
    const users = this.allUsers(); const u = users.find(x => x.username === username);
    if (!u) return { ok: false, message: 'User not found' };
    if (!u.roles.includes('super')) u.roles.push('super');
    this.saveUsers(users);
    return { ok: true };
  }

  deleteUserGlobal(username: string) {
    const me = this.me(); if (!me || !me.roles.includes('super')) return { ok: false, message: 'Only super can delete users' };
    if (username === 'super') return { ok: false, message: 'Cannot delete super' };
    const users = this.allUsers().filter(u => u.username !== username);
    this.saveUsers(users);
    const gs = this.groups();
    gs.forEach(g => {
      g.members = g.members.filter(m => m !== username);
      g.admins = g.admins.filter(a => a !== username);
      if (g.owner === username) g.owner = 'super';
      if (g.admins.length === 0) { g.admins.push('super'); g.owner = 'super'; }
      g.channels.forEach(c => c.bannedUsers = c.bannedUsers.filter(b => b !== username));
      g.pending = g.pending.filter(p => p !== username);
    });
    this.saveGroups(gs);
    const s = this.auth.session();
    if (s.user?.username === username) { s.user = null; s.activeGroupId = null; s.activeChannelId = null; this.auth.saveSession(s); }
    this.saveMessages(this.messages().filter(m => m.by !== username));
    return { ok: true };
  }

  deleteSelf() {
    const me = this.me(); if (!me) return { ok: false, message: 'Not authenticated' };
    if (me.username === 'super') return { ok: false, message: 'Super cannot delete self' };
    const users = this.allUsers().filter(u => u.username !== me.username);
    this.saveUsers(users);
    const gs = this.groups();
    gs.forEach(g => {
      g.members = g.members.filter(m => m !== me.username);
      g.admins = g.admins.filter(a => a !== me.username);
      if (g.owner === me.username) g.owner = 'super';
      if (g.admins.length === 0) { g.admins.push('super'); g.owner = 'super'; }
      g.channels.forEach(c => c.bannedUsers = c.bannedUsers.filter(b => b !== me.username));
      g.pending = g.pending.filter(p => p !== me.username);
    });
    this.saveGroups(gs);
    const s = this.auth.session();
    s.user = null; s.activeGroupId = null; s.activeChannelId = null; this.auth.saveSession(s);
    this.saveMessages(this.messages().filter(m => m.by !== me.username));
    return { ok: true };
  }

  banUser(groupId: string, channelId: string, username: string, reason?: string) {
    const me = this.me(); if (!me) return { ok: false, message: 'Not authenticated' };
    const gs = this.groups(); const g = gs.find(x => x.id === groupId);
    if (!g) return { ok: false, message: 'Group not found' };
    if (!this.canAdminister(g)) return { ok: false, message: 'Not authorized' };
    const ch = g.channels.find(c => c.id === channelId); if (!ch) return { ok: false, message: 'Channel not found' };
    if (!ch.bannedUsers.includes(username)) ch.bannedUsers.push(username);
    this.saveGroups(gs);
    const reps = this.reports();
    reps.push({ id: crypto.randomUUID(), timestamp: Date.now(), by: me.username, target: username, groupId, channelId, reason });
    this.saveReports(reps);
    return { ok: true };
  }

  unbanUser(groupId: string, channelId: string, username: string) {
    const me = this.me(); if (!me) return { ok: false, message: 'Not authenticated' };
    const gs = this.groups(); const g = gs.find(x => x.id === groupId);
    if (!g) return { ok: false, message: 'Group not found' };
    if (!this.canAdminister(g)) return { ok: false, message: 'Not authorized' };
    const ch = g.channels.find(c => c.id === channelId); if (!ch) return { ok: false, message: 'Channel not found' };
    ch.bannedUsers = ch.bannedUsers.filter(u => u !== username);
    this.saveGroups(gs);
    return { ok: true };
  }

  messages(): Message[] { return JSON.parse(localStorage.getItem(this.MSGS) || '[]'); }
  saveMessages(ms: Message[]){ localStorage.setItem(this.MSGS, JSON.stringify(ms)); }

  listMessages(groupId: string, channelId: string): Message[] {
    return this.messages()
      .filter(m => m.groupId === groupId && m.channelId === channelId)
      .sort((a,b) => a.ts - b.ts);
  }

  sendMessage(groupId: string, channelId: string, text: string) {
    const me = this.me(); if (!me) return { ok: false, message: 'Not authenticated' };
    const g = this.groups().find(x => x.id === groupId); if (!g) return { ok: false, message: 'Group not found' };
    if (!g.members.includes(me.username)) return { ok: false, message: 'Join the group first' };
    const ch = g.channels.find(c => c.id === channelId); if (!ch) return { ok: false, message: 'Channel not found' };
    if (ch.bannedUsers.includes(me.username)) return { ok: false, message: 'You are banned in this channel' };

    const ms = this.messages();
    ms.push({ id: crypto.randomUUID(), groupId, channelId, by: me.username, text, ts: Date.now() });
    this.saveMessages(ms);
    return { ok: true };
  }

  leaveGroup(groupId: string) {
    const me = this.me(); if (!me) return { ok: false, message: 'Not authenticated' };
    const gs = this.groups(); const g = gs.find(x => x.id === groupId);
    if (!g) return { ok: false, message: 'Group not found' };
    g.members = g.members.filter(m => m !== me.username);
    g.admins = g.admins.filter(a => a !== me.username);
    if (g.owner === me.username) g.owner = 'super';
    if (g.admins.length === 0) { g.admins.push('super'); g.owner = 'super'; }
    this.saveGroups(gs);
    const users = this.allUsers(); const u = users.find(x => x.username === me.username);
    if (u) u.groups = u.groups.filter(id => id !== groupId);
    this.saveUsers(users);
    const s = this.auth.session();
    if (s.activeGroupId === groupId) { s.activeGroupId = null; s.activeChannelId = null; this.auth.saveSession(s); }
    return { ok: true };
  }
}
