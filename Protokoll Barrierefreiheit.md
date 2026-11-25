# Protokoll: CoinFinder barrierefrei machen

**Projekt:** CoinFinder (MEDT-Projekt aus der 4. Klasse)
**Ziel:** Die Web-App soll WCAG 2.2 AA erfüllen. Der Score soll bei mindestens 90 % liegen, und es soll keine kritischen Fehler mehr geben.
**Prüf-Werkzeug:** WAVE (Web Accessibility Evaluation Tool von WebAIM)

---

## 1. Ausgangslage (Ist-Analyse)

**Datum:** 25.11.2026
**Geprüfte Seite:** Dashboard (`http://localhost:3001/dashboard`)

### 1.1 Ergebnis von WAVE

![WAVE-Ergebnis vom Dashboard vor den Verbesserungen](<Bilder/Bildschirmfoto 2026-11-25 um 20.47.15.png>)

*Bild 1: Die Zusammenfassung von WAVE vor den Verbesserungen*

| Was WAVE zählt     | Anzahl |
|--------------------|-------:|
| Fehler (Errors)    | 0      |
| Kontrast-Fehler    | 8      |
| Warnungen (Alerts) | 9      |
| Features           | 1      |
| Struktur-Elemente  | 7      |
| ARIA               | 0      |
| **AIM Score**      | **6,5 von 10** |

Ein AIM Score von 6,5 von 10 sind **65 %**. Das Ziel sind mindestens **90 %**.

### 1.2 Wo die Probleme auf der Seite sind

![Dashboard mit den Markierungen von WAVE](<Bilder/Bildschirmfoto 2026-11-25 um 20.47.24.png>)

*Bild 2: Das Dashboard mit den Markierungen von WAVE. Rote Symbole sind Kontrast-Fehler, orange Symbole („Tr“) sind Warnungen für sehr kleine Schrift.*

Die meisten Markierungen sind an diesen Stellen:

- in der Seitenleiste beim Logo „CoinFinder“ und beim Wort „NAVIGATION“
- bei den Überschriften der 4 Karten („COINS BEOBACHTET“, „AKTIVE ALARME“, „TOP GEWINNER“, „TOP VERLIERER“)
- beim roten Prozent-Wert bei „Top Verlierer“
- beim Knopf oben rechts
- in der Tabelle „Aktuelle Kurse“ bei den kleinen grauen Namen neben den Coins (z. B. „RIPPLE“, „BITCOIN“)

---

## 2. Die Probleme in einfacher Sprache

### Problem 1: Zu wenig Kontrast (8 Kontrast-Fehler)

**Was ist das Problem?**
Manche Texte sind dunkelgrau auf fast schwarzem Hintergrund. Man kann sie kaum lesen. Für Menschen mit Sehschwäche sind sie unsichtbar. Das ist auch so bei hellem Sonnenlicht auf dem Handy.

**Was verlangt die Regel?**
WCAG 2.2 AA, Kriterium **1.4.3 Kontrast (Minimum)**: Normaler Text braucht einen Kontrast von mindestens **4,5 : 1**. Großer Text braucht mindestens **3 : 1**.

**Woher kommt es im Code?**
In `styles.css` gibt es die Farbe `--text-sehr-gedimmt: #4a4e66`. Auf dem Karten-Hintergrund `#1a1d27` hat sie nur einen Kontrast von etwa **2 : 1**. Diese Farbe wird an vielen Stellen benutzt, z. B. für „NAVIGATION“, für die Karten-Überschriften und für die Coin-Namen in der Tabelle.
Auch das Rot `--rot: #ef4444` ist auf dem dunklen Hintergrund knapp zu schwach (etwa 4,4 : 1).

**Mögliche Lösung:**
Die grauen Farben heller machen, bis der Kontrast mindestens 4,5 : 1 ist. Das Rot etwas heller machen.

---

### Problem 2: Sehr kleine Schrift (7 Warnungen)

**Was ist das Problem?**
Viele Texte sind nur **9 bis 11 Pixel** groß. Das ist für viele Menschen zu klein. Wer die Seite vergrößert, bekommt oft ein kaputtes Layout.

**Was verlangt die Regel?**
WCAG 2.2 AA, Kriterium **1.4.4 Textgröße ändern**: Man muss den Text auf 200 % vergrößern können, ohne dass Inhalt verloren geht. Sehr kleine, feste Pixel-Größen machen das schwer.

**Woher kommt es im Code?**
In mehreren Komponenten stehen feste Größen wie `font-size: 10px` oder `font-size: 11px`. Beispiele:
`dashboard.component.ts`, `layout.component.ts`, `watchlist.component.ts`, `prices.component.ts`, `alerts.component.ts`.

**Mögliche Lösung:**
Mindestens 12–14 Pixel verwenden. Besser `rem` statt `px` verwenden, damit die Schrift mit den Browser-Einstellungen mitwächst.

---

### Problem 3: Keine Überschriften-Struktur (1 Warnung)

**Was ist das Problem?**
Die Seite hat keine richtigen Überschriften (`<h1>`, `<h2>` …). „Dashboard“ sieht zwar wie eine Überschrift aus, ist im Code aber nur normaler Text. Ein Screenreader liest die Seite dann ohne Gliederung vor. Blinde Menschen können nicht von Abschnitt zu Abschnitt springen.

**Was verlangt die Regel?**
WCAG 2.2 AA, Kriterium **1.3.1 Info und Beziehungen** und **2.4.6 Überschriften und Beschriftungen**: Was wie eine Überschrift aussieht, muss auch im Code eine Überschrift sein.

**Mögliche Lösung:**
„Dashboard“ als `<h1>`, „Aktuelle Kurse“ und die Karten-Titel als `<h2>` auszeichnen.

---

### Problem 4: Hinweis wenn JavaScript aus ist (1 Warnung)

**Was ist das Problem?**
WAVE hat ein `<noscript>`-Element gefunden. Die App funktioniert nur mit JavaScript. Ohne JavaScript sieht man nichts.

**Mögliche Lösung:**
Im `<noscript>` einen klaren deutschen Hinweis einfügen, z. B. „Bitte aktiviere JavaScript, um CoinFinder zu nutzen.“ Diese Warnung ist nicht kritisch, sie muss nur geprüft werden.

---

### Weitere Punkte, die WAVE nicht direkt zeigt

Diese Punkte gehören auch zu WCAG 2.2 AA und sollen geprüft werden:

