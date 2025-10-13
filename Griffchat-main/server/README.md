# GriffChat (Phase 1)

## How to run
Terminal A
cd server
npm i
npm run dev

Terminal B
cd client
npm i
npx ng serve --port 4302
Open http://localhost:4302

## Login
Username: super
Password: 123

## Features checklist
- Auth with role-gated UI
- Super: promote to group-admin, upgrade to super, delete any user
- Group Admin: create/delete own groups, create/delete channels, approve/add/remove members, ban/unban per-channel
- Users: register, request to join, leave groups, delete self, chat by group+channel
- Multiple groups and admins, user can be in multiple groups
- Super fallback access if a group admin is deleted
- LocalStorage persistence for Phase 1
- Guards and routing per role
- Messages scoped per group+channel

## Documentation
- docs/ARCHITECTURE.md
- docs/DATA_MODEL.md
- docs/SERVER_API.md
- docs/WORKFLOW.md
