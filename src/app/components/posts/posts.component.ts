import { Component, OnInit, Inject, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogPostService } from '../../services/blog-post.service';
import { BlogPost } from '../../models/blog';
import { Router } from '@angular/router';
import { LogoutComponent } from '../logout/logout.component';
import { PLATFORM_ID } from '@angular/core';
import { LikesComponent } from '../likes/likes.component';
import { DeleteComponent } from '../delete/delete.component';
import { GeneralServiceService } from '../../services/general-service.service';
import { catchError, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, LogoutComponent, LikesComponent, DeleteComponent],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})

export class PostsComponent implements OnInit {
  blogPosts: BlogPost[] = [];
  displayedPosts: BlogPost[] = [];
  activePostId: number | null = null;
  username: string = '';
  isAuthenticated: boolean = false;
  showLikes: { [key: number]: boolean } = {};
  authorizationError: boolean = false;
  platformId!: Object;
  editPermissions: { [postId: number]: boolean } = {}; // ✅ Store edit permissions per post


  // Variables de paginación
  currentPage: number = 1;
  pageSize: number = 10; // 10 posts por página
  totalPages: number = 0;

  constructor(
    private blogPostService: BlogPostService,
    private generalService: GeneralServiceService,
    private router: Router,
    private injector: Injector
  ) {}

  ngOnInit(): void {
    this.platformId = this.injector.get(PLATFORM_ID);
    this.getPosts();
    this.isAuthenticated = this.blogPostService.isAuthenticated();
    if (this.isAuthenticated) {
      this.username = this.generalService.getUserName();
    }
  }

  getPosts(): void {
    this.blogPostService.getBlogPosts().subscribe(
      (posts) => {
        this.blogPosts = posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        this.totalPages = Math.ceil(this.blogPosts.length / this.pageSize);
        this.updateDisplayedPosts();

        this.blogPosts.forEach(post => {
          this.checkEditPermission(post.id);
        });
      },
      (error) => {
        console.error('Error fetching blog posts:', error);
      }
    );
  }

  checkEditPermission(postId: number): void {
    this.editpermission(postId).subscribe(
      (hasPermission) => {
        this.editPermissions[postId] = hasPermission;
      },
      (error) => {
        console.error(`Error checking edit permission for post ${postId}:`, error);
        this.editPermissions[postId] = false;
      }
    );
  }

  editpermission(postId: number): Observable<boolean> {
    return this.blogPostService.editBlogPost(postId, {}).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error verifying permissions:', error);
        return of(false);
      })
    );
  }

  navigateToEditPost(postId: number): void {
    this.router.navigate([`/posts/${postId}/edit`]);
  }


  updateDisplayedPosts(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedPosts = this.blogPosts.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedPosts();
    }
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToPost(postId: number): void {
    this.router.navigate([`/posts/${postId}`]);
  }


  navigateToCreatePost(): void {
    this.router.navigate(['/posts/create/']);
  }

  likePost(postId: number): void {
    this.blogPostService.toggleLike(postId).subscribe({
      next: (response) => {
        const post = this.blogPosts.find(p => p.id === postId);
        if (post) {
          post.likes_count += response.detail === "Like eliminado." ? -1 : 1;
        }
      },
      error: (error) => {
        console.error('Error liking post:', error);
      }
    });
  }



}
