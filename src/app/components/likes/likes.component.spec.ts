import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LikesComponent } from './likes.component';
import { BlogPostService } from '../../services/blog-post.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('LikesComponent', () => {
  let component: LikesComponent;
  let fixture: ComponentFixture<LikesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LikesComponent, HttpClientTestingModule], // Se agrega HttpClientTestingModule
      providers: [BlogPostService] // Se proporciona el servicio
    }).compileComponents();

    fixture = TestBed.createComponent(LikesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
