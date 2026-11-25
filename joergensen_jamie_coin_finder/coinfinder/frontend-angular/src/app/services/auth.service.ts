import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface User {
  id: number;
  username: string;
  role: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = '/api/auth';
  private userSubject = new BehaviorSubject<User | null>(this.loadUser());

  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): User | null {
    const u = localStorage.getItem('cf_user');
    return u ? JSON.parse(u) : null;
  }

  get token(): string | null {
    return localStorage.getItem('cf_token');
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API}/login`, { username, password }).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('cf_token', res.token);
          localStorage.setItem('cf_user', JSON.stringify(res.user));
          this.userSubject.next(res.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('cf_token');
    localStorage.removeItem('cf_user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}
