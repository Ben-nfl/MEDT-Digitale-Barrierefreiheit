import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../shared/layout/layout.component';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  styles: [`
    .kopf { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 22px; }
    .titel { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.5px; }
    .unter { font-size: 0.8125rem; color: var(--text-gedimmt); }
    .zwei { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .karte { background: var(--karte); border: 1px solid var(--rand); border-radius: var(--ecke); overflow: hidden; }
    .karte-kopf { padding: 14px 18px; border-bottom: 1px solid var(--rand); font-size: 0.875rem; font-weight: 600; }
    .form { padding: 18px; }
    .suche-container { position: relative; }
    .suche-dropdown {
      position: absolute; top: calc(100% + 4px); left: 0; right: 0;
      background: var(--karte-hover); border: 1px solid var(--rand-hell);
      border-radius: var(--ecke-klein); z-index: 200;
      max-height: 200px; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }
    .suche-eintrag {
      padding: 9px 12px; cursor: pointer; display: flex; align-items: center;
      gap: 9px; font-size: 0.8125rem; transition: background 0.1s;
      width: 100%; background: transparent; border: none; color: inherit;
      font-family: inherit; text-align: left;
    }
    .suche-eintrag:hover, .suche-eintrag:focus { background: rgba(255,255,255,0.06); }
    .suche-eintrag:focus-visible { outline-offset: -3px; }
    .suche-avatar {
      width: 1.75rem; height: 1.75rem; border-radius: 50%; overflow: hidden;
      background: var(--akzent-schwach); display: flex; align-items: center;
      justify-content: center; font-size: 0.75rem; color: var(--akzent-hell); flex-shrink: 0;
    }
    .suche-avatar img { width: 100%; height: 100%; }
    .symbol-tag {
      font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;
      color: var(--text-sehr-gedimmt); background: rgba(255,255,255,0.04);
      padding: 2px 6px; border-radius: 4px; margin-left: 6px;
    }
    @media (max-width: 900px) { .zwei { grid-template-columns: 1fr; } }
  `],
  template: `
    <app-layout>
      <div class="kopf">
        <div>
          <h1 class="titel">Watchlist</h1>
          <div class="unter">Coins hinzufügen und verwalten</div>
        </div>
      </div>

      <div class="zwei">
        <!-- Formular: Coin hinzufügen -->
        <div class="karte">
          <h2 class="karte-kopf"><span aria-hidden="true">➕</span> Coin hinzufügen</h2>
          <div class="form">
            <p class="pflicht-hinweis">Felder mit <span class="pflicht" aria-hidden="true">*</span> sind Pflichtfelder.</p>
            <div class="feld-gruppe suche-container">
              <label class="feld-beschriftung" for="watchlist-suche">Coin suchen</label>
              <input class="feld-input" id="watchlist-suche" autocomplete="off" [(ngModel)]="suchtext" (ngModelChange)="suchen()"
                     (keydown.arrowdown)="fokusVorschlag(0, $event)" (keydown.escape)="vorschlaegeSchliessen()"
                     aria-describedby="watchlist-suche-status"
                     placeholder="z.B. Bitcoin, Ethereum..." />
              <span id="watchlist-suche-status" class="sr-only" aria-live="polite">{{ suchergebnisse.length ? suchergebnisse.length + ' Vorschläge gefunden. Mit Pfeil nach unten auswählen.' : '' }}</span>
              <div class="suche-dropdown" *ngIf="suchergebnisse.length > 0" role="group" aria-label="Vorschläge">
                <button type="button" class="suche-eintrag" *ngFor="let c of suchergebnisse; let i = index" (click)="auswaehlen(c)"
                        (keydown.arrowdown)="fokusVorschlag(i + 1, $event)" (keydown.arrowup)="fokusVorschlag(i - 1, $event)"
                        (keydown.escape)="vorschlaegeSchliessen()">
                  <div class="suche-avatar">
                    <img *ngIf="c.thumb" [src]="c.thumb" alt="" />
                    <span *ngIf="!c.thumb">{{ c.symbol[0] }}</span>
                  </div>
                  <span>{{ c.name }}</span>
                  <span style="color: var(--text-sehr-gedimmt); font-size: 0.75rem;">{{ c.symbol }}</span>
                </button>
              </div>
            </div>
            <div class="feld-gruppe">
              <label class="feld-beschriftung" for="watchlist-symbol">Symbol (CoinGecko-ID) <span class="pflicht" aria-hidden="true">*</span></label>
              <input class="feld-input" id="watchlist-symbol" [(ngModel)]="neuesSymbol" required placeholder="z.B. bitcoin" />
            </div>
            <div class="feld-gruppe">
              <label class="feld-beschriftung" for="watchlist-name">Name <span class="pflicht" aria-hidden="true">*</span></label>
              <input class="feld-input" id="watchlist-name" [(ngModel)]="neuerName" required placeholder="z.B. Bitcoin" />
            </div>
            <div *ngIf="addFehler" class="fehler-text" role="alert">{{ addFehler }}</div>
            <button class="haupt-knopf" (click)="hinzufuegen()" [disabled]="addLoading" style="margin-top:4px">
              {{ addLoading ? 'Wird hinzugefügt...' : 'Zur Watchlist hinzufügen' }}
            </button>
          </div>
        </div>

        <!-- Liste der Coins -->
        <div class="karte">
          <h2 class="karte-kopf">Beobachtete Coins ({{ watchlist.length }})</h2>
          <table>
            <thead>
              <tr><th>Coin</th><th>Typ</th><th>Aktion</th></tr>
            </thead>
            <tbody>
              <tr *ngIf="loading">
                <td class="lade-text" colspan="3">Lade Watchlist...</td>
              </tr>
              <tr *ngIf="!loading && watchlist.length === 0">
                <td class="lade-text" colspan="3">Keine Coins in der Watchlist</td>
              </tr>
              <tr *ngFor="let coin of watchlist">
                <td>
                  <strong>{{ coin.name }}</strong>
                  <span class="symbol-tag">{{ coin.symbol.toUpperCase() }}</span>
                </td>
                <td style="color: var(--text-gedimmt)">{{ coin.type }}</td>
                <td>
                  <button class="aktion-btn" (click)="loeschen(coin.symbol)">Entfernen</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </app-layout>
  `
})
export class WatchlistComponent implements OnInit {
  watchlist: any[] = [];
  loading = true;
  neuesSymbol = '';
  neuerName = '';
  suchtext = '';
  suchergebnisse: any[] = [];
  addFehler = '';
  addLoading = false;
  private suchTimer: any;

  constructor(private api: ApiService, private ns: NotificationService) {}

  ngOnInit(): void { this.laden(); }

  laden(): void {
    this.api.getWatchlist().subscribe(r => {
      if (r.success) this.watchlist = r.data;
      this.loading = false;
    });
  }

  suchen(): void {
    clearTimeout(this.suchTimer);
    if (this.suchtext.length < 2) { this.suchergebnisse = []; return; }
    this.suchTimer = setTimeout(() => {
      this.api.searchCoins(this.suchtext).subscribe(r => {
        if (r.success) this.suchergebnisse = r.data;
      });
    }, 400);
  }

  // Tastatur: Pfeil runter/hoch springt zwischen Suchfeld und Vorschlägen
  fokusVorschlag(index: number, event: Event): void {
    event.preventDefault();
    const eintraege = document.querySelectorAll<HTMLElement>('.suche-eintrag');
    if (index < 0) { document.getElementById('watchlist-suche')?.focus(); return; }
    eintraege[Math.min(index, eintraege.length - 1)]?.focus();
  }

  // Escape schließt die Vorschläge und setzt den Fokus zurück ins Suchfeld
  vorschlaegeSchliessen(): void {
    this.suchergebnisse = [];
    document.getElementById('watchlist-suche')?.focus();
  }

  auswaehlen(coin: any): void {
    this.neuesSymbol = coin.id;
    this.neuerName = coin.name;
    this.suchtext = coin.name;
    this.suchergebnisse = [];
    // nach der Auswahl weiter zum nächsten Feld, damit der Fokus nicht verloren geht
    setTimeout(() => document.getElementById('watchlist-name')?.focus());
  }

  hinzufuegen(): void {
    if (!this.neuesSymbol || !this.neuerName) {
      this.addFehler = 'Symbol und Name sind Pflicht!';
      return;
    }
    this.addLoading = true;
    this.addFehler = '';
    this.api.addCoin(this.neuesSymbol, this.neuerName).subscribe({
      next: r => {
        if (r.success) {
          this.ns.show('success', '✅ Hinzugefügt', `${this.neuerName} wurde zur Watchlist hinzugefügt`);
          this.neuesSymbol = '';
          this.neuerName = '';
          this.suchtext = '';
          this.laden();
        } else {
          this.addFehler = r.error;
        }
        this.addLoading = false;
      },
      error: err => {
        this.addFehler = err.error?.error || 'Fehler beim Hinzufügen';
        this.addLoading = false;
      }
    });
  }

  loeschen(symbol: string): void {
    this.api.deleteCoin(symbol).subscribe(r => {
      if (r.success) {
        this.ns.show('success', '🗑 Entfernt', `${symbol.toUpperCase()} wurde aus der Watchlist entfernt`);
        this.laden();
      }
    });
  }
}
