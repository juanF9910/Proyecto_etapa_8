import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogoutComponent } from './logout.component';
import { GeneralServiceService } from '../../services/general-service.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('LogoutComponent', () => {
  let component: LogoutComponent;
  let fixture: ComponentFixture<LogoutComponent>;
  let mockGeneralService: jasmine.SpyObj<GeneralServiceService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockGeneralService = jasmine.createSpyObj('GeneralServiceService', ['isLoggedIn', 'logout']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockGeneralService.isLoggedIn.and.returnValue(true); // Simula que el usuario está logueado
    mockGeneralService.logout.and.returnValue(of(null)); // Simula que la llamada a logout es exitosa

    await TestBed.configureTestingModule({
      imports: [LogoutComponent],
      providers: [
        { provide: GeneralServiceService, useValue: mockGeneralService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
