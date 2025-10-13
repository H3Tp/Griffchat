# Server API

Phase 1 (implemented)
GET /api/health
- Response: { status: 'ok', time: <ISO> }

Phase 2 plan (mapping)
Auth
- POST /api/auth/register { username, email, password } → { ok, message? }
- POST /api/auth/login { username, password } → { ok, user, session }
- POST /api/auth/logout → { ok }

Users (Super)
- GET /api/users → User[]
- POST /api/users/:username/promote → { ok }
- POST /api/users/:username/upgrade → { ok }
- DELETE /api/users/:username → { ok }
- DELETE /api/users/me → { ok }

Groups
- GET /api/groups → Group[]
- POST /api/groups { name } → { ok, group }
- DELETE /api/groups/:groupId → { ok }
- POST /api/groups/:groupId/join-requests → { ok }
- POST /api/groups/:groupId/approve { username } → { ok }
- POST /api/groups/:groupId/members { username } → { ok }
- DELETE /api/groups/:groupId/members/:username → { ok }

Channels
- POST /api/groups/:groupId/channels { name } → { ok }
- DELETE /api/groups/:groupId/channels/:channelId → { ok }
- POST /api/groups/:groupId/channels/:channelId/ban { username, reason? } → { ok }
- DELETE /api/groups/:groupId/channels/:channelId/ban/:username → { ok }

Messages
- GET /api/groups/:groupId/channels/:channelId/messages → Message[]
- POST /api/groups/:groupId/channels/:channelId/messages { text } → { ok, message }

Reports (Super)
- GET /api/reports → Report[]
