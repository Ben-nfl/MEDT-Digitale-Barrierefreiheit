// diese seite zeigt aktuelle preise und kann einen preisverlauf als diagramm darstellen.
import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../shared/layout/layout.component';
import { ApiService } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';

// dieser name beschreibt eine global erwartete diagrammbibliothek nur für typescript.
// die zeile lädt sie nicht selbst. ist sie im browser nicht vorhanden, bleibt das diagramm leer.
declare const Chart: any;

// hier legt angular den namen des bausteins und seine benötigten hilfen fest.
// aussehen und seiteninhalt stehen direkt darunter in derselben datei.
@Component({
  selector: 'app-prices',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule, LayoutComponent],
  /* ordnet die auswahlknöpfe, die zeichenfläche und die preistabelle an. */
  styles: [`
    .kopf { margin-bottom: 22px; }
    .titel { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.5px; }
    .unter { font-size: 0.8125rem; color: var(--text-gedimmt); }
    .karte { background: var(--karte); border: 1px solid var(--rand); border-radius: var(--ecke); overflow: hidden; margin-bottom: 16px; }
    .karte-kopf { padding: 14px 18px; border-bottom: 1px solid var(--rand); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
    .karte-titel { font-size: 0.875rem; font-weight: 600; }
    .tabs { display: flex; gap: 4px; flex-wrap: wrap; }
    .tabs button {
      background: transparent; border: 1px solid var(--rand);
      color: var(--text-gedimmt); padding: 3px 9px; border-radius: 5px;
      font-size: 0.75rem; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.15s;
    }
    .tabs button.aktiv, .tabs button:hover {
      background: var(--akzent-schwach); border-color: rgba(249,115,22,0.4); color: var(--akzent-hell);
    }
    .chart-bereich { padding: 16px; height: 260px; position: relative; }
    .symbol-tag {
      font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;
      color: var(--text-sehr-gedimmt); background: rgba(255,255,255,0.04);
      padding: 2px 6px; border-radius: 4px; margin-left: 6px;
    }
  `],
  // oben kann man coin und zeitraum wählen, darunter stehen die aktuellen preise als tabelle.
  template: `
    <app-layout>
      <div class="kopf">
        <h1 class="titel">Kurse</h1>
        <div class="unter">Preisverläufe und aktuelle Kursdaten</div>
      </div>

      <!-- die knöpfe wechseln coin und zeitraum. aria-pressed zeigt vorleseprogrammen die aktuelle auswahl. -->
      <div class="karte">
        <div class="karte-kopf">
          <div>
            <h2 class="karte-titel">Kursverlauf</h2>
          </div>
          <div style="display:flex; gap: 8px; flex-wrap: wrap">
            <div class="tabs">
              <button *ngFor="let c of watchlist" [class.aktiv]="ausgewaehlteCoin === c.symbol" [attr.aria-pressed]="ausgewaehlteCoin === c.symbol"
                      (click)="waehleCoin(c.symbol)">{{ c.name }}</button>
            </div>
            <div class="tabs">
              <button *ngFor="let d of [7,14,30]" [class.aktiv]="ausgewaehlteZeit === d" [attr.aria-pressed]="ausgewaehlteZeit === d" [attr.aria-label]="d + ' Tage'"
                      (click)="waehleZeit(d)">{{ d }}T</button>
            </div>
          </div>
        </div>
        <div class="chart-bereich">
          <!-- das ist die zeichenfläche, die die diagrammbibliothek später benutzt. -->
          <canvas #chartCanvas></canvas>
        </div>
      </div>

      <!-- hier stehen dieselben aktuellen preiswerte auch als lesbare tabellenzeilen. -->
      <div class="karte">
        <div class="karte-kopf">
          <h2 class="karte-titel">Aktuelle Preise</h2>
          <span style="font-size: 0.75rem; color: var(--text-sehr-gedimmt)">Letzte Aktualisierung: {{ letzteAkt }}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Coin</th><th>Preis</th><th>24h %</th><th>Marktkapitalisierung</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="loading"><td class="lade-text" colspan="4">Lade Preise...</td></tr>
            <tr *ngFor="let r of preisRows">
              <td><strong>{{ r.name }}</strong><span class="symbol-tag">{{ r.symbol.toUpperCase() }}</span></td>
              <td class="mono">$<span>{{ r.preis | number:'1.2-2' }}</span></td>
              <td>
                <span class="badge" [class.hoch]="r.change >= 0" [class.tief]="r.change < 0">
                  {{ r.change >= 0 ? '▲' : '▼' }} {{ r.change | number:'1.2-2' }}%
                </span>
              </td>
              <td class="mono">{{ formatMcap(r.mcap) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </app-layout>
  `
})
export class PricesComponent implements OnInit, OnDestroy, AfterViewInit {
  // angular gibt uns damit zugriff auf die zeichenfläche aus der vorlage, sobald die ansicht aufgebaut ist.
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  // speichert die coin-liste, die tabellenwerte, die auswahl und die verbindung zum nachrichtenstrom.
  watchlist: any[] = [];
  preisRows: any[] = [];
  letzteAkt = '–';
  loading = true;
  ausgewaehlteCoin = '';
  ausgewaehlteZeit = 7;
  private chart: any;
  private sub!: Subscription;