| Punkt | Problem | WCAG-Kriterium |
|-------|---------|----------------|
| Abmelde-Knopf | Der Knopf zeigt nur ein „✕“. Ein Screenreader weiß nicht genau, was der Knopf macht. | 4.1.2 Name, Rolle, Wert |
| Farbe allein | Gewinn und Verlust sind nur durch Grün und Rot erkennbar. Menschen mit Rot-Grün-Schwäche sehen den Unterschied schwer. | 1.4.1 Benutzung von Farbe |
| Tastatur | Es muss geprüft werden, ob man alles nur mit der Tastatur (Tab-Taste) bedienen kann und ob man immer sieht, wo man gerade ist (Fokus-Rahmen). | 2.1.1 Tastatur, 2.4.7 Fokus sichtbar |
| Live-Kurse | Die Kurse ändern sich automatisch. Ein Screenreader bekommt das nicht mit. | 4.1.3 Statusmeldungen |
| Barrierefreiheitserklärung | Die App hat noch keine Barrierefreiheitserklärung. Sie muss als eigene Unterseite mit gut sichtbarem Link auf der Startseite eingebaut werden. | Aufgabenstellung |

---

## 3. Plan: Was ich verbessern will

- [x] Kontrast-Farben in `styles.css` anpassen (Problem 1) → Schritt 2
- [x] Schriftgrößen vergrößern und auf `rem` umstellen (Problem 2) → Schritt 3
- [ ] Navigation bei 200 % Zoom / schmalem Bildschirm anzeigen (neu gefunden in Schritt 3)
- [x] Überschriften-Struktur einbauen (Problem 3) → Schritt 5
- [x] `<noscript>`-Hinweis prüfen (Problem 4) → Schritt 5
- [ ] Abmelde-Knopf beschriften
- [ ] Gewinn/Verlust nicht nur über Farbe zeigen
- [ ] Tastatur-Bedienung und Fokus prüfen
- [ ] Live-Kurse für Screenreader ansagen
- [x] Unterseite „Barrierefreiheitserklärung“ erstellen und verlinken → Schritt 6
- [ ] Alle Seiten erneut mit WAVE prüfen (Login, Dashboard, Watchlist, Alarme, Kurse, Kontakt)

---

## 4. Laufende Dokumentation der Änderungen

> Hier trage ich jeden Schritt ein, sobald ich ihn umgesetzt habe.

### Schritt 1: Kontaktformular hinzugefügt (Testobjekt)

**Datum:** 25.11.2026
**Hinweis:** Dieser Schritt wurde mit KI-Unterstützung (Claude Code) umgesetzt.

**Warum?**
Die App hatte bisher nur wenige Eingabefelder. Formulare sind aber ein wichtiger Teil der Barrierefreiheit. Gerade dort gibt es oft Probleme. Mit einem Kontaktformular kann ich die Barrierefreiheit besser testen.

**Was wurde gemacht?**
- Neue Seite **„Kontakt“** mit einem Kontaktformular.
- Neuer Link **„Kontakt“** (mit Brief-Symbol) in der Seitenleiste links, unter „Kurse“.
- Das Formular hat diese Felder: Name, E-Mail, Betreff (Auswahl), Nachricht und eine Checkbox für den Datenschutz.
- Beim Klick auf „Nachricht senden“ wird geprüft, ob alles ausgefüllt ist. Wenn etwas fehlt, kommt eine rote Fehlermeldung. Wenn alles passt, kommt die Meldung „Nachricht gesendet“.
- Die Nachricht wird **nicht** an den Server geschickt. Das Formular ist nur zum Testen da.
- Sonst wurde nichts an der App geändert.

**Geänderte Dateien:**

| Datei | Änderung |
|-------|----------|
| `frontend-angular/src/app/components/contact/contact.component.ts` | neu: die Kontakt-Seite mit dem Formular |
| `frontend-angular/src/app/app.routes.ts` | neue Route `/contact` |
| `frontend-angular/src/app/components/shared/layout/layout.component.ts` | neuer Link „Kontakt“ in der Seitenleiste |

**Das Formular ist im gleichen Stil gebaut wie der Rest der App.** Darum hat es wahrscheinlich die gleichen Barrieren. Diese Punkte will ich mit WAVE prüfen:

| Punkt | Mögliches Problem | WCAG-Kriterium |
|-------|-------------------|----------------|
| Beschriftungen | Die `<label>`-Texte sind nicht mit dem Eingabefeld verbunden (kein `for`/`id`). Ein Screenreader liest dann beim Feld keinen Namen vor. | 1.3.1, 3.3.2, 4.1.2 |
| Checkbox | Die Datenschutz-Checkbox hat keine richtige Beschriftung. Man kann nicht auf den Text klicken. | 3.3.2, 4.1.2 |
| Platzhalter-Text | Der graue Platzhalter („z.B. Max Mustermann“) hat wenig Kontrast. | 1.4.3 |
| Fehlermeldung | Die rote Fehlermeldung wird vom Screenreader nicht angesagt. Sie ist nur rot und klein. | 3.3.1, 4.1.3 |
| Pflichtfelder | Man sieht vorher nicht, welche Felder Pflicht sind. | 3.3.2 |
| Autovervollständigung | Name und E-Mail haben kein `autocomplete`. | 1.3.5 |

**Commit:**

**Ergebnis in WAVE (Kontakt-Seite, Ausgangszustand):**

![WAVE-Ergebnis der Kontakt-Seite vor den Verbesserungen](<Bilder/Bildschirmfoto 2026-11-25 um 21.00.01.png>)

*Bild 3: WAVE auf der neuen Kontakt-Seite. Links die Zusammenfassung, rechts die Markierungen im Formular.*

| Was WAVE zählt     | Anzahl |
|--------------------|-------:|
| Fehler (Errors)    | **4**  |
| Kontrast-Fehler    | 3      |
| Warnungen (Alerts) | 9      |
| Features           | 1      |
| Struktur-Elemente  | 2      |
| ARIA               | 0      |
| **AIM Score**      | **6,2 von 10 (62 %)** |

Die Vermutungen von oben haben sich bestätigt. Auf dieser Seite gibt es sogar **echte Fehler**. Auf dem Dashboard waren es 0.

**Was WAVE gefunden hat, in einfacher Sprache:**

1. **4 × Feld ohne Beschriftung (Missing form label), Fehler**
   Bei Name, E-Mail, Nachricht und der Checkbox weiß der Screenreader nicht, wie das Feld heißt. Ein blinder Mensch hört nur „Eingabefeld“ und weiß nicht, was er eintippen soll.
   *Grund:* Die `<label>` stehen zwar über dem Feld, sind aber nicht mit `for` und `id` verbunden.

2. **4 × Beschriftung ohne Feld (Orphaned form label), Warnung**
   Das ist dasselbe Problem von der anderen Seite. Die Texte „Name“, „E-Mail“, „Betreff“ und „Nachricht“ gehören zu keinem Feld.

