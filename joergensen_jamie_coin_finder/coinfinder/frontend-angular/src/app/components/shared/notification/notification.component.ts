import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
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
      font-size: 13px;
      pointer-events: all;
      animation: einblenden 0.25s ease;
      box-shadow: 0 8px 25px rgba(0,0,0,0.4);
    }
    .toast.success { border-color: rgba(34,197,94,0.4); }
    .toast.alarm   { border-color: rgba(249,115,22,0.5); background: rgba(249,115,22,0.08); }
    .toast.error   { border-color: rgba(239,68,68,0.4); }
    .title { font-weight: 600; margin-bottom: 2px; }
    .text  { font-size: 12px; color: var(--text-gedimmt); }
    @keyframes einblenden {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `],
  template: `
    <div class="container">
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
  constructor(public ns: NotificationService) {}
}
