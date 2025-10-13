import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/data.service';
import { AuthService } from '../../core/auth.service';
import { Group, Message } from '../../models/models';

@Component({
  standalone: true,
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="grid">
    <div class="card">
      <h3>Chat</h3>
      <div class="row">
        <select [(ngModel)]="groupId" name="gid" (change)="onGroupChange()">
          <option *ngFor="let g of myGroups" [value]="g.id">{{g.name}}</option>
        </select>
        <select [(ngModel)]="channelId" name="cid" (change)="loadMessages()">
          <option *ngFor="let c of currentGroup()?.channels || []" [value]="c.id">{{c.name}}</option>
        </select>
        <button class="btn" (click)="setActive()">Set Active</button>
      </div>
    </div>

    <div class="card" *ngIf="groupId && channelId">
      <div class="chat-window">
        <div *ngFor="let m of messages" class="msg">
          <div class="meta">
            <b>{{m.by}}</b> • {{fmt(m.ts)}}
          </div>
          <div class="text">{{m.text}}</div>
        </div>
        <div *ngIf="messages.length===0" class="muted">No messages yet.</div>
      </div>

      <form (ngSubmit)="send()">
        <div class="row">
          <input [(ngModel)]="text" name="text" placeholder="Write a message..." required>
          <button class="btn primary" type="submit">Send</button>
        </div>
        <div class="error" *ngIf="error">{{error}}</div>
      </form>
    </div>
  </div>
  `,
  styles: [`
    .chat-window{max-height:50vh; overflow:auto; display:grid; gap:10px; margin-bottom:12px}
    .msg{padding:10px; border-radius:12px; background:#0f1433; border:1px solid #2a2f5c}
    .meta{font-size:12px; color:#8a92b2; margin-bottom:4px}
    .text{white-space:pre-wrap}
  `]
})
export class ChatComponent implements OnInit {
  data = inject(DataService); auth = inject(AuthService);

  myGroups: Group[] = [];
  groupId = '';
  channelId = '';
  messages: Message[] = [];
  text = '';
  error = '';

  ngOnInit() {
    this.myGroups = this.data.myGroups();
    const ag = this.data.activeGroup();
    const ac = this.data.activeChannelId();
    if (ag) { this.groupId = ag.id; }
    if (ac) { this.channelId = ac; }
    if (!this.groupId && this.myGroups[0]) this.groupId = this.myGroups[0].id;
    if (!this.channelId && this.currentGroup()?.channels[0]) this.channelId = this.currentGroup()!.channels[0].id;
    this.loadMessages();
  }

  currentGroup(){ return this.myGroups.find(g => g.id === this.groupId) || null; }

  onGroupChange(){
    const cg = this.currentGroup();
    this.channelId = cg?.channels[0]?.id || '';
    this.loadMessages();
  }

  setActive(){
    this.data.setActive(this.groupId || null, this.channelId || null);
  }

  loadMessages(){
    this.messages = (this.groupId && this.channelId) ? this.data.listMessages(this.groupId, this.channelId) : [];
  }

  send(){
    const t = (this.text || '').trim();
    if (!t) return;
    const r = this.data.sendMessage(this.groupId, this.channelId, t);
    if (r.ok) {
      this.text = '';
      this.error = '';
      this.loadMessages();
    } else {
      this.error = r.message || 'Error';
    }
  }

 noAuth(){ return !this.auth.isLoggedIn(); }
  fmt(ts:number){ const d=new Date(ts); return d.toLocaleString(); }
}
