import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditPostComponent } from './edit-post.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BlogPostService } from '../../services/blog-post.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { FormBuilder } from '@angular/forms';

fdescribe('EditPostComponent', () => {
  let component: EditPostComponent;
  let fixture: ComponentFixture<EditPostComponent>;
  let mockBlogPostService: jasmine.SpyObj<BlogPostService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  beforeEach(async () => {
    // Crear espías para los servicios
    mockBlogPostService = jasmine.createSpyObj('BlogPostService', ['editBlogPost']);
    mockBlogPostService.editBlogPost.and.returnValue(of({ success: true }));

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    mockActivatedRoute = {
      params: of({ id: '123' }) // Simula que hay un parámetro de ruta con ID
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule, EditPostComponent],
      providers: [
        FormBuilder, // Necesario para inicializar el formulario
        { provide: BlogPostService, useValue: mockBlogPostService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
