# Git Repository Organization & Workflow

Layout
- client/  Angular app
- server/  Node/Express dev server
- docs/    Architecture, Data Model, Server API, Workflow
- README.md  run steps + checklist
- .gitignore  excludes node_modules, builds

Branching
- main  stable releases
- dev   integration branch
- feature/<name>  small scoped branches (auth, groups, channels, chat, admin, styles, docs)

Typical flow
- git checkout -b feature/<name> dev
- commit early and often
- open PR to dev
- merge after review
- periodically fast-forward main from dev and tag

Update frequency
- multiple commits per day during active development

Client ↔ Server
- Phase 1: client persists to LocalStorage via DataService
- Phase 2: DataService switches to REST in SERVER_API.md with same payloads
