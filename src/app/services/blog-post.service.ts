import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError, expand, map, reduce, tap } from 'rxjs/operators';
import { BlogPost, BlogComment, BlogLikes } from '../models/blog';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class BlogPostService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  getAuthHeaders(): HttpHeaders {
    if (!isPlatformBrowser(this.platformId)) {
      return new HttpHeaders(); // SSR: Evitar `localStorage`
    }

    const token = localStorage.getItem('access_token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return token ? headers.set('Authorization', `Bearer ${token}`) : headers;
  }

  getBlogPosts(): Observable<BlogPost[]> {
    if (!isPlatformBrowser(this.platformId)) return of([]);

    const fetchPage = (url: string): Observable<{ results: BlogPost[], next_page_url?: string }> => {
      return this.http.get<{ results?: BlogPost[], next_page_url?: string }>(url, { headers: this.getAuthHeaders() })
        .pipe(
          map(response => ({
            results: response.results || [],
            next_page_url: response.next_page_url
          }))
        );
    };

    return fetchPage(`${environment.apiUrl}/posts/`).pipe(
      expand(response => response.next_page_url ? fetchPage(response.next_page_url) : EMPTY),
      reduce< { results: BlogPost[], next_page_url?: string }, BlogPost[] >(
        (acc, response) => [...acc, ...response.results],
        []
      ),
      catchError(error => {
        console.error("Error fetching posts:", error);
        return of([]);
      })
    );
  }




  getComments(postId: number): Observable<BlogComment[]> {
    return this.http.get<BlogComment[]>(`${environment.apiUrl}/comments/${postId}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getLikes(postId: number): Observable<BlogLikes[]> {
    return this.http.get<BlogLikes[]>(`${environment.apiUrl}/likes/${postId}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  toggleLike(postId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/likes/${postId}`, {}, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getDetailPost(postId: number): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${environment.apiUrl}/posts/${postId}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  createBlogPost(title: string, content: string, is_public: string, authenticated: string, team: string, owner: string): Observable<BlogPost> {
    const payload = { title, content, is_public, authenticated, team, owner };
    return this.http.post<BlogPost>(`${environment.apiUrl}/posts/create/`, payload, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  addComment(postId: number, content: string): Observable<BlogComment> {
    const payload = { content };
    return this.http.post<BlogComment>(`${environment.apiUrl}/comments/${postId}`, payload, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  editBlogPost(postId: number, updatedData: Partial<BlogPost>): Observable<BlogPost> {
    return this.http.patch<BlogPost>(`${environment.apiUrl}/posts/${postId}`, updatedData, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  deletePost(postId: number): Observable<void> {
    const url = `${environment.apiUrl}/posts/${postId}`;
    return this.http.delete<void>(url, { headers: this.getAuthHeaders() }).pipe(
      tap(() => console.log(`Post deleted successfully: ID ${postId}`)),
      catchError((error) => {
        console.error(`Failed to delete post ID ${postId}:`, error);
        return throwError(() => new Error('Error deleting the post. Please try again.'));
      })
    );
  }


  isAuthenticated(): boolean {
    return isPlatformBrowser(this.platformId) && !!localStorage.getItem('access_token');
  }

  // private handleError(error: HttpErrorResponse): Observable<never> {
  //   const errorMessage = error.error instanceof ErrorEvent
  //     ? `Client error: ${error.error.message}`
  //     : `Server error: ${error.status} - ${error.message}`;
  //   console.error(errorMessage);
  //   return throwError(() => new Error(errorMessage));
  // }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage: string;

    if (error.error && typeof error.error === 'object' && 'message' in error.error) {
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      errorMessage = `Server error: ${error.status} - ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

}
