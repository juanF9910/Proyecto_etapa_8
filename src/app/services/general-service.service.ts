import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import {CookieService} from  "ngx-cookie-service"
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})

export class GeneralServiceService {


  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) { }

  private currentUserId: number | null = null;

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      console.error('No refresh token found');
      return throwError(() => new Error('Missing refresh token'));
    }

    return this.http.post<any>(`${environment.apiUrl}/api/token/refresh/`, { refresh: refreshToken }).pipe(
      tap(response => {
        if (response.access) {
          localStorage.setItem('access_token', response.access);
          console.log('Token refreshed successfully');
        }
      }),
      catchError(error => {
        console.error('Token refresh failed:', error);
        this.logout(); // Cerrar sesión si el refresh falla
        return throwError(() => new Error('Token refresh failed'));
      })
    );
  }


  register(username:string, password:string, confirm_password:string){
    return this.http.post(`${environment.apiUrl}/register/`, {
      username,
      password,
      confirm_password});
  }


  login(username: string, password: string): Observable<any> {
    const body = { username, password };

    return this.http.post<any>(`${environment.apiUrl}/login/`, body).pipe(
      map(response => {
        // Store the access and refresh tokens in localStorage (or sessionStorage)
        const accessToken = response.access_token;
        const refreshToken = response.refresh_token;

        if (accessToken && refreshToken) {
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
        }

        console.log('Login successful:', response);
        return response;
      }),
      catchError(error => {
        console.error('Login failed:', error);
        throw error;
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  private getCookie(name: string): string {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : '';
  }


  platformId(platformId: any) {
    throw new Error('Method not implemented.');
  }


  logout(): Observable<any> {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (!accessToken || !refreshToken) {
      console.error('No access token or refresh token found');
      return throwError(() => new Error('Missing tokens'));
    }

    return this.http.post(`${environment.apiUrl}/logout/`, { refresh_token: refreshToken }, {
      observe: 'response',
      withCredentials: true, // Send cookies with the request if using them for JWT storage
      headers: {
        'Authorization': `Bearer ${accessToken}` // Sending access token in Authorization header
      }
    }).pipe(
      tap(() => {
        console.log('Logout successful');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }),
      catchError(error => {
        console.error('Logout failed:', error);
        return throwError(() => new Error('Logout failed'));
      })
    );
  }

  setToken(token: string) {
    this.cookieService.set('token', token);
  }

  getToken() {
    return this.cookieService.get('token');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

    // Method to set the user ID after login
  setUserId(userId: number): void {
      this.currentUserId = userId;
  }

    // Method to get the user ID
  getUserId(): number | null {
      return this.currentUserId;
  }

    // Method to check if user is authenticated
  isAuthenticated(): boolean {
      return this.currentUserId !== null;
  }

}