3. **1 × Auswahlfeld ohne Beschriftung (Select missing label), Warnung**
   Das Auswahlfeld „Betreff“ hat keinen Namen für den Screenreader.

4. **3 × zu wenig Kontrast, Kontrast-Fehler**
   - Logo „CoinFinder“ in der Seitenleiste
   - das Wort „NAVIGATION“ (dunkelgrau auf dunkel)
   - der Knopf **„Nachricht senden“**: weiße Schrift auf Orange (`#f97316`) hat nur etwa **2,8 : 1**. Nötig sind 4,5 : 1.

5. **1 × keine Überschriften-Struktur, Warnung**
   „Kontakt“ sieht aus wie eine Überschrift, ist aber kein `<h1>`. Das ist wie bei Problem 3.

6. **2 × sehr kleine Schrift, Warnung**
   In der Seitenleiste („NAVIGATION“ und Verbindungs-Status).

7. **1 × `<noscript>`-Element, Warnung**
   Wie bei Problem 4.

**Was noch zu tun ist (Plan für das Formular):**

- [x] Jedes `<label>` mit `for="..."` und das Feld mit der passenden `id="..."` verbinden → Schritt 4
- [x] Die Checkbox mit dem Text in ein `<label>` packen → Schritt 4
- [x] Pflichtfelder kennzeichnen (z. B. „*“ und `required`) → Schritt 4
- [x] Fehlermeldung mit `role="alert"` versehen, damit der Screenreader sie vorliest → Schritt 4
- [x] `autocomplete="name"` und `autocomplete="email"` ergänzen → Schritt 4
- [x] Kontrast vom orangen Knopf verbessern (dunkleres Orange oder dunkle Schrift) → Schritt 2
- [x] „Kontakt“ als `<h1>` auszeichnen → Schritt 5

---

### Schritt 2: Kontrast verbessern

**Datum:** 25.11.2026
**Hinweis:** Dieser Schritt wurde mit KI-Unterstützung (Claude Code) umgesetzt.

**Was war das Problem?**
WAVE hat auf dem Dashboard 8 und auf der Kontakt-Seite 3 Kontrast-Fehler gefunden (WCAG 2.2 AA, Kriterium **1.4.3 Kontrast (Minimum)**). Normaler Text braucht mindestens **4,5 : 1**.
Die Ursachen waren wenige Farben, die an vielen Stellen benutzt werden:

| Wo | Farbe vorher | Kontrast vorher | Farbe nachher | Kontrast nachher |
|----|--------------|----------------:|---------------|-----------------:|
| „NAVIGATION“, Karten-Titel, Tabellenköpfe, Coin-Namen, Uhrzeit, Benutzer-Rolle | `#4a4e66` auf `#1a1d27` | 2,06 : 1 | `#8a8fa8` | **5,26 : 1** |
| Untertitel, Formular-Beschriftungen, Navigation | `#8a8fa8` auf `#1a1d27` | 5,26 : 1 | `#a3a8bf` | **7,13 : 1** |
| Roter Text (Top Verlierer, Fehlermeldungen, Kurs fällt) | `#ef4444` auf `#1a1d27` | 4,47 : 1 | `#f87171` | **6,08 : 1** |
| Knopf „Nachricht senden“ / „Anmelden“ | weiß auf `#f97316` | 2,80 : 1 | dunkel `#0f1117` auf `#f97316` | **6,73 : 1** |
| Logo-Symbol und Avatar-Buchstabe | weiß auf Orange | 2,80 : 1 | dunkel `#0f1117` auf Orange | **6,73 : 1** |
| Platzhalter in Formularfeldern („z.B. Max Mustermann“) | Chrome-Standard `#757575` | 3,27 : 1 | `#8a8fa8` | **4,72 : 1** |
| Achsen-Beschriftung im Kurs-Diagramm | `#4a4e66` | 2,06 : 1 | `#8a8fa8` | **5,26 : 1** |

Die Kontrastwerte habe ich mit der WCAG-Formel nachgerechnet. Zusätzlich habe ich auf allen Seiten (Dashboard, Watchlist, Alarme, Kurse, Kontakt) per Skript jeden sichtbaren Text gegen seinen Hintergrund geprüft: kein Text liegt mehr unter 4,5 : 1.

**Was habe ich im Code geändert?**

| Datei | Änderung |
|-------|----------|
| `frontend-angular/src/styles.css` | Farb-Variablen `--text-gedimmt`, `--text-sehr-gedimmt` und `--rot` heller gemacht; `.haupt-knopf` mit dunkler Schrift statt weiß; neue Regel `::placeholder` für die Platzhalter-Farbe |
| `frontend-angular/src/app/components/shared/layout/layout.component.ts` | Logo-Symbol und Avatar-Buchstabe mit dunkler Schrift (`color: var(--hintergrund)`) |
| `frontend-angular/src/app/components/login/login.component.ts` | Logo-Symbol mit dunkler Schrift |
| `frontend-angular/src/app/components/prices/prices.component.ts` | Achsen-Farbe im Diagramm von `#4a4e66` auf `#8a8fa8` |

Weil fast alle Farben als CSS-Variablen in `styles.css` stehen, reicht eine Änderung dort für die ganze App. Das Aussehen bleibt gleich (dunkles Design, oranger Akzent), die grauen Texte sind nur besser lesbar.

**Commit:**

**Vorher / Nachher im Browser:**

![Dashboard vorher](<Bilder/Schritt2 Kontrast vorher - dashboard.png>)

*Bild 4: Dashboard vorher. „NAVIGATION“, die Karten-Titel und die Coin-Namen sind kaum lesbar.*

![Dashboard nachher](<Bilder/Schritt2 Kontrast nachher - dashboard.png>)

*Bild 5: Dashboard nachher. Alle grauen Texte sind deutlich heller, der rote Wert bei „Top Verlierer“ ist besser lesbar.*

![Kontakt vorher](<Bilder/Schritt2 Kontrast vorher - contact.png>)

*Bild 6: Kontakt-Seite vorher. Der Knopf „Nachricht senden“ hat weiße Schrift auf Orange.*

![Kontakt nachher](<Bilder/Schritt2 Kontrast nachher - contact.png>)

*Bild 7: Kontakt-Seite nachher. Der Knopf hat dunkle Schrift, die Platzhalter sind besser lesbar.*

**Ergebnis in WAVE danach:**

Schritt 2 und Schritt 3 wurden gemeinsam mit WAVE geprüft. Das Ergebnis steht am Ende von Schritt 3.

---

### Schritt 3: Schriftgrößen vergrößern und auf `rem` umstellen

**Datum:** 25.11.2026
**Hinweis:** Dieser Schritt wurde mit KI-Unterstützung (Claude Code) umgesetzt.

