export type Role = 'super' | 'group-admin' | 'user';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  roles: Role[];
  groups: string[];
}

export interface Channel {
  id: string;
  name: string;
  bannedUsers: string[];
}

export interface Group {
  id: string;
  name: string;
  owner: string;
  admins: string[];
  members: string[];
  pending: string[];
  channels: Channel[];
}

export interface Report {
  id: string;
  timestamp: number;
  by: string;
  target: string;
  groupId: string;
  channelId: string;
  reason?: string;
}

export interface Message {
  id: string;
  groupId: string;
  channelId: string;
  by: string;
  text: string;
  ts: number;
}

export interface SessionState {
  user: User | null;
  activeGroupId: string | null;
  activeChannelId: string | null;
}
