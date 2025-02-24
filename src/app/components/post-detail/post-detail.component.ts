import { Component } from '@angular/core';
import { CommentsComponent } from './../comments/comments.component';
import { CommonModule } from '@angular/common';
import { BlogPostService } from '../../services/blog-post.service';
import { BlogPost } from '../../models/blog';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-post-detail',
  imports: [CommonModule, CommentsComponent],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent {
  post: BlogPost | null = null;
  postId: number = 0;

  constructor(private blogPostService: BlogPostService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      const id = params.get('postId');
      if (!id || isNaN(Number(id))) {
        console.error("Invalid post ID:", id);
        this.router.navigate(['/posts']); // Redirect or show an error message
        return;
      }

      this.postId = Number(id);
    });

    this.getPostDetail(this.postId);
  }

  getPostDetail(postId:number): void {
    //this.postId = this.blogPostService.getPostIdFromUrl();
    if (postId !== null) {
      this.blogPostService.getDetailPost(postId).subscribe((post: BlogPost) => {
        this.post = post;
      });
    } else {
      console.error('Post ID is null');
    }
  }
}
