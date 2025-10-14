import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatComponent } from './chat.component';
import { DataService } from '../../core/data.service';
import { AuthService } from '../../core/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Group, Message } from '../../models/models';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let dataServiceSpy: jasmine.SpyObj<DataService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockMessages: Message[] = [
    { id: 'm1', groupId: 'g1', channelId: 'c1', by: 'Alice', text: 'Hi', ts: Date.now() },
    { id: 'm2', groupId: 'g1', channelId: 'c1', by: 'Bob', text: 'Hello', ts: Date.now() }
  ];

  const mockGroup: Group = {
    id: 'g1',
    name: 'Group1',
    owner: 'Alice',
    admins: ['Alice'],
    members: ['Alice', 'Bob'],
    pending: [],
    channels: [{ id: 'c1', name: 'general', bannedUsers: [] }]
  };

  beforeEach(async () => {
    dataServiceSpy = jasmine.createSpyObj('DataService', [
      'myGroups',
      'activeGroup',
      'activeChannelId',
      'listMessages',
      'sendMessage',
      'setActive'
    ]);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);

    // Default mock values
    dataServiceSpy.myGroups.and.returnValue([mockGroup]);
    dataServiceSpy.activeGroup.and.returnValue(mockGroup);
    dataServiceSpy.activeChannelId.and.returnValue('c1');
    dataServiceSpy.listMessages.and.returnValue(mockMessages);
    authServiceSpy.isLoggedIn.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, ChatComponent],
      providers: [
        { provide: DataService, useValue: dataServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
  });

  // ✅ 1. Component creation
  it('should create ChatComponent', () => {
    expect(component).toBeTruthy();
  });

  // ✅ 2. should initialize with groups and messages
  it('should initialize with groups and messages', () => {
    component.ngOnInit();
    expect(component.myGroups.length).toBe(1);
    expect(component.groupId).toBe('g1');
    expect(component.channelId).toBe('c1');
    expect(component.messages.length).toBe(2);
  });

  // ✅ 3. should change group and load first channel messages
  it('should change group and load messages on group change', () => {
    component.ngOnInit();
    component.groupId = 'g1';
    component.onGroupChange();
    expect(dataServiceSpy.listMessages).toHaveBeenCalledWith('g1', 'c1');
  });

  // ✅ 4. should call setActive() in DataService
  it('should set active group and channel', () => {
    component.groupId = 'g1';
    component.channelId = 'c1';
    component.setActive();
    expect(dataServiceSpy.setActive).toHaveBeenCalledWith('g1', 'c1');
  });

  // ✅ 5. should load messages properly
  it('should load messages using DataService', () => {
    component.groupId = 'g1';
    component.channelId = 'c1';
    component.loadMessages();
    expect(component.messages.length).toBe(2);
  });

  // ✅ 6. should send a message successfully
  it('should send message successfully', () => {
    dataServiceSpy.sendMessage.and.returnValue({ ok: true });
    component.groupId = 'g1';
    component.channelId = 'c1';
    component.text = 'Hello!';
    component.send();
    expect(dataServiceSpy.sendMessage).toHaveBeenCalledWith('g1', 'c1', 'Hello!');
    expect(component.error).toBe('');
  });

  // ✅ 7. should handle send message error
  it('should handle failed message send', () => {
    dataServiceSpy.sendMessage.and.returnValue({ ok: false, message: 'Error' });
    component.groupId = 'g1';
    component.channelId = 'c1';
    component.text = 'Bad msg';
    component.send();
    expect(component.error).toBe('Error');
  });

  // ✅ 8. should not send empty message
  it('should not send empty message', () => {
    component.text = '   ';
    component.send();
    expect(dataServiceSpy.sendMessage).not.toHaveBeenCalled();
  });

  // ✅ 9. should format timestamps correctly
  it('should format timestamp into readable string', () => {
    const formatted = component.fmt(Date.now());
    expect(typeof formatted).toBe('string');
  });

  // ✅ 10. should detect unauthenticated state
  it('should return true for noAuth if user is not logged in', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    expect(component.noAuth()).toBeTrue();
  });
});
