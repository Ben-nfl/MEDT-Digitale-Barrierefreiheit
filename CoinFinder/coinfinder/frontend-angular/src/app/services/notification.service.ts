// dieser dienst verwaltet die kurzen meldungen, die rechts oben in der app erscheinen.
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// jede meldung hat eine eigene nummer, eine art, eine überschrift und einen text.
export interface Notification {
  id: number;
  type: 'success' | 'error' | 'alarm' | 'info';
  title: string;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private counter = 0;
  // die meldungskomponente bekomt immer die aktuelle liste und zeichnet sie neu.
  notifications$ = new BehaviorSubject<Notification[]>([]);

  // erstellt eine meldung mit neuer nummer und hängt sie an eine kopie der bisherigen liste.
  // nach der angegebenen dauer wird genau diese meldung wieder entfernt, normalerweise nach fünf sekunden.
  show(type: Notification['type'], title: string, text: string, duration = 5000): void {
    const n: Notification = { id: ++this.counter, type, title, text };
    this.notifications$.next([...this.notifications$.value, n]);
    setTimeout(() => this.dismiss(n.id), duration);
  }

  // behält alle meldungen außer der mit dieser nummer. so kann man eine meldung auch früher schließen.
  dismiss(id: number): void {
    this.notifications$.next(this.notifications$.value.filter(n => n.id !== id));
  }
}
