// das dashboard zeigt die beobachteten coins, kursänderungen und eine kleine zusammenfassung.
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { LayoutComponent } from '../shared/layout/layout.component';
import { ApiService } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service';

// hier legt angular den namen des bausteins und seine benötigten hilfen fest.
// aussehen und seiteninhalt stehen direkt darunter in derselben datei.
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe, LayoutComponent],
  /* ordnet die übersichtskarten und die kurstabelle an. unter 900 pixeln stehen nur noch zwei karten nebeneinander. */
  styles: [`
    .kopf { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 22px; }
    .titel { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 2px; }
    .unter { font-size: 0.8125rem; color: var(--text-gedimmt); }
    .letzte { font-size: 0.75rem; color: var(--text-sehr-gedimmt); font-family: 'JetBrains Mono', monospace; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .stat {
      background: var(--karte); border: 1px solid var(--rand);
      border-radius: var(--ecke); padding: 16px 18px; transition: border-color 0.2s;
    }
    .stat:hover { border-color: var(--rand-hell); }
    .stat-label {
      font-size: 0.75rem; color: var(--text-sehr-gedimmt); text-transform: uppercase;
      letter-spacing: 0.07em; margin-bottom: 7px; font-weight: 500;
    }
    .stat-wert { font-family: 'JetBrains Mono', monospace; font-size: 1.25rem; font-weight: 500; line-height: 1; }
    .stat-unter { font-size: 0.75rem; color: var(--text-gedimmt); margin-top: 4px; }
    .karte { background: var(--karte); border: 1px solid var(--rand); border-radius: var(--ecke); overflow: hidden; }
    .karte-kopf { padding: 14px 18px; border-bottom: 1px solid var(--rand); display: flex; align-items: center; justify-content: space-between; }
    .karte-titel { font-size: 0.875rem; font-weight: 600; }
    .symbol-tag {
      font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;
      color: var(--text-sehr-gedimmt); background: rgba(255,255,255,0.04);
      padding: 2px 6px; border-radius: 4px; margin-left: 6px;
    }
    @media (max-width: 900px) { .stats { grid-template-columns: repeat(2, 1fr); } }
  `],
  // oben stehen die zusammenfassungen, darunter folgt für jeden coin eine tabellenzeile.
  template: `
    <app-layout>
      <div class="kopf">
        <div>
          <h1 class="titel">Dashboard</h1>
          <div class="unter">Deine Krypto-Übersicht auf einem Blick</div>
        </div>
        <div class="letzte">{{ letzteAktualisierung }}</div>
      </div>

      <!-- die doppelten klammern setzen die aktuellen werte aus der klasse in die anzeige ein. -->
      <div class="stats">
        <div class="stat">
          <h2 class="stat-label">Coins beobachtet</h2>
          <div class="stat-wert">{{ watchlist.length }}</div>
          <div class="stat-unter">in deiner Watchlist</div>
        </div>
        <div class="stat">
          <h2 class="stat-label">Aktive Alarme</h2>
          <div class="stat-wert">{{ aktiveAlarme }}</div>
          <div class="stat-unter">werden überwacht</div>
        </div>
        <div class="stat">
          <h2 class="stat-label">Top Gewinner</h2>
          <div class="stat-wert" style="color: var(--gruen)">{{ topGewinner?.change | number:'1.2-2' }}%</div>
          <div class="stat-unter">{{ topGewinner?.name || '–' }}</div>
        </div>
        <div class="stat">
          <h2 class="stat-label">Top Verlierer</h2>
          <div class="stat-wert" style="color: var(--rot)">{{ topVerlierer?.change | number:'1.2-2' }}%</div>
          <div class="stat-unter">{{ topVerlierer?.name || '–' }}</div>
        </div>
      </div>

      <div class="karte">
        <div class="karte-kopf">
          <h2 class="karte-titel">Aktuelle Kurse</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Coin</th>
              <th>Preis (USD)</th>
              <th>24h Änderung</th>
              <th>Marktkapitalisierung</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="loading">
              <td class="lade-text" colspan="4">Lade Kursdaten...</td>
            </tr>
            <!-- angular wiederholt diese zeile für jeden coin. die klassen markieren geänderte oder fallende preise. -->
            <tr *ngFor="let row of rows">
              <td>
                <strong>{{ row.name }}</strong>
                <span class="symbol-tag">{{ row.symbol.toUpperCase() }}</span>
              </td>
              <td class="mono" [class.preis-update]="row.updated">
                $<span>{{ row.preis | number:'1.2-2' }}</span>
              </td>
              <td>
                <span class="badge" [class.hoch]="row.change >= 0" [class.tief]="row.change < 0">
                  {{ row.change >= 0 ? '▲' : '▼' }} {{ row.change | number:'1.2-2' }}%
                </span>
              </td>
              <td class="mono">{{ formatMcap(row.mcap) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </app-layout>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  // hier merken wir uns die geladenen coins, die angezeigten zeilen und die werte für die übersicht.
  loading = true;
  watchlist: any[] = [];
  rows: any[] = [];
  aktiveAlarme = 0;
  topGewinner: any = null;
  topVerlierer: any = null;
  letzteAktualisierung = '–';
  private sub!: Subscription;

  constructor(private api: ApiService, private ws: WebsocketService) {}

  // lädt beim öffnen die daten und hört danach auf neue preisnachrichten.
  // bei neuen preisen wird auch die angezeigte uhrzeit erneuert.
  ngOnInit(): void {
    this.load();
    this.sub = this.ws.messages$.subscribe(msg => {
      if (msg.type === 'price_update') {
        this.updatePrices(msg.payload.prices);
        this.letzteAktualisierung = new Date().toLocaleTimeString('de-AT');
      }
    });
  }

  // beim verlassen wird dieses preis-abonnement beendet, damit die alte seite nicht weiter reagiert.
  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  // stößt drei unabhängige anfragen an: watchlist, alarme und preise.
  // die antworten müssen nicht in der selben reihenfolge ankommen. hier wird nicht gemeinsam auf alle gewartet.
  load(): void {
    this.api.getWatchlist().subscribe(r => {
      if (r.success) this.watchlist = r.data;
    });
    // für die übersicht zählen wir nur alarme, deren zustand noch aktiv ist.
    this.api.getAlerts().subscribe(r => {
      if (r.success) this.aktiveAlarme = r.data.filter((a: any) => a.status === 'active').length;
    });
    this.api.getCurrentPrices().subscribe(r => {
      if (r.success) {
        this.updatePrices(r.data);
        this.loading = false;
      }
    });
  }

  // baut für jeden gespeicherten coin eine tabellenzeile aus den aktuellen preisen.
  // fehlen werte, nehmen wir null als anzeigewert. der alte preis wird zum erkennen einer änderung gebraucht.
  updatePrices(prices: any): void {
    this.rows = this.watchlist.map(coin => {
      const p = prices[coin.symbol];
      // sucht den vorher angezeigten preis desselben coins, damit nur echte änderungen kurz hervorgehoben werden.
      const old = this.rows.find(r => r.symbol === coin.symbol)?.preis;
      return {
        symbol: coin.symbol,
        name: coin.name,
        preis: p?.usd ?? 0,
        change: p?.usd_24h_change ?? 0,
        mcap: p?.usd_market_cap ?? 0,
        updated: old !== undefined && old !== p?.usd,
      };
    });
    if (this.rows.length) {
      // sortiert eine kopie nach der tagesänderung. die reihenfolge der eigentlichen tabelle bleibt gleich.
      // der erste wert ist der höchste, der letzte der niedrigste, auch wenn alle kurse gefallen sind.
      const sorted = [...this.rows].sort((a, b) => b.change - a.change);
      this.topGewinner = sorted[0];
      this.topVerlierer = sorted[sorted.length - 1];
    }
  }

  // kürzt große marktwerte für die anzeige ab. t steht für billionen, b für milliarden und m für millionen.
  formatMcap(n: number): string {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toLocaleString()}`;
  }
}