**Was war das Problem?**
WAVE hat mehrere Warnungen „Very small text“ gezeigt (Problem 2). Viele Texte waren nur **9 bis 11,5 Pixel** groß, z. B. „NAVIGATION“, die Karten-Titel, die Coin-Namen in der Tabelle, die Benutzer-Rolle und die Status-Anzeigen bei den Alarmen.
Außerdem waren **alle** Schriftgrößen in festen Pixeln (`px`) angegeben. Wenn jemand im Browser eine größere Standard-Schrift einstellt, wächst die Schrift dann nicht mit (WCAG 2.2 AA, Kriterium **1.4.4 Textgröße ändern**).

**Was habe ich im Code geändert?**

1. **Mindestgröße 12 Pixel:** Alle Texte unter 12 px sind jetzt mindestens 12 px groß.
2. **`rem` statt `px`:** Alle Schriftgrößen sind von `px` in `rem` umgerechnet (1 rem = 16 px, die Standard-Schriftgröße des Browsers). Die Schrift richtet sich jetzt nach der Einstellung des Benutzers.
3. **Coin-Symbol in der Watchlist-Suche:** Der Kreis war nur 22 × 22 px groß. Er ist jetzt `1.75rem` (28 px), damit die größere Schrift hineinpasst.

| Größe vorher | Größe nachher | Wo zum Beispiel |
|-------------:|--------------:|-----------------|
| 9 px | 0.75rem (12 px) | Coin-Symbol in der Watchlist-Suche |
| 10 px | 0.75rem (12 px) | „NAVIGATION“, Benutzer-Rolle, Coin-Namen, Alarm-Status |
| 11 px | 0.75rem (12 px) | Karten-Titel, Tabellenköpfe, Uhrzeit, Verbindungs-Status |
| 11,5 px | 0.75rem (12 px) | Formular-Beschriftungen, Fehlertexte, Zeitraum-Knöpfe |
| 12 – 24 px | gleiche Größe in `rem` (z. B. 13 px → 0.8125rem) | restliche Texte |

**Geänderte Dateien:**

| Datei | Änderung |
|-------|----------|
| `frontend-angular/src/styles.css` | Schriftgrößen in `rem`, Minimum 12 px |
| `.../components/shared/layout/layout.component.ts` | Seitenleiste: „NAVIGATION“, Status, Benutzer-Rolle |
| `.../components/dashboard/dashboard.component.ts` | Karten-Titel, Coin-Namen, Uhrzeit |
| `.../components/watchlist/watchlist.component.ts` | Coin-Namen, Coin-Symbol (Kreis größer) |
| `.../components/alerts/alerts.component.ts` | Status-Anzeige der Alarme |
| `.../components/prices/prices.component.ts` | Zeitraum-Knöpfe, „Letzte Aktualisierung“ |
| `.../components/login/login.component.ts`, `.../contact/contact.component.ts`, `.../notification/notification.component.ts` | Schriftgrößen in `rem` |

**Commit:**

**Vorher / Nachher im Browser:**

![Dashboard vorher](<Bilder/Schritt3 Schriftgröße vorher - dashboard.png>)

*Bild 8: Dashboard vorher. „NAVIGATION“, die Karten-Titel und die Coin-Namen sind sehr klein.*

![Dashboard nachher](<Bilder/Schritt3 Schriftgröße nachher - dashboard.png>)

*Bild 9: Dashboard nachher. Die kleinen Texte sind jetzt mindestens 12 px groß. Das Layout bleibt gleich.*

![Watchlist nachher](<Bilder/Schritt3 Schriftgröße nachher - watchlist.png>)

*Bild 10: Watchlist nachher. Die Coin-Namen neben dem Kürzel sind besser lesbar.*

**Test mit 200 % Zoom:**

![Dashboard bei 200 % Zoom](<Bilder/Schritt3 Zoom 200 Prozent - dashboard.png>)

*Bild 11: Dashboard bei 200 % Zoom. Die Texte sind gut lesbar und nichts wird abgeschnitten. **Aber die Seitenleiste mit der Navigation ist verschwunden.***

**Neues Problem gefunden:** Ab einer Breite unter 900 px blendet die App die Seitenleiste mit `display: none` komplett aus (`layout.component.ts`). Bei 200 % Zoom oder auf dem Handy kann man dann **nicht mehr zu anderen Seiten wechseln** und sich nicht abmelden. Das verletzt WCAG 2.2 AA, Kriterium **1.4.10 Umbruch (Reflow)** und **1.4.4 Textgröße ändern** (Inhalt geht verloren). Das behebe ich in einem eigenen Schritt.

**Ergebnis in WAVE danach (nach Schritt 2 und 3):**

![WAVE-Zusammenfassung Dashboard nach Schritt 3](<Bilder/Bildschirmfoto 2026-11-25 um 21.26.36.png>)

*Bild 12: WAVE auf dem Dashboard nach Schritt 2 und 3. Keine Fehler, keine Kontrast-Fehler, AIM Score 10 von 10.*

![Dashboard mit WAVE-Markierungen nach Schritt 3](<Bilder/Bildschirmfoto 2026-11-25 um 21.26.42.png>)

*Bild 13: Das Dashboard mit den WAVE-Markierungen. Es gibt keine roten Kontrast-Symbole und keine „Tr“-Symbole für kleine Schrift mehr.*

![WAVE auf der Kontakt-Seite nach Schritt 3](<Bilder/Bildschirmfoto 2026-11-25 um 21.27.10.png>)

*Bild 14: WAVE auf der Kontakt-Seite nach Schritt 2 und 3. Die Kontrast-Fehler sind weg. Die Fehler bei den Formular-Beschriftungen sind noch da.*

| Was WAVE zählt | Dashboard vorher | Dashboard nachher | Kontakt vorher | Kontakt nachher |
|----------------|-----------------:|------------------:|---------------:|----------------:|
| Fehler | 0 | 0 | 4 | 4 |
| Kontrast-Fehler | 8 | **0** | 3 | **0** |
| Warnungen | 9 | **2** | 9 | **7** |
| AIM Score | 6,5 (65 %) | **10 (100 %)** | 6,2 (62 %) | **7,4 (74 %)** |

**Was das bedeutet:**

- **Alle Kontrast-Fehler sind behoben**, auf dem Dashboard (8 → 0) und auf der Kontakt-Seite (3 → 0). Das ist der Erfolg von Schritt 2.
- **Alle Warnungen „sehr kleine Schrift“ sind weg**: Auf dem Dashboard fallen 7 Warnungen weg, auf der Kontakt-Seite 2. Das ist der Erfolg von Schritt 3.
- Das **Dashboard** erreicht schon **10 von 10**, also mehr als die geforderten 90 %.
- Übrig sind auf dem Dashboard 2 Warnungen: **keine Überschriften-Struktur** (Problem 3) und das **`<noscript>`-Element** (Problem 4).
- Die **Kontakt-Seite** liegt bei **7,4 von 10**. Hier fehlen noch die Verbindungen zwischen Beschriftung und Feld (4 Fehler „Missing form label“, 4 × „Orphaned form label“, 1 × „Select missing label“). Das ist der nächste wichtige Schritt.

