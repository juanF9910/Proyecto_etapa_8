import { Component } from '@angular/core';
import { CommentsComponent } from './../comments/comments.component';
import { CommonModule } from '@angular/common';
import { BlogPostService } from '../../services/blog-post.service';
import { BlogPost } from '../../models/blog';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-post-detail',
  imports: [CommonModule, CommentsComponent],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent {
  post: BlogPost | null = null;
  postId: number = 0;
  isAuthenticated: boolean = false;
  canEdit: boolean = false; // ✅ Nueva variable para almacenar el permiso de edición

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

      this.isAuthenticated = this.blogPostService.isAuthenticated();
      this.postId = Number(id);

      // ✅ Verificar el permiso de edición cuando se carga el post
      this.checkEditPermission();
    });

    this.getPostDetail(this.postId);
  }

  getPostDetail(postId: number): void {
    if (postId !== null) {
      this.blogPostService.getDetailPost(postId).subscribe((post: BlogPost) => {
        this.post = post;
      });
    } else {
      console.error('Post ID is null');
    }
  }

  checkEditPermission(): void {
    this.editpermission(this.postId).subscribe(
      (hasPermission) => {
        this.canEdit = hasPermission;
      },
      (error) => {
        console.error('Error verificando permisos de edición:', error);
        this.canEdit = false;
      }
    );
  }

  editpermission(postId: number): Observable<boolean> {
    return this.blogPostService.editBlogPost(postId, {}).pipe(
      map(() => true),  // Si el backend no lanza error, retorna true
      catchError(error => {
        console.error('Error al verificar permisos:', error);
        return of(false); // En caso de error, retorna false
      })
    );
  }

  navigateToEditPost(postId: number): void {
    this.router.navigate([`/posts/${postId}/edit`]);
  }
}
