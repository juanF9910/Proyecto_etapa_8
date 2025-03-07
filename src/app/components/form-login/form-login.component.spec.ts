import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormLoginComponent } from './form-login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { GeneralServiceService } from '../../services/general-service.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('FormLoginComponent', () => {
  let component: FormLoginComponent;
  let fixture: ComponentFixture<FormLoginComponent>;
  let mockGeneralService: jasmine.SpyObj<GeneralServiceService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockGeneralService = jasmine.createSpyObj('GeneralServiceService', ['login']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientModule,
        FormLoginComponent
      ],
      providers: [
        { provide: GeneralServiceService, useValue: mockGeneralService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });


});
