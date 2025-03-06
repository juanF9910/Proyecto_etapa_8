import { Component, OnInit, Inject, Injector, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, throwError } from 'rxjs';

import { BlogPostService } from '../../services/blog-post.service';
import { GeneralServiceService } from '../../services/general-service.service';
import { BlogPost, BlogLikes } from '../../models/blog';
import { LogoutComponent } from '../logout/logout.component';
import { LikesComponent } from '../likes/likes.component';
import { DeleteComponent } from '../delete/delete.component';

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
  username = '';
  isAuthenticated = false;
  showLikes: Record<number, boolean> = {};
  authorizationError = false;
  platformId!: Object;
  editPermissions: Record<number, boolean> = {};
  alreadyLiked: Record<number, boolean> = {};
  private likesCache: Record<number, BlogLikes[]> = {};
  deletePopupVisible = false;
  postIdToDelete: number | null = null;
  // Variables de paginación
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  showConfirmation = false;
  postId: number | undefined;
  constructor(
    private blogPostService: BlogPostService,
    private generalService: GeneralServiceService,
    private router: Router,
    private injector: Injector,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.platformId = this.injector.get(PLATFORM_ID);
    this.isAuthenticated = this.blogPostService.isAuthenticated();
    if (this.isAuthenticated) {
      this.username = this.generalService.getUserName();
    }
    this.getPosts();
  }


  getPosts(): void {
    this.blogPostService.getBlogPosts().subscribe(
      (posts) => {
        this.blogPosts = posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        this.totalPages = Math.ceil(this.blogPosts.length / this.pageSize);
        this.updateDisplayedPosts();

        this.blogPosts.forEach(post => {
          this.checkEditPermission(post.id);
          this.hasUserLikedPost(post.id, this.username).subscribe(liked => this.alreadyLiked[post.id] = liked);
        });
      },
      (error) => console.error('Error fetching blog posts:', error)
    );
  }


  checkEditPermission(postId: number): void {
    this.blogPostService.editBlogPost(postId, {}).pipe(
      map(() => true),
      catchError(() => of(false))
    ).subscribe(hasPermission => this.editPermissions[postId] = hasPermission);
  }

  updateDisplayedPosts(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.displayedPosts = this.blogPosts.slice(startIndex, startIndex + this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedPosts();
    }
  }

  getPaginationInfo(): string {
    if (!this.blogPosts.length) return 'No hay posts aún.';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.blogPosts.length);
    return `${start}-${end} de ${this.blogPosts.length}`;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  likePost(postId: number): void {
    this.blogPostService.toggleLike(postId).subscribe({
      next: (response) => {
        const post = this.blogPosts.find(p => p.id === postId);
        if (post) {
          post.likes_count += response.detail === "Like eliminado." ? -1 : 1;
          this.alreadyLiked[postId] = response.detail !== "Like eliminado.";
          this.cdRef.detectChanges();
        }
      },
      error: (error) => console.error('Error liking post:', error)
    });
  }

  getLikesPost(postId: number): Observable<BlogLikes[]> {
    return this.blogPostService.getLikes(postId).pipe(
      map(likes => likes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())),
      catchError(error => {
        console.error('Error fetching likes:', error);
        return throwError(() => new Error('Failed to fetch likes'));
      })
    );
  }

  hasUserLikedPost(postId: number, username: string): Observable<boolean> {
    return this.getLikesPost(postId).pipe(
      map(likes => likes.some(like => like.username === username)),
      catchError(() => of(false))
    );
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

  navigateToEditPost(postId: number): void {
    this.router.navigate([`/posts/${postId}/edit`]);
  }

  confirmDelete() {
    this.showConfirmation = true;
    this.router.navigate(['/posts']);
  }

  cancelDelete() {
    this.showConfirmation = false;
    this.router.navigate(['/posts']);
  }

  deletePost(postId: number) {
    this.showConfirmation = false; // Hide the popup immediately

    this.blogPostService.deletePost(postId).subscribe({
      next: () => {
        console.log("Post deleted successfully");

        // Refresh the current view or navigate to another page
        this.router.navigate(['/posts']).then(() => {
          window.location.reload(); // Ensures post list updates
        });
      },
      error: (error) => {
        console.error("Error deleting post:", error);
      }
    });
  }


}