---

### Schritt 4: Formular-Beschriftungen, Pflichtfelder und Fehlermeldungen

**Datum:** 25.11.2026
**Hinweis:** Dieser Schritt wurde mit KI-Unterstützung (Claude Code) umgesetzt.

**Was war das Problem?**
WAVE hat auf der Kontakt-Seite **4 Fehler „Missing form label“** gefunden, dazu 4 Warnungen „Orphaned form label“ und 1 Warnung „Select missing label“ (siehe Schritt 1).
Die Beschriftungen (`<label>`) standen zwar über den Feldern, waren aber **nicht mit ihnen verbunden**. Ein Screenreader sagt dann nur „Eingabefeld“ und nicht, was man eintippen soll. Beim Prüfen hat sich gezeigt: **Watchlist, Alarme und Login** haben genau dasselbe Problem.
Dazu kamen:
- Man sah vorher nicht, welche Felder Pflicht sind.
- Die Fehlermeldungen wurden vom Screenreader nicht vorgelesen.
- Bei der Datenschutz-Checkbox konnte man nicht auf den Text klicken.
- Name, E-Mail, Benutzername und Passwort hatten kein `autocomplete`. Der Browser konnte sie also nicht automatisch ausfüllen.

**Betroffene WCAG-Kriterien:** 1.3.1 Info und Beziehungen, 1.3.5 Bestimmung des Eingabezwecks, 3.3.1 Fehlererkennung, 3.3.2 Beschriftungen oder Anweisungen, 4.1.2 Name, Rolle, Wert, 4.1.3 Statusmeldungen

**Was habe ich im Code geändert?**

1. **Beschriftung mit Feld verbunden:** Jedes Feld hat eine eindeutige `id`, und das `<label>` zeigt mit `for` darauf.
   Vorher: `<label class="feld-beschriftung">Name</label>` + `<input class="feld-input" ...>`
   Nachher: `<label class="feld-beschriftung" for="kontakt-name">Name *</label>` + `<input class="feld-input" id="kontakt-name" ...>`
   Jetzt liest der Screenreader „Name, Pflichtfeld, Eingabefeld“ vor. Außerdem kommt man mit einem Klick auf die Beschriftung ins Feld.
2. **Checkbox:** Der Text „Ich bin mit der Verarbeitung meiner Daten einverstanden.“ war ein `<span>`. Jetzt ist er ein `<label for="kontakt-datenschutz">`, und man kann auch auf den Text klicken.
3. **Pflichtfelder:** Pflichtfelder haben das Attribut `required`, das der Screenreader als „Pflichtfeld“ ansagt. Sichtbar sind sie mit einem orangen `*` markiert. Über jedem Formular steht „Felder mit * sind Pflichtfelder.“ Das `*` hat `aria-hidden="true"`, damit der Screenreader nicht „Stern“ vorliest.
4. **Fehlermeldungen:** Die roten Fehlermeldungen haben `role="alert"`. Der Screenreader liest sie sofort vor, wenn sie erscheinen.
5. **Autovervollständigung:** `autocomplete="name"`, `"email"`, `"username"` und `"current-password"` ergänzt. Beim Suchfeld in der Watchlist steht `autocomplete="off"`, damit die Vorschläge des Browsers nicht die eigene Coin-Liste verdecken.

**Geänderte Dateien:**

| Datei | Änderung |
|-------|----------|
| `.../components/contact/contact.component.ts` | 5 Felder mit `for`/`id`, Checkbox-Label, `required`, `autocomplete`, `role="alert"`, Pflichtfeld-Hinweis |
| `.../components/watchlist/watchlist.component.ts` | 3 Felder mit `for`/`id`, `required`, `role="alert"`, Pflichtfeld-Hinweis |
| `.../components/alerts/alerts.component.ts` | 3 Felder mit `for`/`id`, `required`, `role="alert"`, Pflichtfeld-Hinweis |
| `.../components/login/login.component.ts` | 2 Felder mit `for`/`id`, `autocomplete`, `role="alert"` |
| `frontend-angular/src/styles.css` | neue Klassen `.pflicht` (oranges Sternchen, 7,4 : 1) und `.pflicht-hinweis` |

**Überprüfung:** Per Skript habe ich für jedes Feld geprüft, ob der Browser die Beschriftung zuordnet. Alle 13 Felder (Kontakt 5, Watchlist 3, Alarme 3, Login 2) haben jetzt ein Label. Die Fehlermeldung im Kontaktformular erscheint mit `role="alert"`.

**Commit:**

**Vorher / Nachher im Browser:**

![Kontakt vorher](<Bilder/Schritt4 Formulare vorher - contact.png>)

*Bild 15: Kontakt-Seite vorher. Man sieht nicht, welche Felder Pflicht sind.*

![Kontakt nachher mit Fehlermeldung](<Bilder/Schritt4 Formulare nachher - contact Fehlermeldung.png>)

*Bild 16: Kontakt-Seite nachher, nach einem Klick auf „Nachricht senden“ mit leerem Formular. Pflichtfelder sind mit * markiert, die Fehlermeldung wird vom Screenreader vorgelesen.*

![Alarme nachher](<Bilder/Schritt4 Formulare nachher - alerts.png>)

*Bild 17: Alarme nachher. Auch hier sind die Pflichtfelder markiert und die Beschriftungen verbunden.*

**Noch gefunden (für später):** Die Vorschlagsliste der Coin-Suche in der Watchlist besteht aus `<div>`-Elementen mit Klick. Mit der Tastatur kann man sie nicht auswählen (WCAG 2.1.1 Tastatur). Das gehört zum Schritt „Tastatur-Bedienung“.

**Ergebnis in WAVE danach:**

![WAVE auf der Kontakt-Seite nach Schritt 4](<Bilder/Bildschirmfoto 2026-11-25 um 21.36.07.png>)

*Bild 18: WAVE auf der Kontakt-Seite nach Schritt 4. Keine Fehler mehr, AIM Score 10 von 10. Die grünen Symbole zeigen die 5 richtig verbundenen Beschriftungen („Form label“).*

