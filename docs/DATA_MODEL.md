# Data Model (Phase 1 – LocalStorage)

LocalStorage keys
- users: User[]
- groups: Group[]
- reports: Report[]  ban reports for Super
- session: SessionState
- messages: Message[]  per group+channel

TypeScript interfaces
Role = 'super' | 'group-admin' | 'user'

User {
  id: string
  username: string
  email: string
  password: string
  roles: Role[]
  groups: string[]
}

Channel {
  id: string
  name: string
  bannedUsers: string[]
}

Group {
  id: string
  name: string
  owner: string
  admins: string[]
  members: string[]
  pending: string[]
  channels: Channel[]
}

Report {
  id: string
  timestamp: number
  by: string
  target: string
  groupId: string
  channelId: string
  reason?: string
}

Message {
  id: string
  groupId: string
  channelId: string
  by: string
  text: string
  ts: number
}

SessionState {
  user: User | null
  activeGroupId: string | null
  activeChannelId: string | null
}

Role rules (enforced in data.service.ts)
- Super: promote to group-admin, upgrade to super, delete any user, delete any group, all group-admin powers
- Group Admin: create/delete own groups, create/delete channels, approve/add/remove members, ban/unban per-channel
- User: register/login/logout, request to join, leave groups, delete self, chat in groups they belong to
