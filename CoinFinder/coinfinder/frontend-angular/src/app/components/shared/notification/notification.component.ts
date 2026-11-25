// dieser baustein zeigt die kurzen meldungen des meldungsdienstes rechts oben an.
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../services/notification.service';

// hier legt angular den namen des bausteins und seine benötigten hilfen fest.
// aussehen und seiteninhalt stehen direkt darunter in derselben datei.
@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  /* legt meldungen über den seiteninhalt. nur die meldungen selbst fangen mausklicks ab, nicht der freie bereich. */
  styles: [`
    .container {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    }
    .toast {
      background: var(--karte);
      border: 1px solid var(--rand-hell);
      border-radius: var(--ecke);
      padding: 12px 16px;
      max-width: 320px;
      font-size: 0.8125rem;
      pointer-events: all;
      animation: einblenden 0.25s ease;
      box-shadow: 0 8px 25px rgba(0,0,0,0.4);
    }
    .toast.success { border-color: rgba(34,197,94,0.4); }
    .toast.alarm   { border-color: rgba(249,115,22,0.5); background: rgba(249,115,22,0.08); }
    .toast.error   { border-color: rgba(239,68,68,0.4); }
    .title { font-weight: 600; margin-bottom: 2px; }
    .text  { font-size: 0.75rem; color: var(--text-gedimmt); }
    @keyframes einblenden {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `],
  // angular hört auf die meldungsliste und zeigt für jeden eintrag eine box mit titel und text.
  template: `
    <div class="container">
      <!-- async holt die aktuelle liste und kümmert sich um das abonnement. ein klick entfernt die gewählte meldung. -->
      <div *ngFor="let n of ns.notifications$ | async"
           class="toast" [class]="n.type"
           (click)="ns.dismiss(n.id)">
        <div class="title">{{ n.title }}</div>
        <div class="text">{{ n.text }}</div>
      </div>
    </div>
  `
})
export class NotificationComponent {
  // der öffentliche dienst kann direkt aus der vorlage gelesen und zum schließen aufgerufen werden.
  constructor(public ns: NotificationService) {}
}
