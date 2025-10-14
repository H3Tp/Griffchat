import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    // Create mock AuthService
    mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'register']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, CommonModule, FormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // --- ✅ BASIC TESTS ---

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render login and register forms', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('form')).toBeTruthy();
    expect(compiled.querySelectorAll('input').length).toBeGreaterThan(0);
  });

  // --- ✅ LOGIN TESTS ---

  it('should call AuthService.login() when doLogin() is triggered', () => {
    mockAuthService.login.and.returnValue({ ok: true });

    component.lu = 'testUser';
    component.lp = 'password';
    component.doLogin();

    expect(mockAuthService.login).toHaveBeenCalledWith('testUser', 'password');
    expect(component.loginError).toBe('');
  });

  it('should show login error when AuthService.login() fails', () => {
    mockAuthService.login.and.returnValue({ ok: false, message: 'Invalid credentials' });

    component.lu = 'wrong';
    component.lp = 'badpass';
    component.doLogin();

    expect(component.loginError).toBe('Invalid credentials');
  });

  // --- ✅ REGISTER TESTS ---

  it('should call AuthService.register() when doRegister() is triggered', () => {
    mockAuthService.register.and.returnValue({ ok: true });

    component.ru = 'newUser';
    component.re = 'new@user.com';
    component.rp = '12345';
    component.doRegister();

    expect(mockAuthService.register).toHaveBeenCalledWith('newUser', 'new@user.com', '12345');
    expect(component.regOk).toContain('Registered');
    expect(component.regError).toBe('');
  });

  it('should show registration error when AuthService.register() fails', () => {
    mockAuthService.register.and.returnValue({ ok: false, message: 'Username taken' });

    component.ru = 'existingUser';
    component.re = 'exist@user.com';
    component.rp = '12345';
    component.doRegister();

    expect(component.regError).toBe('Username taken');
    expect(component.regOk).toBe('');
  });
});
