// diese seite nimmt benutzername und passwort entgegen und zeigt fehler bei der anmeldung.
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// hier legt angular den namen des bausteins und seine benötigten hilfen fest.
// aussehen und seiteninhalt stehen direkt darunter in derselben datei.
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  /* stellt das anmeldefenster mittig dar und gestaltet hinweise, felder und fehlermeldungen. */
  styles: [`
    .seite {
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; background: var(--hintergrund);
    }
    .box {
      background: var(--karte);
      border: 1px solid var(--rand);
      border-radius: 16px;
      padding: 40px 36px;
      width: 100%; max-width: 380px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .logo { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
    .logo-icon {
      width: 36px; height: 36px; background: var(--akzent);
      border-radius: 10px; display: flex; align-items: center;
      justify-content: center; font-size: 1.125rem; color: var(--hintergrund);
    }
    .logo-text { font-size: 1.375rem; font-weight: 700; letter-spacing: -0.5px; }
    .logo-text span { color: var(--akzent); }
    .bf-link { margin-top: 18px; text-align: center; font-size: 0.875rem; }
    .bf-link a { color: var(--akzent-hell); text-decoration: underline; text-underline-offset: 3px; }
    .bf-link a:hover { color: var(--text); }
    h1 { font-size: 1.125rem; font-weight: 600; margin-bottom: 4px; }
    .unter { font-size: 0.8125rem; color: var(--text-gedimmt); margin-bottom: 24px; }
    .hinweis {
      background: rgba(249,115,22,0.08);
      border: 1px solid rgba(249,115,22,0.25);
      border-radius: var(--ecke-klein);
      padding: 10px 13px; font-size: 0.75rem;
      color: var(--text-gedimmt); margin-bottom: 20px; line-height: 1.6;
    }
    .hinweis code {
      color: var(--akzent-hell); font-family: 'JetBrains Mono', monospace;
      background: rgba(249,115,22,0.1); padding: 1px 5px; border-radius: 4px;
    }
    .fehler {
      background: var(--rot-schwach); border: 1px solid rgba(239,68,68,0.3);
      color: var(--rot); border-radius: var(--ecke-klein);
      padding: 9px 12px; font-size: 0.8125rem; margin-bottom: 12px;
    }
  `],
  // die felder schreiben ihre werte in die klasse. anmelden geht per knopf oder mit der eingabetaste.
  template: `
    <div class="seite">
      <div class="box">
        <div class="logo">
          <div class="logo-icon">🪙</div>
          <div class="logo-text">Coin<span>Finder</span></div>
        </div>
        <h1>Willkommen zurück</h1>
        <p class="unter">Meld dich an um deine Coins zu tracken</p>

        <div class="hinweis">
          🔐 Demo-Zugänge:<br>
          Admin: <code>admin</code> / <code>admin123</code><br>
          User: <code>user</code> / <code>user123</code>
        </div>

        <div class="fehler" *ngIf="fehler" role="alert">{{ fehler }}</div>

        <div class="feld-gruppe">
          <!-- for und id verbinden beschriftung und eingabe, damit auch vorleseprogramme den feldnamen kennen. -->
          <label class="feld-beschriftung" for="login-benutzername">Benutzername</label>
          <input class="feld-input" id="login-benutzername" [(ngModel)]="username" type="text" autocomplete="username" required
                 placeholder="z.B. admin" (keyup.enter)="login()" />
        </div>
        <div class="feld-gruppe">
          <label class="feld-beschriftung" for="login-passwort">Passwort</label>
          <input class="feld-input" id="login-passwort" [(ngModel)]="password" type="password" autocomplete="current-password" required
                 placeholder="••••••••" (keyup.enter)="login()" />
        </div>

        <!-- während die antwort aussteht, ist der knopf gesperrt und zeigt einen anderen text. -->
        <button class="haupt-knopf" (click)="login()" [disabled]="loading">
          {{ loading ? 'Einloggen...' : 'Einloggen' }}
        </button>

        <p class="bf-link">
          <a routerLink="/barrierefreiheit">Erklärung zur Barrierefreiheit</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  // merkt sich die eingaben, eine mögliche fehlermeldung und ob gerade auf die antwort gewartet wird.
  username = '';
  password = '';
  fehler = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  // ohne beide eingaben wird sofort eine meldung angezeigt und keine anfrage gestartet.
  login(): void {
    if (!this.username || !this.password) {
      this.fehler = 'Benutzername und Passwort eingeben!';
      return;
    }
    // setzt die ladeanzeige und löscht den alten fehler, bevor der anmeldedienst aufgerufen wird.
    this.loading = true;
    this.fehler = '';
    this.auth.login(this.username, this.password).subscribe({
      // bei einer erfolgreichen anmeldung geht es zum dashboard, sonst bleibt eine fehlermeldung stehen.
      // der anmeldedienst hat den token bei erfolg bereits gespeichert.
      next: res => {
        if (res.success) this.router.navigate(['/dashboard']);
        else this.fehler = 'Falsche Zugangsdaten';
        this.loading = false;
      },
      // wenn die anfrage scheitert, bleibt die seite offen und der knopf wird wieder freigegeben.
      error: () => {
        this.fehler = 'Falsche Zugangsdaten';
        this.loading = false;
      }
    });
  }
}
