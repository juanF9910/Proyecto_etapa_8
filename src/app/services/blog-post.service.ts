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

  getBlogPosts(): Observable<BlogPost[]> {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');
      console.log("Token:", token);
      const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();

      return this.http.get<{ results: BlogPost[] }>(`${environment.apiUrl}/posts/`, { headers })
        .pipe(map(response => response.results));
    }
    return of([]);
  }

  getComments(postId: number): Observable<BlogComment[]> {
    return this.http.get<BlogComment[]>(`${environment.apiUrl}/comments/${postId}`)
      .pipe(catchError(this.handleError));
  }

  getLikes(postId: number): Observable<BlogLikes[]> {
    return this.http.get<BlogLikes[]>(`${environment.apiUrl}/likes/${postId}`)
      .pipe(catchError(this.handleError));
  }

  getDetailPost(postId: number): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${environment.apiUrl}/posts/${postId}`)
      .pipe(catchError(this.handleError));
  }

  getPostIdFromUrl(): number | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const url = window.location.href;
    const match = url.match(/\/(comments|likes|posts)\/(\d+)/);
    if (match) {
      const postId = parseInt(match[2], 10);
      return isNaN(postId) ? null : postId;
    }
    return null;
  }

  createBlogPost(title: string, content: string, isPublic: string, authenticated: string, team: string, owner: string): Observable<BlogPost> {
    const payload = {
      title: title.trim(),
      content: content.trim(),
      public: isPublic,
      authenticated,
      team,
      owner
    };

    return this.http.post<BlogPost>(`${environment.apiUrl}/posts/create/`, payload)
      .pipe(
        map((response: BlogPost) => {
          console.log('Post created successfully:', response);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Something went wrong; please try again later.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Server-side error: ${error.status} - ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
