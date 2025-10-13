# PeerJS + Angular 20 Video Call Example

This repo contains a minimal, working example to run a **one-to-one video call** using **PeerJS (self-hosted PeerServer)** with a Node.js + Express backend and an Angular 20 frontend. The PeerServer handles signaling only; media is peer-to-peer.

---

## Repo layout (logical)

```
peerjs-angular-video-call/
├─ backend/
│  ├─ package.json
│  ├─ server.js
│  └─ README.md
└─ frontend/
   ├─ README.md
   └─ src/
      └─ app/
         ├─ app.module.ts
         ├─ app.component.ts
         ├─ app.component.html
         └─ video-call/
            ├─ video-call.component.ts
            ├─ video-call.component.html
            └─ video-call.component.css
```

---

# Backend (Node.js + Express with ExpressPeerServer)

## backend/package.json

```json
{
  "name": "peerjs-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "http": "^0.0.1-security",
    "peer": "^0.6.1"
  }
}
```

> NOTE: `peer` package supplies `ExpressPeerServer` and client Peer code. In some environments people install `peerjs` for the client; we will use `peer` server package on backend and `peer` client package on frontend via npm.

## backend/server.js

```js
// server.js
const express = require('express');
const http = require('http');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

// PeerServer options
const peerServerOptions = {
  debug: true,
  path: '/peerjs',
  allow_discovery: true // optional: enables peer discovery on the server (use with caution)
};

// Attach PeerServer to our http server at /peerjs
const peerServer = ExpressPeerServer(server, peerServerOptions);
app.use('/peerjs', peerServer);

// Basic route
app.get('/', (req, res) => {
  res.send('PeerJS signaling server is running. PeerServer path: /peerjs');
});

// Optional logging handlers
peerServer.on('connection', (client) => {
  console.log('Peer connected:', client.id);
});
peerServer.on('disconnect', (client) => {
  console.log('Peer disconnected:', client.id);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
```

## backend/README.md

```
cd backend
npm install
npm start

// backend will listen on http://localhost:3000 and PeerServer at http://localhost:3000/peerjs
```

---

# Frontend (Angular 20) — scaffold instructions and key files

> We'll provide minimal Angular code for the video-call component. Use `ng new` to scaffold an app and then replace/add the indicated files.

## Frontend scaffold commands (run in separate terminal)

```bash
# If you don't have Angular CLI installed
npm i -g @angular/cli

# create workspace (choose routing: no, stylesheet: css)
ng new peerjs-video-angular --routing=false --style=css
cd peerjs-video-angular

# install peer client
npm install peer

# generate component
ng generate component video-call
```

Place the files below into the generated project.

## src/app/app.module.ts

