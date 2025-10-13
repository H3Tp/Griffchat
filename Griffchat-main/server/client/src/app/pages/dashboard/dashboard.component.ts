import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/data.service';
import { AuthService } from '../../core/auth.service';
import { Group } from '../../models/models';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="grid">
    <div class="card">
      <h3>My Profile</h3>
      <div *ngIf="me">
        <div><b>Username:</b> {{me.username}}</div>
        <div><b>Email:</b> {{me.email}}</div>
        <div><b>Roles:</b> {{me.roles.join(', ')}}</div>
      </div>
      <div class="divider"></div>
      <button class="btn" (click)="deleteSelf()" *ngIf="me?.username !== 'super'">Delete My Account</button>
      <div class="ok" *ngIf="ok">{{ok}}</div><div class="error" *ngIf="error">{{error}}</div>
    </div>

    <div class="card">
      <h3>All Groups</h3>
      <div class="muted sub">Request to join. Admins will approve.</div>
      <ul class="list">
        <li *ngFor="let g of allGroups">
          <div class="row" style="justify-content:space-between">
            <div>
              <b>{{g.name}}</b>
              <div class="sub">Owner: {{g.owner}} • Admins: {{g.admins.join(', ')}}</div>
            </div>
            <div class="row">
              <button class="btn" *ngIf="!isMember(g) && !isPending(g)" (click)="requestJoin(g.id)">Request Join</button>
              <span class="muted" *ngIf="isPending(g) && !isMember(g)">Pending…</span>
              <button class="btn" *ngIf="isMember(g)" (click)="setActive(g.id,null)">Open</button>
              <button class="btn" *ngIf="isMember(g)" (click)="leave(g.id)">Leave</button>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div class="card">
      <h3>My Requests</h3>
      <div class="muted" *ngIf="myPending().length===0">No pending requests.</div>
      <ul class="list compact" *ngIf="myPending().length>0">
        <li *ngFor="let name of myPending()">{{name}}</li>
      </ul>
    </div>

    <div class="card" *ngIf="activeGroup">
      <h3>Active: {{activeGroup.name}}</h3>
      <div class="row">
        <select [(ngModel)]="selectedChannelId" name="cid">
          <option [value]="c.id" *ngFor="let c of activeGroup.channels">{{c.name}}</option>
        </select>
        <a class="btn" routerLink="/chat" (click)="enterChannel()">Go to Chat</a>
      </div>
      <div class="divider"></div>
      <div class="muted">Active Channel: {{activeChannelName() || 'None'}}</div>
    </div>

    <div class="card" *ngIf="canAdmin">
      <h3>Create Group</h3>
      <form (ngSubmit)="createGroup()">
        <label>Group name</label>
        <input [(ngModel)]="groupName" name="gn" placeholder="Team Alpha" required>
        <button class="btn" type="submit">Create</button>
      </form>
      <div class="ok" *ngIf="ok2">{{ok2}}</div><div class="error" *ngIf="error2">{{error2}}</div>
    </div>
  </div>
  `
})
export class DashboardComponent {
  data = inject(DataService); auth = inject(AuthService);
  me = this.auth.currentUser();
  canAdmin = this.auth.hasAnyRole(['super','group-admin']);
  allGroups = this.data.allPublicGroups();
  myGroups = this.data.myGroups();
  activeGroup = this.data.activeGroup();
  selectedChannelId = this.data.activeChannelId();

  groupName = ''; ok=''; error=''; ok2=''; error2='';

  isMember(g: Group){ return !!this.me && g.members.includes(this.me.username); }
  isPending(g: Group){ return !!this.me && g.pending.includes(this.me.username); }
  myPending(){ const me=this.me?.username; if(!me) return []; return this.allGroups.filter(g=>g.pending.includes(me)).map(g=>g.name); }

  setActive(gid: string|null, cid: string|null){ this.data.setActive(gid,cid); this.refresh(); }
  leave(id: string){ const r = this.data.leaveGroup(id); if (r.ok) this.refresh(); else this.error = r.message || 'Error'; }
  requestJoin(id: string){ const r = this.data.requestJoin(id); if (r.ok) this.refresh(); else this.error = r.message || 'Error'; }

  enterChannel(){ if(this.activeGroup && this.selectedChannelId){ this.data.setActive(this.activeGroup.id, this.selectedChannelId); this.refresh(); } }
  activeChannelName(){ if(!this.activeGroup||!this.selectedChannelId) return ''; return this.activeGroup.channels.find(c=>c.id===this.selectedChannelId)?.name || ''; }

  createGroup(){
    const r = this.data.createGroup((this.groupName||'').trim());
    if (r.ok) { this.ok2 = 'Group created'; this.error2=''; this.groupName=''; this.refresh(); }
    else { this.error2 = r.message || 'Error'; this.ok2=''; }
  }

  deleteSelf(){
    const r = this.data.deleteSelf();
    if (r.ok) { this.ok = 'Account deleted. You are logged out.'; this.error=''; }
    else { this.error = r.message || 'Error'; this.ok=''; }
  }

  refresh() {
    this.me = this.auth.currentUser();
    this.allGroups = this.data.allPublicGroups();
    this.myGroups = this.data.myGroups();
    this.activeGroup = this.data.activeGroup();
    this.selectedChannelId = this.data.activeChannelId();
  }
}
