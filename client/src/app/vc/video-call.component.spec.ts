import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoCallComponent } from './video-call.component';
import { FormsModule } from '@angular/forms';
import Peer from 'peerjs';

describe('VideoCallComponent', () => {
  let component: VideoCallComponent;
  let fixture: ComponentFixture<VideoCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, VideoCallComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(VideoCallComponent);
    component = fixture.componentInstance;

    // Mock video elements
    component['localVideo'] = { nativeElement: { srcObject: null } } as any;
    component['remoteVideo'] = { nativeElement: { srcObject: null } } as any;
  });

  beforeEach(() => {
    // Mock getUserMedia
    const mockStream = {
      getAudioTracks: () => [{ enabled: true }],
      getVideoTracks: () => [{ enabled: true }]
    } as unknown as MediaStream;
    spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(Promise.resolve(mockStream));

    // Mock PeerJS
    spyOn(Peer.prototype, 'on').and.callFake(function (this: Peer, event: string, cb: any) {
      if (event === 'open') cb('mock-peer-id');
      return this;
    });

    spyOn(Peer.prototype, 'call').and.callFake(() => ({
      on: (event: string, cb: any) => {
        if (event === 'stream') cb({} as MediaStream);
      },
      close: jasmine.createSpy('close')
    } as any));
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize peer and set peerId', async () => {
    await component.ngOnInit();
    expect(component.peerId).toBe('mock-peer-id');
    expect(component['localStream']).toBeDefined();
  });

  it('should toggle mute correctly', async () => {
    await component.ngOnInit();
    component.toggleMute();
    expect(component.isMuted).toBeTrue();
    component.toggleMute();
    expect(component.isMuted).toBeFalse();
  });

  it('should toggle video correctly', async () => {
    await component.ngOnInit();
    component.toggleVideo();
    expect(component.isVideoOff).toBeTrue();
    component.toggleVideo();
    expect(component.isVideoOff).toBeFalse();
  });

  it('should start a call successfully', async () => {
    await component.ngOnInit();
    component.remotePeerId = 'remote123';
    component.startCall();
    expect(Peer.prototype.call).toHaveBeenCalled();
  });

});