```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { VideoCallComponent } from './video-call/video-call.component';

@NgModule({
  declarations: [
    AppComponent,
    VideoCallComponent
  ],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## src/app/app.component.html

```html
<!-- simple router-less app that shows the video call component -->
<app-video-call></app-video-call>
```

## src/app/video-call/video-call.component.ts

```ts
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import Peer from 'peer';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.css']
})
export class VideoCallComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo', { static: true }) localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', { static: true }) remoteVideo!: ElementRef<HTMLVideoElement>;

  peer!: any; // Peer instance
  localStream!: MediaStream;
  myPeerId: string = '';

  // configure these to match your backend PeerServer
  peerOptions = {
    host: 'localhost',
    port: 3000,
    path: '/peerjs',
    secure: false,
    // If you need to pass custom config (stun/turn) use 'config' prop
    // example: config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
  };

  async ngOnInit() {
    await this.initLocalStream();
    this.createPeer();
  }

  ngOnDestroy(): void {
    try {
      if (this.peer && this.peer.destroy) this.peer.destroy();
      if (this.localStream) this.localStream.getTracks().forEach(t => t.stop());
    } catch (err) {
      console.warn('Cleanup error', err);
    }
  }

  async initLocalStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.localVideo.nativeElement.srcObject = this.localStream;
      this.localVideo.nativeElement.muted = true;
      await this.localVideo.nativeElement.play();
    } catch (err) {
      console.error('Could not get local media:', err);
      alert('Please allow camera and microphone access.');
    }
  }

  createPeer() {
    // create a Peer instance; `Peer` default constructor accepts id and options, but we pass undefined id to let server assign
    this.peer = new Peer(undefined, this.peerOptions);

    this.peer.on('open', (id: string) => {
      console.log('Peer open with ID:', id);
      this.myPeerId = id;
    });

    // Handle incoming calls
    this.peer.on('call', (call: any) => {
      console.log('Incoming call from', call.peer);
      // Answer with local stream
      call.answer(this.localStream);
      call.on('stream', (remoteStream: MediaStream) => {
        this.remoteVideo.nativeElement.srcObject = remoteStream;
        this.remoteVideo.nativeElement.play().catch(e => console.warn(e));
      });
    });

    this.peer.on('error', (err: any) => {
      console.error('Peer error', err);
    });
  }

  callPeerById(remoteId: string) {
    if (!remoteId) return alert('Enter remote peer ID');
    if (!this.localStream) return alert('Local stream not ready');
    const call = this.peer.call(remoteId, this.localStream);
    call.on('stream', (remoteStream: MediaStream) => {
      this.remoteVideo.nativeElement.srcObject = remoteStream;
      this.remoteVideo.nativeElement.play().catch(e => console.warn(e));
    });
    call.on('close', () => console.log('Call closed'));
    call.on('error', (err: any) => console.error('Call error', err));
  }

  copyMyId() {
    navigator.clipboard.writeText(this.myPeerId).then(() => alert('Copied your Peer ID'));
  }
}
```

## src/app/video-call/video-call.component.html

```html
<div class="container">
  <div class="controls">
    <div>
      <label>Your Peer ID (share with caller):</label>
      <input [value]="myPeerId" readonly />
      <button (click)="copyMyId()">Copy</button>
    </div>

    <div>
      <label>Call remote peer by ID:</label>
      <input #remoteIdInput placeholder="Enter remote peer ID" />
      <button (click)="callPeerById(remoteIdInput.value)">Call</button>
    </div>
  </div>

  <div class="videos">
    <div class="video-box">
      <h4>Local</h4>
      <video #localVideo autoplay muted playsinline></video>
    </div>
    <div class="video-box">
      <h4>Remote</h4>
      <video #remoteVideo autoplay playsinline></video>
    </div>
  </div>
</div>
```

## src/app/video-call/video-call.component.css

```css
.container {
  max-width: 900px;
  margin: 16px auto;
  padding: 12px;
  font-family: system-ui, Arial, sans-serif;
}
.controls { display:flex; gap: 20px; flex-wrap:wrap; margin-bottom:16px }
.controls label { display:block; font-size:12px; margin-bottom:6px }
.controls input { padding:6px; min-width:220px }
.videos { display:flex; gap:16px }
.video-box { flex:1; text-align:center }
video { width:100%; height:auto; background:#000; border-radius:8px }
```

---

# How to run locally (end-to-end)

1. Start backend (PeerServer):

```bash
cd backend
npm install
npm start
# Server listens at http://localhost:3000 and PeerServer at http://localhost:3000/peerjs
```

2. Start Angular frontend:

```bash
cd frontend/peerjs-video-angular
npm install
ng serve --host 0.0.0.0 --port 4200
# Open two browser tabs at http://localhost:4200
```

3. In tab A: copy the Peer ID shown and paste it into the "Call remote peer by ID" input in tab B and press "Call". The video streams should connect P2P.

---

# Production notes / next steps

- Use HTTPS (enable secure: true and serve via HTTPS) — required for getUserMedia on many browsers and mandatory for real deployments.
- Configure TURN servers for NAT traversal. You can pass `config: { iceServers: [...] }` inside `peerOptions` when constructing Peer.
- Add authentication: ensure only authorized clients can create peers or call others. Use middleware on Express before mounting PeerServer.
- For group calls, you can either use a mesh (each peer connects to each other) or set up an SFU (e.g., Janus, Jitsi, mediasoup).

---

If you want, I can also:
- produce a ready-to-run GitHub repo zip with these files arranged exactly as shown (I can paste the full file contents into the canvas), or
- add TURN server instructions and example config,
- or convert the frontend to use Angular signal/service pattern and UI improvements.

Tell me which next step you want and I'll extend the example accordingly.


.video-call-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.videos {
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;
}

.video-box {
  text-align: center;
}

video {
  width: 300px;
  height: 200px;
  margin: 10px;
  border: 1px solid black;
}
