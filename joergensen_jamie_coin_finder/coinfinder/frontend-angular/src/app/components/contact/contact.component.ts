import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../shared/layout/layout.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  styles: [`
    .kopf { margin-bottom: 22px; }
    .titel { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.5px; }
    .unter { font-size: 0.8125rem; color: var(--text-gedimmt); }
    .karte { background: var(--karte); border: 1px solid var(--rand); border-radius: var(--ecke); overflow: hidden; max-width: 620px; }
    .karte-kopf { padding: 14px 18px; border-bottom: 1px solid var(--rand); font-size: 0.875rem; font-weight: 600; }
    .form { padding: 18px; }
    .feld-textarea { min-height: 130px; resize: vertical; font-family: 'Inter', sans-serif; }
    .checkbox-zeile { display: flex; align-items: center; gap: 8px; font-size: 0.8125rem; color: var(--text-gedimmt); }
  `],
  template: `
    <app-layout>
      <div class="kopf">
        <h1 class="titel">Kontakt</h1>
        <div class="unter">Schreib uns eine Nachricht</div>
      </div>

      <div class="karte">
        <h2 class="karte-kopf"><span aria-hidden="true">✉️</span> Kontaktformular</h2>
        <div class="form">
          <p class="pflicht-hinweis">Felder mit <span class="pflicht" aria-hidden="true">*</span> sind Pflichtfelder.</p>
          <div class="feld-gruppe">
            <label class="feld-beschriftung" for="kontakt-name">Name <span class="pflicht" aria-hidden="true">*</span></label>
            <input class="feld-input" id="kontakt-name" [(ngModel)]="name" required autocomplete="name" placeholder="z.B. Max Mustermann" />
          </div>
          <div class="feld-gruppe">
            <label class="feld-beschriftung" for="kontakt-email">E-Mail <span class="pflicht" aria-hidden="true">*</span></label>
            <input class="feld-input" id="kontakt-email" [(ngModel)]="email" type="email" required autocomplete="email" placeholder="z.B. max@beispiel.at" />
          </div>
          <div class="feld-gruppe">
            <label class="feld-beschriftung" for="kontakt-betreff">Betreff</label>
            <select class="feld-select" id="kontakt-betreff" [(ngModel)]="betreff">
              <option value="frage">Allgemeine Frage</option>
              <option value="fehler">Fehler melden</option>
              <option value="idee">Verbesserungsvorschlag</option>
            </select>
          </div>
          <div class="feld-gruppe">
            <label class="feld-beschriftung" for="kontakt-nachricht">Nachricht <span class="pflicht" aria-hidden="true">*</span></label>
            <textarea class="feld-input feld-textarea" id="kontakt-nachricht" [(ngModel)]="nachricht" required placeholder="Deine Nachricht..."></textarea>
          </div>
          <div class="feld-gruppe checkbox-zeile">
            <input type="checkbox" id="kontakt-datenschutz" [(ngModel)]="datenschutz" required />
            <label for="kontakt-datenschutz">Ich bin mit der Verarbeitung meiner Daten einverstanden. <span class="pflicht" aria-hidden="true">*</span></label>
          </div>
          <div *ngIf="fehler" class="fehler-text" role="alert" style="margin-bottom: 8px">{{ fehler }}</div>
          <button class="haupt-knopf" (click)="absenden()">Nachricht senden</button>
        </div>
      </div>
    </app-layout>
  `
})
export class ContactComponent {
  name = '';
  email = '';
  betreff = 'frage';
  nachricht = '';
  datenschutz = false;
  fehler = '';

  constructor(private ns: NotificationService) {}

  // Nur im Frontend: Es wird nichts an den Server geschickt
  absenden(): void {
    if (!this.name || !this.email || !this.nachricht) {
      this.fehler = 'Name, E-Mail und Nachricht sind Pflicht!';
      return;
    }
    if (!this.datenschutz) {
      this.fehler = 'Bitte stimme der Datenverarbeitung zu.';
      return;
    }
    this.fehler = '';
    this.ns.show('success', '✅ Nachricht gesendet', 'Danke für deine Nachricht!');
    this.name = '';
    this.email = '';
    this.betreff = 'frage';
    this.nachricht = '';
    this.datenschutz = false;
  }
}
