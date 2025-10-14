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
