import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormRegisterComponent } from './form-register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { GeneralServiceService } from '../../services/general-service.service';
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

describe('FormRegisterComponent', () => {
  let component: FormRegisterComponent;
  let fixture: ComponentFixture<FormRegisterComponent>;
  let mockGeneralService: jasmine.SpyObj<GeneralServiceService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  beforeEach(async () => {
    mockGeneralService = jasmine.createSpyObj('GeneralServiceService', ['register']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    mockActivatedRoute = { snapshot: {
      params: {}, url: [], queryParams: {}, fragment: null, data: {}, outlet: '', component: null, routeConfig: null,
      root: {} as ActivatedRouteSnapshot, parent: null, firstChild: null, children: [], pathFromRoot: [], paramMap: new Map() as any, queryParamMap: new Map() as any,
      title: undefined
    } }; // ✅ Mock de ActivatedRoute

    await TestBed.configureTestingModule({
      imports: [FormRegisterComponent, ReactiveFormsModule, HttpClientModule],
      providers: [
        { provide: GeneralServiceService, useValue: mockGeneralService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: ActivatedRoute, useValue: mockActivatedRoute } // ✅ Se agrega el mock de ActivatedRoute
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
