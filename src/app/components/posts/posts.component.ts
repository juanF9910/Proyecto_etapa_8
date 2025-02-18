import { Component, OnInit, Inject, Injector } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { BlogPostService } from '../../services/blog-post.service';
import { BlogPost } from '../../models/blog';
import { Router } from '@angular/router';
import { LogoutComponent } from '../logout/logout.component';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, LogoutComponent],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit {
  blogPosts: BlogPost[] = [];
  activePostId: number | null = null;
  isAuthenticated: boolean = false;
  platformId!: Object;

  constructor(
    private blogPostService: BlogPostService,
    private router: Router,
    private injector: Injector // Inject Injector here
  ) {}

  ngOnInit(): void {
    this.platformId = this.injector.get(PLATFORM_ID); // Get PLATFORM_ID from the injector
    this.getPosts();
    this.checkAuthentication();  // Verificar autenticación al iniciar
  }

  getPosts(): void {
    this.blogPostService.getBlogPosts().subscribe(
      (posts) => {
        this.blogPosts = posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      },
      (error) => {
        console.error('Error fetching blog posts:', error);
      }
    );
  }

  handlePostClick(postId: number): void {
    this.activePostId = postId;
    setTimeout(() => {
      this.activePostId = null;
      this.router.navigate([`/posts/${postId}`]);
    }, 300);
  }

  checkAuthentication(): void {
    if (isPlatformBrowser(this.platformId)) {  // Verificar si estamos en el navegador
      const token = localStorage.getItem('access_token');
      this.isAuthenticated = !!token;
    }
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
