// dieser dienst merkt sich die anmeldung im browser und informiert andere bausteine über den benutzer.
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

// beschreibt, welche benutzerdaten wir vom server erwarten. das passwort gehört nicht dazu.
export interface User {
  id: number;
  username: string;
  role: string;
  name: string;
}

// angular stellt für die ganze app eine gemeinsame instanz dieses dienstes bereit.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = '/api/auth';
  // hält den aktuellen benutzer bereit. neue abonnenten bekommen sofort den zuletzt gespeicherten stand.
  private userSubject = new BehaviorSubject<User | null>(this.loadUser());

  // andere bausteine können damit änderungen mitbekommen, aber nicht direkt einen neuen benutzer setzen.
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // liest die gespeicherten benutzerdaten nach einen neuladen der seite wieder ein.
  // json-parse macht aus dem gespeicherten text wieder ein objekt.
  private loadUser(): User | null {
    const u = localStorage.getItem('cf_user');
    return u ? JSON.parse(u) : null;
  }

  // holt den anmeldungsnachweis aus dem browserspeicher, etwa für anfragen ans backend.
  get token(): string | null {
    return localStorage.getItem('cf_token');
  }

  // gibt den gerade bekannten benutzer zurück, ohne ein neues abonnement anzulegen.
  get currentUser(): User | null {
    return this.userSubject.value;
  }

  // die zwei ausrufezeichen machen aus vorhanden oder nicht vorhanden einen wahrheitswert.
  // hier wird der token nicht auf sein ablaufdatum geprüft.
  get isLoggedIn(): boolean {
    return !!this.token;
  }

  // schickt die zugangsdaten an den server. erst wenn die antwort erfolgreich ist, merken wir uns die anmeldung.
  // tap führt das speichern nebenbei aus, die ursprüngliche antwort geht trotzdem an die anmeldeseite weiter.
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API}/login`, { username, password }).pipe(
      tap(res => {
        if (res.success) {
          // speichert token und benutzer auch über ein neuladen hinweg und meldet den neuen stand an die app.
          localStorage.setItem('cf_token', res.token);
          localStorage.setItem('cf_user', JSON.stringify(res.user));
          this.userSubject.next(res.user);
        }
      })
    );
  }

  // entfernt die gespeicherte anmeldung, leert den aktuellen benutzer und öffnet wieder die anmeldeseite.
  logout(): void {
    localStorage.removeItem('cf_token');
    localStorage.removeItem('cf_user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}
