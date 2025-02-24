import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenServiceService {

  constructor() { }

  saveToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  removeToken(): void {
    localStorage.removeItem('access_token');
  }

  hasToken(): boolean {
    return !!localStorage.getItem('access_token');
  }

  clearAll(): void {
    localStorage.clear();
  }
}
