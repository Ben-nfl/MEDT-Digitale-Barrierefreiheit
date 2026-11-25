import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Erklärung zur Barrierefreiheit
// Eigenständige Unterseite, auch ohne Anmeldung erreichbar.
// Aufbau nach der EU-Mustererklärung (Durchführungsbeschluss (EU) 2018/1523)
// und dem Muster der FFG zum Web-Zugänglichkeits-Gesetz (WZG).
@Component({
  selector: 'app-barrierefreiheit',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [`
    .seite { min-height: 100vh; padding: 32px 20px 48px; }
    .inhalt { max-width: 760px; margin: 0 auto; }
    .zurueck {
      display: inline-block; margin-bottom: 24px;
      color: var(--akzent-hell); font-size: 0.9375rem; font-weight: 500;
      text-decoration: underline; text-underline-offset: 3px;
    }
    .zurueck:hover { color: var(--text); }
    .titel { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 6px; }
    .stand { font-size: 0.875rem; color: var(--text-gedimmt); margin-bottom: 28px; }
    .abschnitt {
      background: var(--karte); border: 1px solid var(--rand);
      border-radius: var(--ecke); padding: 20px 22px; margin-bottom: 16px;
    }
    .abschnitt h2 { font-size: 1.125rem; font-weight: 600; margin-bottom: 10px; }
    .abschnitt h3 { font-size: 1rem; font-weight: 600; margin: 14px 0 6px; }
    .abschnitt p, .abschnitt li { font-size: 0.9375rem; line-height: 1.65; color: var(--text-gedimmt); }
    .abschnitt p + p { margin-top: 10px; }
    .abschnitt ul { padding-left: 22px; margin-top: 6px; }
    .abschnitt li { margin-bottom: 6px; }
    .abschnitt strong { color: var(--text); font-weight: 600; }
    .abschnitt a { color: var(--akzent-hell); text-decoration: underline; text-underline-offset: 3px; }
    .abschnitt a:hover { color: var(--text); }
    .status {
      display: inline-block; padding: 3px 10px; border-radius: 20px;
      background: var(--akzent-schwach); color: var(--akzent-hell);
      font-weight: 600; font-size: 0.875rem;
    }
  `],
  template: `
    <div class="seite">
      <main class="inhalt">
        <a class="zurueck" [routerLink]="auth.currentUser ? '/dashboard' : '/login'">
          ← Zurück zu CoinFinder
        </a>

        <h1 class="titel">Erklärung zur Barrierefreiheit</h1>
        <p class="stand">Stand: 25. November 2026</p>

        <section class="abschnitt" aria-labelledby="bf-geltung">
          <h2 id="bf-geltung">Geltungsbereich</h2>
          <p>
            Diese Erklärung gilt für die Web-App <strong>CoinFinder</strong>. CoinFinder ist ein Schulprojekt
            im Fach Medientechnik (MEDT). Mit der App kann man Kryptowährungen beobachten, eine Watchlist
            führen und Preis-Alarme einrichten.
          </p>
          <p>
            CoinFinder ist keine öffentliche Stelle und muss diese Erklärung nicht veröffentlichen. Wir
            veröffentlichen sie freiwillig. Sie folgt dem Muster der EU (Durchführungsbeschluss (EU) 2018/1523)
            und dem österreichischen Web-Zugänglichkeits-Gesetz (WZG).
          </p>
        </section>

        <section class="abschnitt" aria-labelledby="bf-stand">
          <h2 id="bf-stand">Stand der Vereinbarkeit mit den Anforderungen</h2>
          <p>
            Diese Web-App ist mit den Web Content Accessibility Guidelines
            <strong>WCAG 2.2, Konformitätsstufe AA</strong>
            <span class="status">teilweise vereinbar</span>.
          </p>
          <p>Die unten aufgeführten Inhalte sind noch nicht vollständig barrierefrei.</p>
        </section>

        <section class="abschnitt" aria-labelledby="bf-nicht">
          <h2 id="bf-nicht">Nicht barrierefreie Inhalte</h2>
          <p>Diese Inhalte sind aus folgenden Gründen nicht barrierefrei:</p>

          <h3>Verstöße gegen die WCAG 2.2</h3>
          <ul>
            <li>
              <strong>Navigation bei starker Vergrößerung:</strong> Bei 200 % Zoom oder auf schmalen Bildschirmen
              wird die Seitenleiste mit der Navigation ausgeblendet. Man kann dann nicht zu anderen Seiten wechseln.
              (1.4.10 Umbruch)
            </li>
            <li>
              <strong>Tastatur-Bedienung:</strong> Die Vorschlagsliste der Coin-Suche in der Watchlist kann man
              nicht mit der Tastatur auswählen. Als Alternative kann man Symbol und Name direkt in die Felder
              darunter eintippen. (2.1.1 Tastatur)
            </li>
            <li>
              <strong>Abmelde-Knopf:</strong> Der Knopf zum Abmelden zeigt nur das Zeichen „✕“ und hat keinen
              eindeutigen Namen für Screenreader. (4.1.2 Name, Rolle, Wert)
            </li>
            <li>
              <strong>Gewinn und Verlust:</strong> Steigende und fallende Kurse werden teilweise nur durch die
              Farben Grün und Rot unterschieden. (1.4.1 Benutzung von Farbe)
            </li>
            <li>
              <strong>Live-Kurse:</strong> Die Kurse aktualisieren sich automatisch. Screenreader bekommen
              diese Änderungen nicht mit. (4.1.3 Statusmeldungen)
            </li>
            <li>
              <strong>Kurs-Diagramm:</strong> Das Diagramm „Kursverlauf“ ist eine Grafik ohne Textalternative.
              Die aktuellen Kurse stehen aber zusätzlich als Tabelle auf derselben Seite. (1.1.1 Nicht-Text-Inhalt)
            </li>
          </ul>

          <h3>Inhalte von Dritten</h3>
          <ul>
            <li>
              Die Kursdaten kommen von der öffentlichen Schnittstelle von CoinGecko. Auf die Verfügbarkeit dieser
              Daten haben wir keinen Einfluss.
            </li>
          </ul>

          <p>Wir arbeiten daran, diese Barrieren zu beheben.</p>
        </section>

        <section class="abschnitt" aria-labelledby="bf-erstellung">
          <h2 id="bf-erstellung">Erstellung dieser Erklärung</h2>
          <p>Diese Erklärung wurde am <strong>25. November 2026</strong> erstellt.</p>
          <p>
            Die Bewertung ist eine <strong>Selbstbewertung</strong>. Geprüft wurde mit dem Werkzeug
            WAVE (WebAIM) und von Hand: Kontrastwerte nachgerechnet, Bedienung mit 200 % Zoom getestet,
            Überschriften und Formular-Beschriftungen kontrolliert.
          </p>
          <p>
            Ergebnis von WAVE auf Dashboard und Kontakt-Seite: 0 Fehler, 0 Kontrast-Fehler,
            AIM Score 10 von 10.
          </p>
        </section>

        <section class="abschnitt" aria-labelledby="bf-kontakt">
          <h2 id="bf-kontakt">Feedback und Kontakt</h2>
          <p>
            Ist Ihnen eine Barriere aufgefallen, die hier nicht steht? Oder brauchen Sie einen Inhalt in einer
            barrierefreien Form? Dann schreiben Sie uns bitte über das
            <a routerLink="/contact">Kontaktformular</a>. Wählen Sie dort beim Betreff „Fehler melden“.
          </p>
          <p>Das Kontaktformular können Sie auch ohne Anmeldung benutzen.</p>
        </section>

        <section class="abschnitt" aria-labelledby="bf-durchsetzung">
          <h2 id="bf-durchsetzung">Durchsetzungsverfahren</h2>
          <p>
            Für Websites und Apps des Bundes ist in Österreich die
            <strong>Österreichische Forschungsförderungsgesellschaft (FFG)</strong> die Beschwerdestelle
            (§ 5 WZG). Sie ist erreichbar unter: FFG, Sensengasse 1, 1090 Wien, elektronisch über das
            Kontaktformular der FFG.
          </p>
          <p>
            Eine Liste aller Beschwerdestellen in Österreich (Bund und Bundesländer) gibt es auf
            <a href="https://www.digitalbarrierefrei.at" target="_blank" rel="noopener">
              digitalbarrierefrei.at<span class="sr-only"> (öffnet in neuem Fenster)</span>
            </a>.
          </p>
          <p>
            Hinweis: Da CoinFinder ein Schulprojekt und keine öffentliche Stelle ist, gilt dieses Verfahren
            nicht direkt für diese App.
          </p>
        </section>

        <section class="abschnitt" aria-labelledby="bf-technik">
          <h2 id="bf-technik">Technische Informationen</h2>
          <ul>
            <li>Verwendete Technologien: HTML, CSS, TypeScript (Angular 17)</li>
            <li>Getestet mit: Google Chrome (aktuelle Version) und der Erweiterung WAVE</li>
          </ul>
        </section>
      </main>
    </div>
  `
})
export class BarrierefreiheitComponent {
  constructor(public auth: AuthService) {}
}
