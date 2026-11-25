// das ist der einstieg im browser. hier werden die hauptkomponente und die gemeinsamen einstellungen geladen.
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// startet angular. falls schon beim starten etwas schiefgeht, landet der fehler in der browserkonsole.
bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