  constructor(private api: ApiService, private ws: WebsocketService) {}

  // lädt coins und aktuelle preise. sobald die watchlist da ist, wählen wir ihren ersten coin aus.
  // neue live-preise ersetzen später die tabellenwerte und die uhrzeit der letzten aktualisierung.
  ngOnInit(): void {
    this.api.getWatchlist().subscribe(r => {
      if (r.success) {
        this.watchlist = r.data;
        if (this.watchlist.length) {
          this.ausgewaehlteCoin = this.watchlist[0].symbol;
          this.ladeHistorie();
        }
      }
    });
    this.ladePreise();
    this.sub = this.ws.messages$.subscribe(msg => {
      if (msg.type === 'price_update') {
        this.aktualisierePreise(msg.payload.prices);
        this.letzteAkt = new Date().toLocaleTimeString('de-AT');
      }
    });
  }

  // erst nach dem aufbauen der ansicht kann auf die zeichenfläche zugegriffen werden.
  ngAfterViewInit(): void {
    this.initChart();
  }

  // meldet diese seite von neuen preisnachrichten ab, wenn sie verlassen wird.
  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  // fragt die aktuellen kurse einmal normal ab, damit die tabelle nicht auf die nächste live-nachricht warten muss.
  ladePreise(): void {
    this.api.getCurrentPrices().subscribe(r => {
      if (r.success) this.aktualisierePreise(r.data);
      this.loading = false;
    });
  }

  // ordnet jedem coin seine preisdaten zu. bei fehlenden werten wird null angezeigt.
  aktualisierePreise(prices: any): void {
    this.preisRows = this.watchlist.map(coin => ({
      symbol: coin.symbol, name: coin.name,
      preis: prices[coin.symbol]?.usd ?? 0,
      change: prices[coin.symbol]?.usd_24h_change ?? 0,
      mcap: prices[coin.symbol]?.usd_market_cap ?? 0,
    }));
  }

  // merkt sich den angeklickten coin und holt dessen verlauf.
  waehleCoin(symbol: string): void {
    this.ausgewaehlteCoin = symbol;
    this.ladeHistorie();
  }

  // wechselt den zeitraum und fragt den preisverlauf dafür neu ab.
  waehleZeit(days: number): void {
    this.ausgewaehlteZeit = days;
    this.ladeHistorie();
  }

  // ohne ausgewählten coin gibt es nichts zu laden.
  // nach der antwort werden zeitpunkte und preise in getrennte listen für das diagramm aufgeteilt.
  ladeHistorie(): void {
    if (!this.ausgewaehlteCoin) return;
    this.api.getPriceHistory(this.ausgewaehlteCoin, this.ausgewaehlteZeit).subscribe(r => {
      if (r.success && this.chart) {
        const labels = r.data.map((p: any) => new Date(p.timestamp).toLocaleDateString('de-AT'));
        const data   = r.data.map((p: any) => p.price);
        // ersetzt beschriftung und punkte im vorhandenen diagramm und lässt es danach neu zeichnen.
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
        this.chart.data.datasets[0].label = this.ausgewaehlteCoin.toUpperCase();
        this.chart.update();
      }
    });
  }

  // zeichnet nur, wenn die zeichenfläche und die globale diagrammbibliothek vorhanden sind.
  // der zweidimensionale zeichenbereich wird für ein liniendiagramm mit zunächst leeren daten benutzt.
  initChart(): void {
    if (!this.chartCanvas || typeof Chart === 'undefined') return;
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: { labels: [], datasets: [{ label: '', data: [], borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.08)', borderWidth: 2, pointRadius: 2, fill: true, tension: 0.3 }] },
      // das diagramm passt sich seinem bereich an. unten stehen datumswerte, links dollarpreise.
      // weniger beschriftungen auf der zeitachse halten die anzeige übersichtlich.
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#8a8fa8', maxTicksLimit: 7 }, grid: { color: 'rgba(255,255,255,0.04)' } },
          y: { ticks: { color: '#8a8fa8', callback: (v: number) => '$' + v.toLocaleString() }, grid: { color: 'rgba(255,255,255,0.06)' } }
        }
      }
    });
  }

  // kürzt sehr große marktwerte ab, damit die zahlen nicht die ganze tabellenzeile brauchen.
  formatMcap(n: number): string {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
    return `$${n.toLocaleString()}`;
  }
}
