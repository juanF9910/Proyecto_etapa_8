import { Component } from '@angular/core';
import { CommentsComponent } from './../comments/comments.component';
import { CommonModule } from '@angular/common';
import { BlogPostService } from '../../services/blog-post.service';
import { BlogPost } from '../../models/blog';

@Component({
  selector: 'app-post-detail',
  imports: [CommonModule, CommentsComponent],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent {
  post: BlogPost | null = null;
  postId: number | null = null;

  constructor(private blogPostService: BlogPostService) {}

  ngOnInit(): void {
    this.getPostDetail();
  }

  getPostDetail(): void {
    this.postId = this.blogPostService.getPostIdFromUrl();
    if (this.postId !== null) {
      this.blogPostService.getDetailPost(this.postId).subscribe((post: BlogPost) => {
        this.post = post;
      });
    } else {
      console.error('Post ID is null');
    }
  }
}
