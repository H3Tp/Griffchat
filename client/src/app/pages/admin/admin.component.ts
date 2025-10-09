import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/data.service';
import { Group, Report, User } from '../../models/models';

@Component({
  standalone: true,
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="grid">
    <div class="card">
      <h3>Users</h3>
      <div class="row">
        <select [(ngModel)]="userSel" name="us">
          <option value="" disabled selected>Select user</option>
          <option *ngFor="let u of users" [value]="u.username">{{u.username}} ({{u.roles.join(', ')}})</option>
        </select>
        <button class="btn" (click)="promote()">Promote to Group Admin</button>
        <button class="btn" (click)="upgrade()" *ngIf="isSuper">Upgrade to Super</button>
        <button class="btn" (click)="deleteUser()" *ngIf="isSuper">Delete User</button>
      </div>
      <ul class="list compact"><li *ngFor="let u of users"><b>{{u.username}}</b> • {{u.email}} • <i>{{u.roles.join(', ')}}</i></li></ul>
      <div class="ok" *ngIf="ok">{{ok}}</div><div class="error" *ngIf="error">{{error}}</div>
    </div>

    <div class="card">
      <h3>Group Admin</h3>
      <label>Create Group</label>
      <div class="row">
        <input [(ngModel)]="newGroupName" name="ng" placeholder="Team Alpha">
        <button class="btn" (click)="createGroup()">Create</button>
      </div>

      <div class="divider"></div>
      <label>Manage Group</label>
      <select [(ngModel)]="groupSel" name="gs">
        <option value="" disabled selected>Select group</option>
        <option *ngFor="let g of manageableGroups()" [value]="g.id">{{g.name}} (owner: {{g.owner}})</option>
      </select>

      <div class="muted sub" *ngIf="currentGroup()">
        Admins: {{ adminsText() }} • Members: {{ membersText() }} • Pending: {{ pendingText() }}
      </div>

      <div class="row" style="margin-top:10px">
        <button class="btn" (click)="deleteGroup()" [disabled]="!canDeleteCurrent()">Delete Group</button>
      </div>

      <div class="divider"></div>
      <h4>Channels</h4>
      <div class="row">
        <input [(ngModel)]="newChannelName" name="nc" placeholder="general">
        <button class="btn" (click)="addChannel()">Add Channel</button>
      </div>
      <div class="row" style="margin-top:8px">
        <select [(ngModel)]="channelSel" name="cs">
          <option value="" disabled selected>Select channel</option>
          <option *ngFor="let c of (currentGroup()?.channels || [])" [value]="c.id">{{c.name}}</option>
        </select>
        <button class="btn" (click)="deleteChannel()">Delete Channel</button>
      </div>

      <div class="divider"></div>
      <h4>Membership</h4>
      <div class="row">
        <select [(ngModel)]="pendingSel" name="ps">
          <option value="" disabled selected>Approve pending</option>
          <option *ngFor="let u of (currentGroup()?.pending || [])" [value]="u">{{u}}</option>
        </select>
        <button class="btn" (click)="approve()">Approve</button>
      </div>
      <div class="row" style="margin-top:8px">
        <select [(ngModel)]="addUserSel" name="aus">
          <option value="" disabled selected>Add user to group</option>
          <option *ngFor="let u of users" [value]="u.username">{{u.username}}</option>
        </select>
        <button class="btn" (click)="addUserToGroup()">Add</button>
      </div>
      <div class="row" style="margin-top:8px">
        <select [(ngModel)]="removeUserSel" name="rus">
          <option value="" disabled selected>Remove user from group</option>
          <option *ngFor="let u of (currentGroup()?.members || [])" [value]="u">{{u}}</option>
        </select>
        <button class="btn" (click)="removeUserFromGroup()">Remove</button>
      </div>

      <div class="divider"></div>
      <h4>Ban / Unban from Channel</h4>
      <div class="row">
        <select [(ngModel)]="banUserSel" name="bus">
          <option value="" disabled selected>Select user</option>
          <option *ngFor="let u of (currentGroup()?.members || [])" [value]="u">{{u}}</option>
        </select>
        <select [(ngModel)]="banChannelSel" name="bcs">
          <option value="" disabled selected>Select channel</option>
          <option *ngFor="let c of (currentGroup()?.channels || [])" [value]="c.id">{{c.name}}</option>
        </select>
      </div>
      <div class="row" style="margin-top:8px">
        <input [(ngModel)]="banReason" name="br" placeholder="Reason (optional)">
        <button class="btn" (click)="ban()">Ban</button>
        <button class="btn" (click)="unban()">Unban</button>
      </div>

      <div class="ok" *ngIf="ok2">{{ok2}}</div><div class="error" *ngIf="error2">{{error2}}</div>
    </div>

    <div class="card" *ngIf="isSuper">
      <h3>Reports (Bans)</h3>
      <div class="muted" *ngIf="!reports.length">No reports yet.</div>
      <ul class="list compact" *ngIf="reports.length">
        <li *ngFor="let r of reports | slice:-20">
          <div><b>{{r.target}}</b> banned by <b>{{r.by}}</b> • {{groupName(r.groupId)}} / {{channelName(r.groupId, r.channelId)}}</div>
          <div class="sub">Reason: {{r.reason || 'n/a'}} • {{fmt(r.timestamp)}}</div>
        </li>
      </ul>
    </div>
  </div>
  `
})
export class AdminComponent {
  auth = inject(AuthService); data = inject(DataService);
  isSuper = this.auth.hasAnyRole(['super']);
  users: User[] = this.auth.allUsers();
  groups: Group[] = this.data.groups();
  reports: Report[] = this.data.reports();

  userSel = '';
  ok=''; error='';
  newGroupName = '';
  groupSel = '';
  newChannelName = '';
  channelSel = '';
  pendingSel = '';
  addUserSel = '';
  removeUserSel = '';
  banUserSel = '';
  banChannelSel = '';
  banReason = '';
  ok2=''; error2='';

  manageableGroups() {
    const me = this.auth.currentUser();
    if (!me) return [];
    if (this.isSuper) return this.groups;
    return this.groups.filter(g => g.admins.includes(me.username));
  }
  currentGroup(){ 
    console.log(this.groups ,this.groupSel)
    return this.groups.find(g => g.id === this.groupSel) || null; }
  canDeleteCurrent(){ const g = this.currentGroup(); if (!g) return false; if (this.isSuper) return true; const me=this.auth.currentUser(); return !!me && g.owner === me.username; }

  adminsText(){ return (this.currentGroup()?.admins || []).join(', '); }
  membersText(){ return (this.currentGroup()?.members || []).join(', '); }
  pendingText(){ return (this.currentGroup()?.pending || []).join(', '); }

  promote() {
    const r = this.data.promoteToGroupAdmin(this.userSel);
    if (r.ok) { this.ok = 'Promoted to group-admin'; this.error=''; this.users = this.auth.allUsers(); }
    else { this.error = r.message || 'Error'; this.ok=''; }
  }
  upgrade() {
    const r = this.data.upgradeToSuper(this.userSel);
    if (r.ok) { this.ok = 'User upgraded to super'; this.error=''; this.users = this.auth.allUsers(); }
    else { this.error = r.message || 'Error'; this.ok=''; }
  }
  deleteUser() {
    const r = this.data.deleteUserGlobal(this.userSel);
    if (r.ok) { this.ok = 'User deleted'; this.error=''; this.users = this.auth.allUsers(); this.groups = this.data.groups(); }
    else { this.error = r.message || 'Error'; this.ok=''; }
  }

  createGroup() {
    const r = this.data.createGroup((this.newGroupName||'').trim());
    if (r.ok) { this.ok2='Group created'; this.error2=''; this.groups=this.data.groups(); this.newGroupName=''; }
    else { this.error2=r.message||'Error'; this.ok2=''; }
  }
  deleteGroup() {
    const r = this.data.deleteGroup(this.groupSel);
    if (r.ok) { this.ok2='Group deleted'; this.error2=''; this.groups=this.data.groups(); this.groupSel=''; }
    else { this.error2=r.message||'Error'; this.ok2=''; }
  }
  addChannel() {
    const r = this.data.addChannel(this.groupSel,(this.newChannelName||'').trim());
    if (r.ok) { this.ok2='Channel added'; this.error2=''; this.groups=this.data.groups(); this.newChannelName=''; }
    else { this.error2=r.message||'Error'; this.ok2=''; }
  }
  deleteChannel() {
    const r = this.data.deleteChannel(this.groupSel,this.channelSel);
    if (r.ok) { this.ok2='Channel deleted'; this.error2=''; this.groups=this.data.groups(); this.channelSel=''; }
    else { this.error2=r.message||'Error'; this.ok2=''; }
  }
  approve() {
    const r = this.data.approveJoin(this.groupSel,this.pendingSel);
    if (r.ok) { this.ok2='Approved'; this.error2=''; this.groups=this.data.groups(); this.pendingSel=''; }
    else { this.error2=r.message||'Error'; this.ok2=''; }
  }
  addUserToGroup() {
    const r = this.data.addUserToGroup(this.groupSel,this.addUserSel);
    if (r.ok) { this.ok2='User added'; this.error2=''; this.groups=this.data.groups(); this.addUserSel=''; }
    else { this.error2=r.message||'Error'; this.ok2=''; }
  }
  removeUserFromGroup() {
    const r = this.data.removeUserFromGroup(this.groupSel,this.removeUserSel);
    if (r.ok) { this.ok2='User removed'; this.error2=''; this.groups=this.data.groups(); this.removeUserSel=''; }
    else { this.error2=r.message||'Error'; this.ok2=''; }
  }
  ban() {
    const r = this.data.banUser(this.groupSel,this.banChannelSel,this.banUserSel,(this.banReason||'').trim());
    if (r.ok) { this.ok2='User banned and reported'; this.error2=''; this.groups=this.data.groups(); this.reports=this.data.reports(); }
    else { this.error2=r.message||'Error'; this.ok2=''; }
  }
  unban() {
    const r = this.data.unbanUser(this.groupSel,this.banChannelSel,this.banUserSel);
    if (r.ok) { this.ok2='User unbanned'; this.error2=''; this.groups=this.data.groups(); }
    else { this.error2=r.message||'Error'; this.ok2=''; }
  }

  groupName(id: string){ return this.groups.find(g=>g.id===id)?.name || id; }
  channelName(gid: string, cid: string){ const g=this.groups.find(x=>x.id===gid); return g?.channels.find(c=>c.id===cid)?.name || cid; }
  fmt(ts: number){ const d=new Date(ts); return d.toLocaleString(); }
}
