// die hauptkomponente hält die wechselnde seite und die meldungsanzeige zusammen.
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationComponent } from './components/shared/notification/notification.component';

// standalone heißt, dass dieser baustein seine benötigten anderen bausteine direkt importiert.
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationComponent],
  template: `
    <!-- hier erscheinen die kurzen meldungen unabhängig davon, welche seite gerade offen ist. -->
    <app-notification></app-notification>
    <!-- an dieser stelle setzt angular die seite ein, die zur aktuellen adresse gehört. -->
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {}
