// dieser gemeinsame rahmen zeigt navigation, benutzer und verbindungszustand um den eigentlichen seiteninhalt.
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { WebsocketService } from '../../../services/websocket.service';
import { NotificationService } from '../../../services/notification.service';

// hier legt angular den namen des bausteins und seine benötigten hilfen fest.
// aussehen und seiteninhalt stehen direkt darunter in derselben datei.
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  /* teilt die seite in seitenleiste und hauptinhalt. die seitenleiste bleibt beim scrollen oben stehen. */
  styles: [`
    .layout {
      display: grid;
      grid-template-columns: 220px 1fr;
      min-height: 100vh;
    }
    .seitenleiste {
      background: var(--karte);
      border-right: 1px solid var(--rand);
      padding: 20px 12px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }
    .nav-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 8px 12px;
      border-bottom: 1px solid var(--rand);
    }
    .logo-icon {
      width: 30px; height: 30px;
      background: var(--akzent);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9375rem; flex-shrink: 0; color: var(--hintergrund);
    }
    .logo-name { font-size: 1.0625rem; font-weight: 700; letter-spacing: -0.3px; }
    .logo-name span { color: var(--akzent); }
    .nav-gruppe { display: flex; flex-direction: column; gap: 2px; }
    .nav-label {
      font-size: 0.75rem; font-weight: 600; letter-spacing: 0.1em;
      text-transform: uppercase; color: var(--text-sehr-gedimmt);
      padding: 0 8px; margin-bottom: 4px;
    }
    .nav-knopf {
      display: flex; align-items: center; gap: 9px;
      width: 100%; padding: 8px 12px;
      border-radius: var(--ecke-klein);
      border: none; background: transparent;
      color: var(--text-gedimmt);
      font-family: 'Inter', sans-serif; font-size: 0.8438rem;
      cursor: pointer; transition: all 0.15s; text-align: left;
      text-decoration: none;
    }
    .nav-knopf:hover { background: rgba(255,255,255,0.04); color: var(--text); }
    .nav-knopf.active {
      background: var(--akzent-schwach);
      color: var(--akzent-hell);
      font-weight: 500;
    }
    .nav-symbol { font-size: 0.9375rem; width: 20px; text-align: center; flex-shrink: 0; }
    .verbindungs-info { margin-top: auto; display: flex; flex-direction: column; gap: 8px; }
    .ws-status {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.75rem; color: var(--text-sehr-gedimmt);
      padding: 8px 10px;
      background: rgba(255,255,255,0.02);
      border-radius: var(--ecke-klein);
      border: 1px solid var(--rand);
    }
    .ws-punkt {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--text-sehr-gedimmt); flex-shrink: 0; transition: background 0.3s;
    }
    .ws-punkt.verbunden { background: var(--gruen); box-shadow: 0 0 5px rgba(34,197,94,0.5); }
    .ws-punkt.fehler    { background: var(--rot); }
    .benutzer-box {
      display: flex; align-items: center; gap: 9px;
      padding: 9px 10px;
      background: rgba(255,255,255,0.02);
      border-radius: var(--ecke-klein);
      border: 1px solid var(--rand);
    }
    .benutzer-avatar {
      width: 28px; height: 28px; border-radius: 50%;
      background: linear-gradient(135deg, var(--akzent), #fbbf24);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; color: var(--hintergrund); font-weight: 600; flex-shrink: 0;
    }
    .benutzer-daten { flex: 1; min-width: 0; }
    .benutzer-name  { font-size: 0.75rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .benutzer-rolle { font-size: 0.75rem; color: var(--text-sehr-gedimmt); text-transform: uppercase; letter-spacing: 0.05em; }
    .abmelde-knopf {
      background: transparent; border: none;
      color: var(--text-sehr-gedimmt);
      cursor: pointer; font-size: 0.875rem; padding: 3px;
      border-radius: 4px; transition: all 0.15s;
    }
    .abmelde-knopf:hover { color: var(--rot); }
    .hauptbereich { padding: 24px 28px; overflow-y: auto; }
    .hauptbereich:focus { outline: none; }
    /* bei schmalem fenster wird die navigation ausgeblendet. hier gibt es bisher keinen ersatz dafür. */
    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
      .seitenleiste { display: none; }
    }
  `],
  // derselbe rahmen wird von mehreren seiten benutzt, ihr eigener inhalt wird im hauptbereich eingesetzt.
  template: `
    <!-- dieser link hilft, mit der tastatur direkt an der navigation vorbei zum seiteninhalt zu springen. -->
    <a class="sprunglink" href="#hauptinhalt" (click)="zumInhalt($event)">Zum Inhalt springen</a>
    <div class="layout">
      <nav class="seitenleiste">
        <div class="nav-logo">
          <div class="logo-icon">🪙</div>
          <div class="logo-name">Coin<span>Finder</span></div>
        </div>

        <!-- die links wechseln innerhalb der app. der aktive link bekommt seine markierung von angular. -->
        <div class="nav-gruppe">
          <div class="nav-label">Navigation</div>
          <a class="nav-knopf" routerLink="/dashboard" routerLinkActive="active">
            <span class="nav-symbol">📊</span> Dashboard
          </a>
          <a class="nav-knopf" routerLink="/watchlist" routerLinkActive="active">
            <span class="nav-symbol">👁</span> Watchlist
          </a>
          <a class="nav-knopf" routerLink="/alerts" routerLinkActive="active">
            <span class="nav-symbol">🔔</span> Alarme
          </a>
          <a class="nav-knopf" routerLink="/prices" routerLinkActive="active">
            <span class="nav-symbol">📈</span> Kurse
          </a>
          <a class="nav-knopf" routerLink="/contact" routerLinkActive="active">
            <span class="nav-symbol">✉️</span> Kontakt
          </a>
          <a class="nav-knopf" routerLink="/barrierefreiheit" routerLinkActive="active">
            <span class="nav-symbol" aria-hidden="true">♿</span> Barrierefreiheit
          </a>
        </div>

        <!-- unten in der leiste stehen verbindungszustand, benutzer und abmeldeknopf. -->
        <div class="verbindungs-info">
          <div class="ws-status">
            <div class="ws-punkt" [class.verbunden]="wsStatus === 'connected'" [class.fehler]="wsStatus === 'error'"></div>
            <span>{{ wsStatusText }}</span>
          </div>
          <div class="benutzer-box" *ngIf="auth.currentUser">
            <div class="benutzer-avatar">{{ auth.currentUser.username[0].toUpperCase() }}</div>
            <div class="benutzer-daten">
              <div class="benutzer-name">{{ auth.currentUser.name }}</div>
              <div class="benutzer-rolle">{{ auth.currentUser.role }}</div>
            </div>
            <button class="abmelde-knopf" (click)="logout()" title="Abmelden" aria-label="Abmelden"><span aria-hidden="true">✕</span></button>
          </div>
        </div>
      </nav>

      <main class="hauptbereich" id="hauptinhalt" tabindex="-1">
        <!-- hier erscheint der inhalt, den die jeweilige seite zwischen die layout-tags geschrieben hat. -->
        <ng-content></ng-content>
      </main>
    </div>
  `
})
export class LayoutComponent implements OnInit, OnDestroy {
  wsStatus: string = 'disconnected';
  private sub!: Subscription;

