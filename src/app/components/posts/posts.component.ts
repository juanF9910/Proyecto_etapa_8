import { Component, OnInit, Inject, Injector } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { BlogPostService } from '../../services/blog-post.service';
import { BlogPost } from '../../models/blog';
import { Router } from '@angular/router';
import { LogoutComponent } from '../logout/logout.component';
import { PLATFORM_ID } from '@angular/core';
import {LikesComponent} from '../likes/likes.component';
import {DeleteComponent} from '../delete/delete.component';
import {GeneralServiceService} from '../../services/general-service.service';
import { catchError, map, Observable, of } from 'rxjs';
@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, LogoutComponent, LikesComponent,
    DeleteComponent
  ],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})

export class PostsComponent implements OnInit {
showConfirmation: any;
noPosts:boolean = false;
confirmDelete(arg0: number) {
throw new Error('Method not implemented.'); }

  blogPosts: BlogPost[] = [];
  activePostId: number | null = null;
  username: string = '';
  isAuthenticated: boolean = false;
  platformId!: Object;
  showLikes: { [key: number]: boolean } = {};
  private currentUserId : number | null | undefined;
  hasEditPermission: boolean | null | undefined;
  authorizationError: boolean = false;

  constructor(
    private blogPostService: BlogPostService,
    private generalService: GeneralServiceService,
    private router: Router,
    private injector: Injector // Inject Injector here
  ) {}

  ngOnInit(): void {
    this.platformId = this.injector.get(PLATFORM_ID); // Get PLATFORM_ID from the injector
    this.getPosts();
    // this.checkAuthentication();  // Verificar autenticación al iniciar
    this.isAuthenticated = this.blogPostService.isAuthenticated();
    if(this.isAuthenticated){
      this.username = this.generalService.getUserName();
      console.log('Usuario autenticado:', this.username);
      console.log('Usuario autenticado:', this.isAuthenticated);
    }
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


  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToPost(postId: number): void {
    this.router.navigate([`/posts/${postId}`]);
  }

  navigateToEditPost(postId: number): void {
    this.router.navigate([`/posts/${postId}/edit`]);
  }

  navigateToCreatePost(): void {
    this.router.navigate(['/posts/create/']);
  }

  handlePostClick(postId: number): void {
    this.activePostId = postId;
    setTimeout(() => { //setTimeout para que el usuario pueda ver el cambio de color antes de redirigir a la página de detalles del post seleccionado
      this.activePostId = null;
      this.navigateToPost(postId);
      // this.router.navigate([`/posts/${postId}`]);
    }, 300);
  }


  likePost(postId: number): void {
    this.blogPostService.toggleLike(postId).subscribe({
      next: (response) => {
        console.log(response.detail || 'Like toggled');
        const post = this.blogPosts.find(p => p.id === postId);
        if (post) {
          if (response.detail === "Like eliminado.") {
            post.likes_count--; // Unlike case
          } else {
            post.likes_count++; // Like case
          }
        }
      },
      error: (error) => {
        console.error('Error liking post:', error);
      }
    });
  }


  editpermission(postId: number): Observable<boolean> {
    return this.blogPostService.editBlogPost(postId, {}).pipe(
        map(() => true), // Si no hay error, se permite el acceso
          catchError(error => {
            if (error.message.includes('No tienes permiso para editar este post')) {
              console.warn('Acceso denegado: No puedes editar este post.');
            } else {
              console.error('Error al verificar permisos:', error);
            }
            this.router.navigate(['/posts']); // Redirigir en caso de error
            return of(false);
          })
        );
  }
}

