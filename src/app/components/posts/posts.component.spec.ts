import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostsComponent } from './posts.component';
import { BlogPostService } from '../../services/blog-post.service';
import { GeneralServiceService } from '../../services/general-service.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BlogPost } from '../../models/blog';

describe('PostsComponent', () => {
  let component: PostsComponent;
  let fixture: ComponentFixture<PostsComponent>;
  let mockBlogPostService: jasmine.SpyObj<BlogPostService>;
  let mockGeneralService: jasmine.SpyObj<GeneralServiceService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockBlogPostService = jasmine.createSpyObj('BlogPostService', ['getBlogPosts', 'isAuthenticated']);
    mockGeneralService = jasmine.createSpyObj('GeneralServiceService', ['getUserName']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [PostsComponent],
      providers: [
        { provide: BlogPostService, useValue: mockBlogPostService },
        { provide: GeneralServiceService, useValue: mockGeneralService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PostsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
