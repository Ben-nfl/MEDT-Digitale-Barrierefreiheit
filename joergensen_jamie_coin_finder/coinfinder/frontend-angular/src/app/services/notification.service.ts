import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'alarm' | 'info';
  title: string;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private counter = 0;
  notifications$ = new BehaviorSubject<Notification[]>([]);

  show(type: Notification['type'], title: string, text: string, duration = 5000): void {
    const n: Notification = { id: ++this.counter, type, title, text };
    this.notifications$.next([...this.notifications$.value, n]);
    setTimeout(() => this.dismiss(n.id), duration);
  }

  dismiss(id: number): void {
    this.notifications$.next(this.notifications$.value.filter(n => n.id !== id));
  }
}