| Was WAVE zählt | Kontakt vor Schritt 4 | Kontakt nach Schritt 4 |
|----------------|----------------------:|-----------------------:|
| Fehler | 4 | **0** |
| Kontrast-Fehler | 0 | 0 |
| Warnungen | 7 | **2** |
| Features | 1 | **6** |
| ARIA | 0 | 5 |
| AIM Score | 7,4 (74 %) | **10 (100 %)** |

**Was das bedeutet:**

- Die **4 Fehler „Missing form label“** sind behoben. WAVE zeigt stattdessen **5 × „Form label“** als positives Merkmal (Features).
- Die Warnungen **„Orphaned form label“ (4×)** und **„Select missing label“ (1×)** sind weg.
- Die **5 × „ARIA hidden“** sind die orangen Sternchen mit `aria-hidden="true"`. Das ist Absicht: Der Screenreader soll nicht „Stern“ vorlesen, weil das Feld schon durch `required` als Pflichtfeld angesagt wird. WAVE zeigt das nur zur Kontrolle an, es ist kein Fehler.
- Übrig sind die gleichen 2 Warnungen wie auf dem Dashboard: **keine Überschriften-Struktur** und **`<noscript>`-Element**.

---

### Schritt 5: Überschriften-Struktur und `<noscript>`-Hinweis

**Datum:** 25.11.2026
**Hinweis:** Dieser Schritt wurde mit KI-Unterstützung (Claude Code) umgesetzt.

**Was war das Problem?**
Nach Schritt 4 hatten Dashboard und Kontakt-Seite noch je 2 Warnungen in WAVE:

1. **„No heading structure“** (Problem 3): Keine Seite hatte echte Überschriften. „Dashboard“, „Kontakt“ usw. sahen zwar groß und fett aus, waren im Code aber nur `<div>`. Screenreader-Nutzer springen normalerweise mit der Taste „H“ von Überschrift zu Überschrift. Das ging nicht. (WCAG **1.3.1 Info und Beziehungen**, **2.4.6 Überschriften und Beschriftungen**)
2. **„Noscript element“** (Problem 4): Das `<noscript>` stand gar nicht in meiner `index.html`. Angular setzt es beim Bauen selbst ein, weil es das CSS „kritisch“ einbettet (`inlineCritical`). Darin stand nur ein Stylesheet-Link: `<noscript><link rel="stylesheet" href="styles-….css"></noscript>`. Wer JavaScript ausgeschaltet hat, sah also eine leere Seite **ohne Erklärung**.

**Was habe ich im Code geändert?**

**1. Überschriften:** Auf jeder Seite ist der Seitentitel jetzt ein `<h1>`, die Titel der Karten sind `<h2>`. Die CSS-Klassen bleiben gleich, deshalb sieht alles aus wie vorher.

Vorher: `<div class="titel">Dashboard</div>`
Nachher: `<h1 class="titel">Dashboard</h1>`

| Seite | `<h1>` | `<h2>` |
|-------|--------|--------|
| Dashboard | Dashboard | Coins beobachtet, Aktive Alarme, Top Gewinner, Top Verlierer, Aktuelle Kurse |
| Watchlist | Watchlist | Coin hinzufügen, Beobachtete Coins |
| Alarme | Alarme | Neuen Alarm erstellen, So funktionieren Alarme, Alle Alarme |
| Kurse | Kurse | Kursverlauf, Aktuelle Preise |
| Kontakt | Kontakt | Kontaktformular |
| Login | Willkommen zurück | – |

Die Emojis in den Karten-Titeln (✉️, ➕, 🔔, ℹ️) stehen jetzt in `<span aria-hidden="true">`. Sonst würde der Screenreader z. B. „Briefumschlag Kontaktformular“ vorlesen.
In `styles.css` steht die Regel `h1, h2 { font-size: inherit; font-weight: inherit; }`. Damit übernimmt der Browser nicht seine eigenen großen Standard-Größen für Überschriften. Die Größe kommt weiter aus den Klassen.

**2. `<noscript>`-Hinweis:**
- In `angular.json` ist `inlineCritical` ausgeschaltet. Angular setzt sein leeres `<noscript>` nicht mehr ein.
- In `index.html` steht ein eigener, verständlicher Hinweis: „CoinFinder braucht JavaScript. Bitte aktiviere JavaScript in deinem Browser, um die App zu nutzen.“ (heller Text auf dunklem Hintergrund, 18 px groß)

WAVE meldet `<noscript>` trotzdem weiter als **Warnung**. Das ist kein Fehler: WAVE zeigt jedes `<noscript>` an, damit man prüft, ob der Inhalt sinnvoll ist. Das habe ich geprüft, der Hinweis ist jetzt verständlich und gut lesbar.

**Geänderte Dateien:**

| Datei | Änderung |
|-------|----------|
| `.../dashboard/dashboard.component.ts` | `<h1>` + 5 × `<h2>` |
| `.../watchlist/watchlist.component.ts` | `<h1>` + 2 × `<h2>`, Emoji versteckt |
| `.../alerts/alerts.component.ts` | `<h1>` + 3 × `<h2>`, Emojis versteckt |
| `.../prices/prices.component.ts` | `<h1>` + 2 × `<h2>` |
| `.../contact/contact.component.ts` | `<h1>` + `<h2>`, Emoji versteckt |
| `.../login/login.component.ts` | „Willkommen zurück“ von `<h2>` auf `<h1>` |
| `frontend-angular/src/styles.css` | Regel `h1, h2 { font-size: inherit; font-weight: inherit; }` |
| `frontend-angular/src/index.html` | eigener `<noscript>`-Hinweis auf Deutsch |
| `frontend-angular/angular.json` | `inlineCritical: false` im Production-Build |

**Überprüfung:** Ein Skript hat auf jeder Seite alle Überschriften ausgelesen. Jede Seite hat genau eine `<h1>` und darunter `<h2>`, es wird keine Ebene übersprungen. In der ausgelieferten Seite steht nur noch mein eigenes `<noscript>`.

**Commit:**

**Vorher / Nachher im Browser:**

![Dashboard vorher](<Bilder/Schritt5 Überschriften vorher - dashboard.png>)

*Bild 19: Dashboard vorher.*

![Dashboard nachher](<Bilder/Schritt5 Überschriften nachher - dashboard.png>)

*Bild 20: Dashboard nachher. Optisch hat sich nichts geändert, im Code sind „Dashboard“ jetzt `<h1>` und die Karten-Titel `<h2>`.*

**Hinweis:** Das Diagramm „Kursverlauf“ auf der Kurse-Seite ist auf den Screenshots leer, schon **vor** dieser Änderung (siehe `Schritt5 Überschriften vorher - prices.png`). Wahrscheinlich liefert die CoinGecko-API gerade keine Verlaufsdaten. Das hat nichts mit der Barrierefreiheit zu tun.

**Ergebnis in WAVE danach:**

