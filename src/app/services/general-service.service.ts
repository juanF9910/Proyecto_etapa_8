import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, map, Observable, of, tap, throwError, BehaviorSubject } from 'rxjs';
import { CookieService } from "ngx-cookie-service";
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GeneralServiceService {
  private currentUserId: number | null = null;
  private refreshTimeout: any;
  authStatus = new BehaviorSubject<boolean>(this.isLoggedIn());  // Observable for auth state

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router
  ) { }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private getStoredAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private setSession(accessToken: string, refreshToken: string) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    this.scheduleTokenRefresh();
  }

  private clearSession() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    clearTimeout(this.refreshTimeout);
    this.authStatus.next(false);
  }

  private scheduleTokenRefresh() {
    const token = this.getStoredAccessToken();
    if (!token) return;

    const decodedToken = this.parseJwt(token);
    if (!decodedToken?.exp) return;

    const expiresIn = (decodedToken.exp * 1000) - Date.now(); // Expiry time in ms
    const refreshTime = expiresIn - 60000; // Refresh 1 minute before expiry

    if (refreshTime > 0) {
      this.refreshTimeout = setTimeout(() => this.refreshToken().subscribe(), refreshTime);
    }
  }

  private parseJwt(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }

  register(username: string, password: string, confirm_password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/register/`, {
      username,
      password,
      confirm_password
    }).pipe(
      tap(response => {
        console.log('Registration successful:', response);
      }),
      catchError(error => {
        console.error('Registration failed:', error);
        return throwError(() => new Error('Registration failed'));
      })
    );
  }


  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/login/`, { username, password }).pipe(
      tap(response => {
        if (response.access_token && response.refresh_token) {
          this.setSession(response.access_token, response.refresh_token);
          localStorage.setItem('username', username); // Store username in localStorage
          this.authStatus.next(true);
        }
      }),
      catchError(error => {
        console.error('Login failed:', error);
        return throwError(() => new Error('Login failed'));
      })
    );
  }


  logout(): Observable<any> {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      console.warn('No refresh token found, forcing logout.');
      this.clearSession();
      return of({ message: 'Logged out locally' });
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}` // ✅ Include Authorization header
    });

    return this.http.post(`${environment.apiUrl}/logout/`, { refresh_token: refreshToken }, { headers, withCredentials: true })
      .pipe(
        tap(() => {
          console.log('Logout successful');
          this.clearSession();
        }),
        catchError(error => {
          console.error('Logout request failed:', error);
          this.clearSession();
          return throwError(() => new Error('Logout failed'));
        })
      );
  }


  refreshToken(): Observable<any> {
    const refreshToken = this.getStoredRefreshToken();

    if (!refreshToken) {
      this.clearSession();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<any>(`${environment.apiUrl}/api/token/refresh/`, { refresh: refreshToken }).pipe(
      tap(response => {
        if (response.access) {
          this.setSession(response.access, refreshToken);
        }
      }),
      catchError(error => {
        console.error('Token refresh failed:', error);
        this.clearSession();
        this.router.navigate(['/login']); // Redirect to login if refresh fails
        return throwError(() => new Error('Token refresh failed'));
      })
    );
  }

  isLoggedIn(): boolean {
    const token = this.getStoredAccessToken();
    if (!token) return false;

    const decodedToken = this.parseJwt(token);
    return decodedToken?.exp * 1000 > Date.now();
  }

  getUserName(): string {
    return localStorage.getItem('username') || 'User'; // Adjust based on where you store it
  }

}
