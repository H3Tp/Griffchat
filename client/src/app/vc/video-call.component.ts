// import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
// import Peer from 'peerjs';

// @Component({
//   selector: 'app-video-call',
//   templateUrl: './video-call.component.html',
//   styleUrls: ['./video-call.component.css']
// })
// export class VideoCallComponent implements OnInit, OnDestroy {
//   @ViewChild('localVideo', { static: true }) localVideo!: ElementRef<HTMLVideoElement>;
//   @ViewChild('remoteVideo', { static: true }) remoteVideo!: ElementRef<HTMLVideoElement>;

//   peer!: any; // Peer instance
//   localStream!: MediaStream;
//   myPeerId: string = '';

//   // configure these to match your backend PeerServer
//   peerOptions = {
//     host: 'localhost',
//     port: 3000,
//     path: '/peerjs',
//     secure: false,
//     // If you need to pass custom config (stun/turn) use 'config' prop
//     // example: config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
//   };

//   async ngOnInit() {
//     await this.initLocalStream();
//     this.createPeer();
//   }

//   ngOnDestroy(): void {
//     try {
//       if (this.peer && this.peer.destroy) this.peer.destroy();
//       if (this.localStream) this.localStream.getTracks().forEach(t => t.stop());
//     } catch (err) {
//       console.warn('Cleanup error', err);
//     }
//   }

//   async initLocalStream() {
//     try {
//       this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//       this.localVideo.nativeElement.srcObject = this.localStream;
//       this.localVideo.nativeElement.muted = true;
//       await this.localVideo.nativeElement.play();
//     } catch (err) {
//       console.error('Could not get local media:', err);
//       alert('Please allow camera and microphone access.');
//     }
//   }

//   createPeer() {
//     // create a Peer instance; `Peer` default constructor accepts id and options, but we pass undefined id to let server assign
//     this.peer = new Peer(this.peerOptions);

//     this.peer.on('open', (id: string) => {
//       console.log('Peer open with ID:', id);
//       this.myPeerId = id;
//     });

//     // Handle incoming calls
//     this.peer.on('call', (call: any) => {
//       console.log('Incoming call from', call.peer);
//       // Answer with local stream
//       call.answer(this.localStream);
//       call.on('stream', (remoteStream: MediaStream) => {
//         this.remoteVideo.nativeElement.srcObject = remoteStream;
//         this.remoteVideo.nativeElement.play().catch(e => console.warn(e));
//       });
//     });

//     this.peer.on('error', (err: any) => {
//       console.error('Peer error', err);
//     });
//   }
// copyMyId() {
//   if (this.peer && this.peer.id) {
//     navigator.clipboard.writeText(this.peer.id);
//     alert('Peer ID copied: ' + this.peer.id);
//   } else {
//     alert('Peer ID not ready yet.');
//   }
// }
// callPeer(remotePeerId: string) {
//   const call = this.peer.call(remotePeerId, this.localStream);
//   call.on('stream', (remoteStream : any) => {
//     this.remoteVideo.nativeElement.srcObject = remoteStream;
//     this.remoteVideo.nativeElement.play();
//   });
// }

//   callPeerById(remoteId: string) {
//     if (!remoteId) return alert('Enter remote peer ID');
//     if (!this.localStream) return alert('Local stream not ready');
//     const call = this.peer.call(remoteId, this.localStream);
//     call.on('stream', (remoteStream: MediaStream) => {
//       this.remoteVideo.nativeElement.srcObject = remoteStream;
//       this.remoteVideo.nativeElement.play().catch(e => console.warn(e));
//     });
//     call.on('close', () => console.log('Call closed'));
//     call.on('error', (err: any) => console.error('Call error', err));
//   }


// }
// /frontend/src/app/components/video-call/video-call.component.ts

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Peer, { MediaConnection } from 'peerjs';

@Component({
  selector: 'app-video-call',
  imports : [FormsModule],
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.css']
})
export class VideoCallComponent implements OnInit {
  @ViewChild('localVideo') localVideo!: ElementRef;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef;

  private localStream!: MediaStream;
  private peer!: Peer;
  private currentCall?: MediaConnection;

  public peerId: string = '';     // This user's PeerJS ID
  public remotePeerId: string = ''; // Enter the peer ID to call
  public isMuted: boolean = false;
  public isVideoOff: boolean = false;


  async ngOnInit() {
    // Get local media
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.localVideo.nativeElement.srcObject = this.localStream;

    // Create PeerJS instance
    this.peer = new Peer();

    // When connected to PeerJS server
    this.peer.on('open', (id: string) => {
      this.peerId = id;
      console.log('My peer ID is: ' + id);
    });

    // Listen for incoming calls
    this.peer.on('call', (call: MediaConnection) => {
      console.log('Receiving a call...');
      call.answer(this.localStream); // Answer the call with your local stream

      call.on('stream', (remoteStream: MediaStream) => {
        this.remoteVideo.nativeElement.srcObject = remoteStream;
      });

      this.currentCall = call;
    });
  }
  toggleMute() {
  if (!this.localStream) return;

  this.isMuted = !this.isMuted;
  this.localStream.getAudioTracks().forEach(track => {
    track.enabled = !this.isMuted;
  });
}

toggleVideo() {
  if (!this.localStream) return;

  this.isVideoOff = !this.isVideoOff;
  this.localStream.getVideoTracks().forEach(track => {
    track.enabled = !this.isVideoOff;
  });
}


  // Start a call to another peer
  startCall() {
    console.log('[Calling]', this.remotePeerId);

const call = this.peer.call(this.remotePeerId, this.localStream);

call.on('stream', (remoteStream) => {
  console.log('[Received remote stream]');
  this.remoteVideo.nativeElement.srcObject = remoteStream;
});

call.on('error', err => console.error('[Outgoing Call Error]', err));
  }

  endCall() {
    if (this.currentCall) {
      this.currentCall.close();
      this.currentCall = undefined;
    }

    if (this.remoteVideo.nativeElement.srcObject) {
      (this.remoteVideo.nativeElement.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      this.remoteVideo.nativeElement.srcObject = null;
    }
  }
}
