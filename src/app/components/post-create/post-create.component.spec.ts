import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PostCreateComponent } from './post-create.component';
import { BlogPostService } from '../../services/blog-post.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

describe('PostCreateComponent', () => {
  let component: PostCreateComponent;
  let fixture: ComponentFixture<PostCreateComponent>;
  let mockBlogPostService: jasmine.SpyObj<BlogPostService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    mockBlogPostService = jasmine.createSpyObj('BlogPostService', ['createBlogPost']);
    mockBlogPostService.createBlogPost.and.returnValue(of({})); // Simula respuesta exitosa

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, PostCreateComponent], // Agrega soporte para HttpClient y PostCreateComponent
      providers: [
        FormBuilder, // Necesario para inicializar el formulario
        { provide: BlogPostService, useValue: mockBlogPostService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ],
      // imports: [PostCreateComponent] // Eliminado porque ya está incluido en la línea anterior
    }).compileComponents();

    fixture = TestBed.createComponent(PostCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