![WAVE-Zusammenfassung Dashboard nach Schritt 5](<Bilder/Bildschirmfoto 2026-11-25 um 21.43.12.png>)

*Bild 21: WAVE auf dem Dashboard nach Schritt 5. Nur noch 1 Warnung (`<noscript>`). Neu unter „Structural Elements“: 1 × Heading level 1 und 5 × Heading level 2.*

![Dashboard mit WAVE-Markierungen nach Schritt 5](<Bilder/Bildschirmfoto 2026-11-25 um 21.43.20.png>)

*Bild 22: Das Dashboard mit den WAVE-Markierungen. Man sieht „h1“ bei „Dashboard“ und „h2“ bei den Karten-Titeln.*

![WAVE auf der Kontakt-Seite nach Schritt 5](<Bilder/Bildschirmfoto 2026-11-25 um 21.43.39.png>)

*Bild 23: WAVE auf der Kontakt-Seite nach Schritt 5. „h1“ bei „Kontakt“, „h2“ bei „Kontaktformular“, nur noch 1 Warnung.*

| Was WAVE zählt | Dashboard vor Schritt 5 | Dashboard nach Schritt 5 | Kontakt vor Schritt 5 | Kontakt nach Schritt 5 |
|----------------|------------------------:|-------------------------:|----------------------:|-----------------------:|
| Fehler | 0 | 0 | 0 | 0 |
| Kontrast-Fehler | 0 | 0 | 0 | 0 |
| Warnungen | 2 | **1** | 2 | **1** |
| Struktur | 7 | **13** | 2 | **4** |
| ARIA | 0 | 0 | 5 | 6 |
| AIM Score | 10 | 10 | 10 | 10 |

**Was das bedeutet:**

- **„No heading structure“ ist auf beiden Seiten weg.** WAVE zählt jetzt die Überschriften als Struktur-Elemente: Dashboard 1 × `h1` + 5 × `h2`, Kontakt 1 × `h1` + 1 × `h2`.
- Übrig ist nur noch **„Noscript element“**. Das ist jetzt mein eigener deutscher Hinweis. WAVE zeigt jedes `<noscript>` als Warnung an, damit man den Inhalt prüft. Der Inhalt ist sinnvoll, darum bleibt das Element absichtlich drin.
- Bei ARIA ist auf der Kontakt-Seite ein „ARIA hidden“ dazugekommen (6 statt 5). Das ist das versteckte Emoji ✉️ im Titel „Kontaktformular“, ebenfalls Absicht.

---

### Schritt 6: Barrierefreiheitserklärung als eigene Unterseite

**Datum:** 25.11.2026
**Hinweis:** Der Text der Erklärung wurde mit KI-Unterstützung (Claude Code) formuliert. Das ist laut Aufgabenstellung erlaubt. Der Code der Unterseite wurde ebenfalls mit KI-Unterstützung umgesetzt.

**Was war das Problem?**
Die App hatte **keine Barrierefreiheitserklärung**. Die Aufgabenstellung verlangt eine eigene Unterseite, die über einen **gut sichtbaren Link direkt von der Startseite** erreichbar ist. Auch das österreichische Web-Zugänglichkeits-Gesetz (§ 4 WZG) verlangt für öffentliche Stellen, dass die Erklärung über die Startseite erreichbar ist.

**Aufbau der Erklärung**
Die Erklärung folgt der EU-Mustererklärung (Durchführungsbeschluss (EU) 2018/1523) und dem Muster der FFG. Sie enthält alle Pflichtinhalte aus meiner Recherche:

| Pflichtinhalt | Was in der Erklärung steht |
|---------------|----------------------------|
| Geltungsbereich | Web-App CoinFinder, Schulprojekt MEDT. Freiwillige Erklärung, weil CoinFinder keine öffentliche Stelle ist |
| Stand der Vereinbarkeit | **teilweise vereinbar** mit WCAG 2.2 AA |
| Nicht barrierefreie Inhalte | Navigation bei 200 % Zoom, Coin-Vorschläge per Tastatur, Abmelde-Knopf, Gewinn/Verlust nur über Farbe, Live-Kurse, Kurs-Diagramm ohne Textalternative; Inhalte Dritter (CoinGecko). Jeweils mit WCAG-Kriterium und, wo möglich, mit Alternative |
| Erstellung | 25.11.2026, Selbstbewertung mit WAVE und manueller Prüfung |
| Feedback und Kontakt | Link zum Kontaktformular (Betreff „Fehler melden“) |
| Durchsetzungsverfahren | FFG als Beschwerdestelle des Bundes (§ 5 WZG), Sensengasse 1, 1090 Wien; Link zu digitalbarrierefrei.at mit allen Beschwerdestellen |
| freiwillig: Technik | HTML, CSS, TypeScript (Angular 17); getestet mit Chrome und WAVE |

**Warum „teilweise vereinbar“ und nicht „vollständig“?** WAVE zeigt zwar 10 von 10, aber WAVE prüft nur einen Teil der WCAG-Kriterien automatisch. Bei meinen eigenen Tests habe ich noch Barrieren gefunden (siehe oben). Eine ehrliche Erklärung muss diese nennen. Sobald ich sie behebe, aktualisiere ich die Erklärung.

**Was habe ich im Code geändert?**

1. **Neue Unterseite** `/barrierefreiheit` (neue Komponente `BarrierefreiheitComponent`):
   - Die Seite ist **ohne Anmeldung** erreichbar, weil sie öffentlich sein muss.
   - Sie ist selbst barrierefrei: eine `<h1>`, je Abschnitt eine `<h2>` (Unterpunkte `<h3>`), echte Listen (`<ul>`), Abschnitte als `<section>` mit `aria-labelledby`, ein `<main>`-Bereich, unterstrichene Links und Kontrast über 4,5 : 1.
   - Sie hat einen eigenen Seitentitel im Browser-Tab: „Erklärung zur Barrierefreiheit – CoinFinder“ (WCAG 2.4.2).
   - Oben steht ein Link „← Zurück zu CoinFinder“: angemeldet führt er zum Dashboard, sonst zum Login.
   - Der externe Link zu digitalbarrierefrei.at hat einen versteckten Hinweis „(öffnet in neuem Fenster)“ für Screenreader. Dafür gibt es die neue Hilfsklasse `.sr-only` in `styles.css`.
2. **Gut sichtbare Links von der Startseite:**
   - **Login-Seite** (Startseite für alle, die nicht angemeldet sind): unter dem Knopf „Einloggen“ der orange, unterstrichene Link „Erklärung zur Barrierefreiheit“.
   - **Seitenleiste** (auf dem Dashboard, der Startseite nach dem Login, und auf allen anderen Seiten): neuer Menüpunkt „♿ Barrierefreiheit“ direkt unter „Kontakt“.
