# Architecture

## Overview
Phase 1 is a role-based chat UI with Groups → Channels → Messages using Angular (standalone components). A minimal Node/Express server is included for a health check. All app data (users, groups, channels, join requests, bans, messages, session) is stored in browser LocalStorage for Phase 1. Phase 2 will replace LocalStorage with MongoDB and add real-time messaging.

## Angular (Client)
Routes
- /login  login and registration
- /dashboard  groups list, join/leave, set active group/channel
- /chat  chat UI for selected group+channel
- /admin  role-gated admin tools (super and group-admin)

Guards
- auth.guard.ts  blocks unauthenticated users
- role.guard.ts  requires specific roles

Services
- auth.service.ts  login/logout/register, session, seed super, persistence helpers
- data.service.ts  business logic for users, groups, channels, membership, approvals, bans, messages
- storage.service.ts  typed LocalStorage wrapper

Components (standalone)
- app.component.ts  shell and navbar
- pages/login/login.component.ts
- pages/dashboard/dashboard.component.ts
- pages/chat/chat.component.ts
- pages/admin/admin.component.ts
- pages/startup-redirect/startup-redirect.component.ts

Data flow
Component → DataService → (AuthService + StorageService) → LocalStorage
Components call refresh() after actions to read updated state.

## Node/Express (Server)
File
- server/server.js

Purpose in Phase 1
- health check and CORS for dev

Stack
- express, cors, nodemon

Route
- GET /api/health  returns { status: 'ok', time }

Phase 2 plan
- move DataService ops to REST endpoints backed by MongoDB, preserve payload shapes from the client models.