  constructor(
    public auth: AuthService,
    private ws: WebsocketService,
    private ns: NotificationService,
  ) {}

  // verhindert den normalen linksprung und setzt den fokus direkt auf den hauptbereich.
  // tabindex minus eins macht diesen bereich per code fokussierbar, ohne einen zusätzlichen tab-stopp anzulegen.
  zumInhalt(event: Event): void {
    event.preventDefault();
    document.getElementById('hauptinhalt')?.focus();
  }

  // übersetzt die kurzen zustandsnamen der verbindung in einen lesbaren text für die seitenleiste.
  get wsStatusText(): string {
    switch (this.wsStatus) {
      case 'connected':    return 'Live-Daten aktiv';
      case 'connecting':   return 'Verbinde...';
      case 'error':        return 'Verbindungsfehler';
      default:             return 'Nicht verbunden';
    }
  }

  // öffnet beim anzeigen die live-verbindung und übernimmt spätere zustandsänderungen in die anzeige.
  ngOnInit(): void {
    this.ws.connect();
    this.sub = this.ws.status$.subscribe(s => this.wsStatus = s);

    // aus alarmen und adminnachrichten werden kurze sichtbare meldungen.
    // alarmmeldungen bleiben acht sekunden stehen, adminmeldungen sieben.
    this.ws.messages$.subscribe(msg => {
      if (msg.type === 'price_alert_triggered') {
        const p = msg.payload;
        this.ns.show('alarm', '🔔 Alarm ausgelöst!',
          `${p.symbol.toUpperCase()} hat $${p.current_price.toLocaleString()} erreicht`, 8000);
      }
      if (msg.type === 'admin_message') {
        this.ns.show('info', `📢 ${msg.payload.von}`, msg.payload.text, 7000);
      }
    });
  }

  // beendet das gespeicherte status-abonnement. das nachrichten-abonnement oben wird hier nicht mit beendet.
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // schließt die live-verbindung und lässt den anmeldedienst die gespeicherten benutzerdaten entfernen.
  logout(): void {
    this.ws.disconnect();
    this.auth.logout();
  }
}
