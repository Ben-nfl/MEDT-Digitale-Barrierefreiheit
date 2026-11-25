import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../shared/layout/layout.component';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule, LayoutComponent],
  styles: [`
    .kopf { margin-bottom: 22px; }
    .titel { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.5px; }
    .unter { font-size: 0.8125rem; color: var(--text-gedimmt); }
    .zwei { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .karte { background: var(--karte); border: 1px solid var(--rand); border-radius: var(--ecke); overflow: hidden; margin-bottom: 16px; }
    .karte-kopf { padding: 14px 18px; border-bottom: 1px solid var(--rand); font-size: 0.875rem; font-weight: 600; }
    .form { padding: 18px; }
    .alarm-eintrag {
      display: flex; align-items: center; gap: 12px;
      padding: 13px 18px; border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.1s;
    }
    .alarm-eintrag:hover { background: rgba(255,255,255,0.02); }
    .alarm-eintrag:last-child { border-bottom: none; }
    .alarm-symbol { font-family: 'JetBrains Mono', monospace; font-size: 0.7812rem; font-weight: 500; text-transform: uppercase; }
    .alarm-detail { flex: 1; font-size: 0.7812rem; color: var(--text-gedimmt); }
    .status-badge {
      font-size: 0.75rem; padding: 2px 7px; border-radius: 20px; font-weight: 600; letter-spacing: 0.04em;
    }
    .status-badge.active    { background: var(--gruen-schwach); color: var(--gruen); }
    .status-badge.triggered { background: var(--akzent-schwach); color: var(--akzent-hell); }
    @media (max-width: 900px) { .zwei { grid-template-columns: 1fr; } }
  `],
  template: `
    <app-layout>
      <div class="kopf">
        <div class="titel">Alarme</div>
        <div class="unter">Preis-Benachrichtigungen einrichten</div>
      </div>

      <div class="zwei">
        <!-- Alarm erstellen -->
        <div class="karte">
          <div class="karte-kopf">🔔 Neuen Alarm erstellen</div>
          <div class="form">
            <p class="pflicht-hinweis">Felder mit <span class="pflicht" aria-hidden="true">*</span> sind Pflichtfelder.</p>
            <div class="feld-gruppe">
              <label class="feld-beschriftung" for="alarm-symbol">Coin-Symbol (CoinGecko-ID) <span class="pflicht" aria-hidden="true">*</span></label>
              <input class="feld-input" id="alarm-symbol" [(ngModel)]="symbol" required placeholder="z.B. bitcoin" />
            </div>
            <div class="feld-gruppe">
              <label class="feld-beschriftung" for="alarm-zielpreis">Zielpreis (USD) <span class="pflicht" aria-hidden="true">*</span></label>
              <input class="feld-input" id="alarm-zielpreis" [(ngModel)]="zielpreis" required type="number" placeholder="z.B. 100000" />
            </div>
            <div class="feld-gruppe">
              <label class="feld-beschriftung" for="alarm-richtung">Richtung</label>
              <select class="feld-select" id="alarm-richtung" [(ngModel)]="richtung">
                <option value="above">▲ Alarm wenn Preis ÜBER Zielwert steigt</option>
                <option value="below">▼ Alarm wenn Preis UNTER Zielwert fällt</option>
              </select>
            </div>
            <div *ngIf="addFehler" class="fehler-text" role="alert" style="margin-bottom: 8px">{{ addFehler }}</div>
            <button class="haupt-knopf" (click)="erstellen()" [disabled]="addLoading">
              {{ addLoading ? 'Wird erstellt...' : 'Alarm erstellen' }}
            </button>
          </div>
        </div>

        <!-- Info-Box -->
        <div class="karte">
          <div class="karte-kopf">ℹ️ So funktionieren Alarme</div>
          <div class="form" style="color: var(--text-gedimmt); font-size: 0.8125rem; line-height: 1.7">
            <p style="margin-bottom: 12px">Alarme werden automatisch geprüft wenn neue Preisdaten eintreffen (alle ~60 Sekunden von CoinGecko).</p>
            <p style="margin-bottom: 12px">Du bekommst eine <strong style="color: var(--text)">Echtzeit-Benachrichtigung</strong> sobald ein Alarm ausgelöst wurde – ohne die Seite neu laden zu müssen.</p>
            <p>Ausgelöste Alarme kannst du zurücksetzen um sie erneut zu überwachen.</p>
          </div>
        </div>
      </div>

      <!-- Alarm-Liste -->
      <div class="karte">
        <div class="karte-kopf">Alle Alarme ({{ alarme.length }})</div>
        <div *ngIf="loading" class="lade-text">Lade Alarme...</div>
        <div *ngIf="!loading && alarme.length === 0" class="lade-text">Keine Alarme vorhanden</div>
        <div class="alarm-eintrag" *ngFor="let a of alarme">
          <div>
            <div class="alarm-symbol">{{ a.symbol.toUpperCase() }}</div>
            <div class="alarm-detail">
              {{ a.richtung === 'above' ? '▲ über' : '▼ unter' }} $<span>{{ a.zielpreis | number:'1.2-2' }}</span>
            </div>
          </div>
          <div style="flex:1"></div>
          <span class="status-badge" [class]="a.status">
            {{ a.status === 'active' ? 'Aktiv' : 'Ausgelöst' }}
          </span>
          <button class="aktion-btn reset" *ngIf="a.status === 'triggered'" (click)="zuruecksetzen(a.id)">
            Zurücksetzen
          </button>
          <button class="aktion-btn" (click)="loeschen(a.id)">Löschen</button>
        </div>
      </div>
    </app-layout>
  `
})
export class AlertsComponent implements OnInit {
  alarme: any[] = [];
  loading = true;
  symbol = '';
  zielpreis: number | null = null;
  richtung = 'above';
  addFehler = '';
  addLoading = false;

  constructor(private api: ApiService, private ns: NotificationService) {}

  ngOnInit(): void { this.laden(); }

  laden(): void {
    this.api.getAlerts().subscribe(r => {
      if (r.success) this.alarme = r.data;
      this.loading = false;
    });
  }

  erstellen(): void {
    if (!this.symbol || this.zielpreis == null) {
      this.addFehler = 'Symbol und Zielpreis sind Pflicht!';
      return;
    }
    this.addLoading = true;
    this.addFehler = '';
    this.api.createAlert(this.symbol, this.zielpreis, this.richtung).subscribe({
      next: r => {
        if (r.success) {
          this.ns.show('success', '✅ Alarm erstellt', `Alarm für ${this.symbol.toUpperCase()} angelegt`);
          this.symbol = '';
          this.zielpreis = null;
          this.laden();
        } else {
          this.addFehler = r.error;
        }
        this.addLoading = false;
      },
      error: err => {
        this.addFehler = err.error?.error || 'Fehler beim Erstellen';
        this.addLoading = false;
      }
    });
  }

  loeschen(id: number): void {
    this.api.deleteAlert(id).subscribe(r => {
      if (r.success) {
        this.ns.show('success', '🗑 Alarm gelöscht', '');
        this.laden();
      }
    });
  }

  zuruecksetzen(id: number): void {
    this.api.resetAlert(id).subscribe(r => {
      if (r.success) {
        this.ns.show('success', '🔄 Alarm zurückgesetzt', 'Der Alarm überwacht jetzt wieder');
        this.laden();
      }
    });
  }
}
