import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { BlogPost } from '../models/blog';
import { environment } from '../../environments/environment';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BlogPostService {
  constructor(private http: HttpClient) {}

  getBlogPosts() {
    return this.http.get<{ results: BlogPost[] }>(`${environment.apiUrl}/posts`).
    pipe(
      map(response => response.results || []),  // Extraer solo la propiedad "results"
      catchError(this.handleError)
    );
  }

  createBlogPost(post: Partial<BlogPost>, content: any): Observable<BlogPost> {
    const payload = {
      title: post.title,
      content: post.content
    };  // Adaptar el payload a lo que acepta el backend

    return this.http.post<BlogPost>(`${environment.apiUrl}/posts/create/`, payload).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error.message);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }
}