3. **Kontaktformular ohne Anmeldung:** Die Route `/contact` braucht keine Anmeldung mehr. Wer eine Barriere melden will, braucht dafür kein Konto. Sonst wäre der Feedback-Weg selbst eine Barriere.

**Geänderte Dateien:**

| Datei | Änderung |
|-------|----------|
| `.../components/barrierefreiheit/barrierefreiheit.component.ts` | **neu:** die Seite mit der Erklärung |
| `frontend-angular/src/app/app.routes.ts` | neue öffentliche Route `/barrierefreiheit` mit Seitentitel; `/contact` ohne Anmeldung |
| `.../components/login/login.component.ts` | Link „Erklärung zur Barrierefreiheit“ unter dem Login-Knopf |
| `.../components/shared/layout/layout.component.ts` | Menüpunkt „Barrierefreiheit“ in der Seitenleiste |
| `frontend-angular/src/styles.css` | Hilfsklasse `.sr-only` (Text nur für Screenreader) |

**Überprüfung:** Ohne Anmeldung habe ich Login, Erklärung und Kontakt geöffnet. Alle drei Seiten öffnen sich, und es gibt keinen Text unter 4,5 : 1. Die Erklärung hat die Gliederung `h1` → 7 × `h2` → 2 × `h3`.

**Commit:**

**Vorher / Nachher im Browser:**

![Login vorher](<Bilder/Schritt6 Erklärung vorher - login.png>)

*Bild 24: Login-Seite vorher. Es gibt keinen Link zu einer Barrierefreiheitserklärung.*

![Login nachher](<Bilder/Schritt6 Erklärung nachher - login ohne Anmeldung.png>)

*Bild 25: Login-Seite nachher. Unter dem Knopf steht der Link „Erklärung zur Barrierefreiheit“.*

![Dashboard nachher](<Bilder/Schritt6 Erklärung nachher - dashboard.png>)

*Bild 26: Dashboard nachher. In der Seitenleiste ist der neue Menüpunkt „Barrierefreiheit“.*

![Die neue Seite Erklärung zur Barrierefreiheit](<Bilder/Schritt6 Erklärung nachher - barrierefreiheit ohne Anmeldung.png>)

*Bild 27: Die neue Unterseite „Erklärung zur Barrierefreiheit“, ohne Anmeldung geöffnet.*

**Ergebnis in WAVE danach:**

![WAVE-Zusammenfassung der Erklärungs-Seite](<Bilder/Bildschirmfoto 2026-11-25 um 21.53.02.png>)

*Bild 28: WAVE auf der Seite „Erklärung zur Barrierefreiheit“. 0 Fehler, AIM Score 10 von 10. WAVE erkennt 1 × h1, 7 × h2, 2 × h3, 3 Listen und den Hauptbereich.*

![Erklärungs-Seite mit WAVE-Markierungen](<Bilder/Bildschirmfoto 2026-11-25 um 21.53.06.png>)

*Bild 29: Die Erklärungs-Seite mit den WAVE-Markierungen. Die violetten Symbole zeigen die Abschnitte, die mit `aria-labelledby` nach ihrer Überschrift benannt sind.*

![WAVE-Zusammenfassung der Login-Seite](<Bilder/Bildschirmfoto 2026-11-25 um 21.53.57.png>)

*Bild 30: WAVE auf der Login-Seite. 0 Fehler, AIM Score 10 von 10, 2 Warnungen.*

![Login-Seite mit WAVE-Markierungen](<Bilder/Bildschirmfoto 2026-11-25 um 21.54.00.png>)

*Bild 31: Die Login-Seite mit den WAVE-Markierungen. Die beiden Felder sind richtig beschriftet („Form label“), der Link zur Erklärung ist unter dem Knopf.*

| Was WAVE zählt | Erklärung (`/barrierefreiheit`) | Login |
|----------------|--------------------------------:|------:|
| Fehler | 0 | 0 |
| Kontrast-Fehler | 0 | 0 |
| Warnungen | 1 | 2 |
| Features | 1 | 3 |
| Struktur | 14 | 1 |
| ARIA | 7 | 0 |
| AIM Score | **10 (100 %)** | **10 (100 %)** |

**Was das bedeutet:**

- Die **Erklärung** ist selbst barrierefrei: keine Fehler, saubere Gliederung. Die **7 × „ARIA label“** sind die 7 Abschnitte (`<section aria-labelledby="...">`). So weiß ein Screenreader, wie jeder Abschnitt heißt. Die einzige Warnung ist wieder das beabsichtigte `<noscript>`.
- Die **Login-Seite** hat keine Fehler. Die 2 Formularfelder sind richtig beschriftet (aus Schritt 4).
- **Neue Warnung auf der Login-Seite: „No page regions“.** Die Login-Seite hat keinen Seitenbereich wie `<main>` oder `<nav>`. Screenreader-Nutzer können dann nicht direkt zum Hauptinhalt springen (WCAG 1.3.1). Auf den anderen Seiten gibt es diese Bereiche schon aus dem Layout. Das ist schnell zu beheben: Der äußere Rahmen der Login-Seite muss ein `<main>` werden.

---

### Schritt 7: …

**Datum:**
**Was war das Problem?**
**Was habe ich im Code geändert?** (Datei + kurze Beschreibung)
**Commit:**
**Ergebnis in WAVE danach:**

---

## 5. Endergebnis

**Zwischenstand nach Schritt 6 (25.11.2026):**

| Seite | Fehler vorher | Fehler jetzt | Kontrast-Fehler vorher | Kontrast-Fehler jetzt | Warnungen vorher | Warnungen jetzt | AIM Score vorher | AIM Score jetzt |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Dashboard | 0 | 0 | 8 | **0** | 9 | **1** | 6,5 (65 %) | **10 (100 %)** |
| Kontakt | 4 | **0** | 3 | **0** | 9 | **1** | 6,2 (62 %) | **10 (100 %)** |
| Erklärung (neu) | – | 0 | – | 0 | – | 1 | – | **10 (100 %)** |
| Login | – | 0 | – | 0 | – | 2 | – | **10 (100 %)** |

Das Ziel von mindestens 90 % ohne kritische Fehler ist auf allen geprüften Seiten erreicht. Die Barrierefreiheitserklärung ist als eigene Unterseite eingebaut und von der Startseite verlinkt.
Die Warnung `<noscript>` ist geprüft und beabsichtigt.
Offen sind noch: „No page regions“ auf der Login-Seite, Navigation bei 200 % Zoom, Tastatur-Bedienung, Abmelde-Knopf, Gewinn/Verlust nicht nur über Farbe, Live-Kurse für Screenreader.
