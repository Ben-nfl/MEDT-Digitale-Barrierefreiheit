// auf dieser seite werden preisalarme angelegt, angezeigt und verwaltet.
import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../shared/layout/layout.component';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

// hier legt angular den namen des bausteins und seine benötigten hilfen fest.
// aussehen und seiteninhalt stehen direkt darunter in derselben datei.
@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule, LayoutComponent],
  /* ordnet formular und erklärung an. die farbigen zustände unterscheiden aktive und ausgelöste alarme. */
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
  // das formular sammelt die preisgrenze, die liste darunter zeigt alle gespeicherten alarme.
  template: `
    <app-layout>
      <div class="kopf">
        <h1 class="titel">Alarme</h1>
        <div class="unter">Preis-Benachrichtigungen einrichten</div>
      </div>

      <div class="zwei">
        <!-- die eingaben werden mit den werten in der klasse verbunden und beim klicken geprüft. -->
        <div class="karte">
          <h2 class="karte-kopf"><span aria-hidden="true">🔔</span> Neuen Alarm erstellen</h2>
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

        <!-- dieser text erklärt die alarme, die eigentliche preisprüfung läuft auf dem server. -->
        <div class="karte">
          <h2 class="karte-kopf"><span aria-hidden="true">ℹ️</span> So funktionieren Alarme</h2>
          <div class="form" style="color: var(--text-gedimmt); font-size: 0.8125rem; line-height: 1.7">
            <p style="margin-bottom: 12px">Alarme werden automatisch geprüft wenn neue Preisdaten eintreffen (alle ~60 Sekunden von CoinGecko).</p>
            <p style="margin-bottom: 12px">Du bekommst eine <strong style="color: var(--text)">Echtzeit-Benachrichtigung</strong> sobald ein Alarm ausgelöst wurde – ohne die Seite neu laden zu müssen.</p>
            <p>Ausgelöste Alarme kannst du zurücksetzen um sie erneut zu überwachen.</p>
          </div>
        </div>
      </div>

      <!-- die liste wird für jeden alarm wiederholt. zurücksetzen gibt es nur bei ausgelösten alarmen. -->
      <div class="karte">
        <h2 class="karte-kopf">Alle Alarme ({{ alarme.length }})</h2>
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
  // hier liegen die geladenen alarme und die aktuellen formulareingaben.
  // die richtung above ist als anfangswert ausgewählt.
  alarme: any[] = [];
  loading = true;
  symbol = '';
  zielpreis: number | null = null;
  richtung = 'above';
  addFehler = '';
  addLoading = false;

  constructor(private api: ApiService, private ns: NotificationService) {}

  // lädt die gespeicherten alarme gleich beim öffnen.
  ngOnInit(): void { this.laden(); }

  // holt die liste vom server und beendet danach die ladeanzeige.
  laden(): void {
    this.api.getAlerts().subscribe(r => {
      if (r.success) this.alarme = r.data;
      this.loading = false;
    });
  }

  // prüft, ob symbol und zielpreis da sind, bevor die anfrage startet.
  // der server prüft zusätzlich, ob der preis positiv und die richtung erlaubt ist.
  erstellen(): void {
    if (!this.symbol || this.zielpreis == null) {
      this.addFehler = 'Symbol und Zielpreis sind Pflicht!';
      return;
    }
    // sperrt den knopf während der anfrage und entfernt eine alte fehlermeldung.
    this.addLoading = true;
    this.addFehler = '';
    this.api.createAlert(this.symbol, this.zielpreis, this.richtung).subscribe({
      next: r => {
        if (r.success) {
          // nach erfolg leeren wir die eingaben und laden die neue liste. die gewählte richtung bleibt stehen.
          this.ns.show('success', '✅ Alarm erstellt', `Alarm für ${this.symbol.toUpperCase()} angelegt`);
          this.symbol = '';
          this.zielpreis = null;
          this.laden();
        } else {
          this.addFehler = r.error;
        }
        this.addLoading = false;
      },
      // bei einem anfragefehler zeigen wir möglichst die meldung vom server und entsperren den knopf.
      error: err => {
        this.addFehler = err.error?.error || 'Fehler beim Erstellen';
        this.addLoading = false;
      }
    });
  }

  // löscht nur den alarm mit dieser nummer und lädt bei erfolg die liste neu.
  loeschen(id: number): void {
    this.api.deleteAlert(id).subscribe(r => {
      if (r.success) {
        this.ns.show('success', '🗑 Alarm gelöscht', '');
        this.laden();
      }
    });
  }

  // setzt einen ausgelösten alarm wieder auf aktiv, damit der server ihn erneut prüfen kann.
  zuruecksetzen(id: number): void {
    this.api.resetAlert(id).subscribe(r => {
      if (r.success) {
        this.ns.show('success', '🔄 Alarm zurückgesetzt', 'Der Alarm überwacht jetzt wieder');
        this.laden();
      }
    });
  }
}
