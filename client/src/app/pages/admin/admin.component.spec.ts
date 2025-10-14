import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminComponent } from './admin.component';
import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/data.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Role } from '../../models/models';

// Mock data
const mockUser = {
  id: 'u1',
  username: 'admin',
  email: 'admin@example.com',
  password: '123',
  roles: ['super'] as Role[],  
  groups: []
};
const mockSuperUser = { username: 'super', email: 's@a.com', roles: ['super'] };
const mockGroup = {
  id: 'g1',
  name: 'Group1',
  owner: 'admin',
  admins: ['admin'],
  members: ['user1'],
  pending: [],
  channels: [{ id: 'c1', name: 'general', bannedUsers: [] }]
};


describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let dataServiceSpy: jasmine.SpyObj<DataService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'hasAnyRole',
      'allUsers',
      'currentUser'
    ]);

    dataServiceSpy = jasmine.createSpyObj('DataService', [
      'groups',
      'reports',
      'promoteToGroupAdmin',
      'upgradeToSuper',
      'deleteUserGlobal',
      'createGroup',
      'deleteGroup',
      'addChannel',
      'deleteChannel',
      'approveJoin',
      'addUserToGroup',
      'removeUserFromGroup',
      'banUser',
      'unbanUser'
    ]);

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, AdminComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: DataService, useValue: dataServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
  });

  it('should create the AdminComponent', () => {
    expect(component).toBeTruthy();
  });


  it('should promote a user successfully', () => {
    dataServiceSpy.promoteToGroupAdmin.and.returnValue({ ok: true });
    authServiceSpy.allUsers.and.returnValue([mockUser]);

    component.userSel = 'alice';
    component.promote();

    expect(component.ok).toContain('Promoted');
    expect(component.error).toBe('');
  });

  it('should handle failed promotion', () => {
    dataServiceSpy.promoteToGroupAdmin.and.returnValue({ ok: false, message: 'Error' });

    component.userSel = 'bob';
    component.promote();

    expect(component.error).toBe('Error');
    expect(component.ok).toBe('');
  });


  it('should filter manageable groups for normal admin', () => {
    component.isSuper = false;
    authServiceSpy.currentUser.and.returnValue(mockUser);
    component.groups = [mockGroup];
    const res = component.manageableGroups();
    expect(res.length).toBe(1);
  });

  it('should create group successfully', () => {
    dataServiceSpy.createGroup.and.returnValue({ ok: true, group: mockGroup });
    dataServiceSpy.groups.and.returnValue([mockGroup]);
    component.newGroupName = 'New Group';
    component.createGroup();
    expect(component.ok2).toContain('Group created');
  });

  it('should handle group creation failure', () => {
    dataServiceSpy.createGroup.and.returnValue({ ok: false, message: 'Duplicate name' });
    component.newGroupName = 'Duplicate';
    component.createGroup();
    expect(component.error2).toBe('Duplicate name');
  });

  it('should delete group successfully', () => {
    dataServiceSpy.deleteGroup.and.returnValue({ ok: true });
    dataServiceSpy.groups.and.returnValue([]);
    component.groupSel = 'g1';
    component.deleteGroup();
    expect(component.ok2).toContain('Group deleted');
  });

  it('should ban and unban user successfully', () => {
    dataServiceSpy.banUser.and.returnValue({ ok: true });
    dataServiceSpy.unbanUser.and.returnValue({ ok: true });
    dataServiceSpy.groups.and.returnValue([mockGroup]);
    dataServiceSpy.reports.and.returnValue([]);

    component.groupSel = 'g1';
    component.banUserSel = 'alice';
    component.banChannelSel = 'c1';
    component.ban();

    expect(component.ok2).toContain('User banned');
    component.unban();
    expect(component.ok2).toContain('User unbanned');
  });
});
