import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { BlogPost, BlogComment, BlogLikes } from '../models/blog';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class BlogPostService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  constructor() { }

  /** Obtiene los encabezados de autenticación si el usuario está autenticado */
  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');  // Or sessionStorage, depending on your setup

    let headers = new HttpHeaders({
        'Content-Type': 'application/json'
    });

    if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
}


  getBlogPosts(): Observable<BlogPost[]> {
    if (!isPlatformBrowser(this.platformId)) return of([]);

    const headers = this.isAuthenticated() ? { headers: this.getAuthHeaders() } : {}; // Send headers only when logged in

    return this.http.get<{ results?: BlogPost[], detail?: string }>(
      `${environment.apiUrl}/posts/`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => response.results || []),
      catchError(error => {
        console.error("Error fetching posts:", error);
        return of([]);
      })
    );
  }


  /** Obtiene los comentarios de un post con autenticación */
  getComments(postId: number): Observable<BlogComment[]> {
    return this.http.get<BlogComment[]>(
      `${environment.apiUrl}/comments/${postId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  /** Obtiene los likes de un post */
  getLikes(postId: number): Observable<BlogLikes[]> {
    return this.http.get<BlogLikes[]>(
      `${environment.apiUrl}/likes/${postId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }


  toggleLike(postId: number): Observable<any> {
    const token = localStorage.getItem('access_token');

    if (!token) {
      console.error('User is not authenticated');
      return throwError(() => new Error('User is not authenticated'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(`${environment.apiUrl}/likes/${postId}`, {}, { headers }).pipe(
      map(response => {
        console.log('Like toggled successfully:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error toggling like:', error);
        return throwError(() => new Error(`Server error: ${error.status} - ${error.message}`));
      })
    );
}

  /** Obtiene el detalle de un post con autenticación */
  getDetailPost(postId: number): Observable<BlogPost> {
    return this.http.get<BlogPost>(
      `${environment.apiUrl}/posts/${postId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  /** Obtiene el ID del post desde la URL */
  // getPostIdFromUrl(): number | null {

  //   if (!isPlatformBrowser(this.platformId)) return null;

  //   const match = window.location.href.match(/\/posts\/(\d+)/);
  //   return match && match[1] ? parseInt(match[1], 10) : null;
  // }

  /** Crea un nuevo post */
  createBlogPost(title: string, content: string, isPublic: string, authenticated: string, team: string, owner: string): Observable<BlogPost> {
    const payload = {
      title: title.trim(),
      content: content.trim(),
      public: isPublic,
      authenticated,
      team,
      owner
    };

    return this.http.post<BlogPost>(
      `${environment.apiUrl}/posts/create/`,
      payload,
      { headers: this.getAuthHeaders().set('Content-Type', 'application/json') }
    ).pipe(
      map(response => {
        console.log('Post created successfully:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  /** Manejo de errores centralizado */
  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error instanceof ErrorEvent
      ? `Client error: ${error.error.message}`
      : `Server error: ${error.status} - ${error.message}`;

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /** Verifica si el usuario está autenticado */
  isAuthenticated(): boolean {
    return isPlatformBrowser(this.platformId) && !!localStorage.getItem('access_token');
  }

  addComment(postId: number, content: string): Observable<BlogComment> {
    const token = localStorage.getItem('access_token');

    if (!token) {
      console.error('User is not authenticated');
      return throwError(() => new Error('User is not authenticated'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const payload = { content: content }; //trim es

    return this.http.post<BlogComment>(`${environment.apiUrl}/comments/${postId}`, payload, { headers })
      .pipe(
        map(response => {
          console.log('Comment created successfully:', response);
          return response;
        }),
        catchError(error => {
          console.error('Error creating comment:', error);
          return throwError(() => new Error(`Server-side error: ${error.status} - ${error.message}`));
        })
      );
  }

  editBlogPost(postId: number, updatedData: Partial<BlogPost>): Observable<BlogPost> {
    const token = localStorage.getItem('access_token');

    if (!token) {
      console.error('User is not authenticated');
      return throwError(() => new Error('User is not authenticated'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.patch<BlogPost>(`${environment.apiUrl}/posts/${postId}/`, updatedData, { headers })
      .pipe(
        map(response => {
          console.log('Post updated successfully:', response);
          return response;
        }),
        catchError(error => {
          if (error.status === 403) {
            console.warn('User does not have permission to edit this post');
            return throwError(() => new Error('No tienes permiso para editar este post.'));
          }
          console.error('Error updating post:', error);
          return throwError(() => new Error(`Server-side error: ${error.status} - ${error.message}`));
        })
      );
  }



}
