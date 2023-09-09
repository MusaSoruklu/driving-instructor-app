import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import jwt_decode from 'jwt-decode';
import { User } from './models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private apiUrl = 'http://localhost:3000/auth';
  private _isLoggedIn = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      this._isLoggedIn.next(true);
    }
  }

  get isLoggedIn() {
    return this._isLoggedIn.asObservable();
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        this._isLoggedIn.next(true);
      })
    );
  }

  signup(email: string, password: string, name: string, phone: string) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/signup`, { email, password, name, phone }).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        this._isLoggedIn.next(true);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this._isLoggedIn.next(false);
  }

  checkEmail(email: string) {
    return this.http.post<{ exists: boolean }>(`${this.apiUrl}/check-email`, { email }).pipe(
      map(response => response.exists)
    );
  }

  getUser(): User | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      const decodedToken = jwt_decode(token) as User;
      return decodedToken;
    }
    return null;
  }
}