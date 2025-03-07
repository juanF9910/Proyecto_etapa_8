import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostDetailComponent } from './post-detail.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BlogPostService } from '../../services/blog-post.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

fdescribe('PostDetailComponent', () => {
  let component: PostDetailComponent;
  let fixture: ComponentFixture<PostDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, PostDetailComponent],
      providers: [
        BlogPostService,
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: (key: string) => (key === 'postId' ? '1' : null) }) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PostDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
