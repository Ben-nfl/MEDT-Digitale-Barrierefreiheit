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
- [ ] Überschriften-Struktur einbauen (Problem 3)
- [ ] `<noscript>`-Hinweis prüfen (Problem 4)
- [ ] Abmelde-Knopf beschriften
- [ ] Gewinn/Verlust nicht nur über Farbe zeigen
- [ ] Tastatur-Bedienung und Fokus prüfen
- [ ] Live-Kurse für Screenreader ansagen
- [ ] Unterseite „Barrierefreiheitserklärung“ erstellen und verlinken
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

- [ ] Jedes `<label>` mit `for="..."` und das Feld mit der passenden `id="..."` verbinden
- [ ] Die Checkbox mit dem Text in ein `<label>` packen
- [ ] Pflichtfelder kennzeichnen (z. B. „*“ und `required`)
- [ ] Fehlermeldung mit `role="alert"` versehen, damit der Screenreader sie vorliest
- [ ] `autocomplete="name"` und `autocomplete="email"` ergänzen
- [x] Kontrast vom orangen Knopf verbessern (dunkleres Orange oder dunkle Schrift) → Schritt 2
- [ ] „Kontakt“ als `<h1>` auszeichnen

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

### Schritt 4: …

**Datum:**
**Was war das Problem?**
**Was habe ich im Code geändert?** (Datei + kurze Beschreibung)
**Commit:**
**Ergebnis in WAVE danach:**

---

## 5. Endergebnis

**Zwischenstand nach Schritt 3 (25.11.2026):**

| | Dashboard vorher | Dashboard jetzt | Kontakt vorher | Kontakt jetzt |
|---|---:|---:|---:|---:|
| Fehler | 0 | 0 | 4 | 4 |
| Kontrast-Fehler | 8 | 0 | 3 | 0 |
| Warnungen | 9 | 2 | 9 | 7 |
| AIM Score | 6,5 / 10 (65 %) | 10 / 10 (100 %) | 6,2 / 10 (62 %) | 7,4 / 10 (74 %) |
