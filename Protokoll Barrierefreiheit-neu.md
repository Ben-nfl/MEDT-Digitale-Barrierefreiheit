# Protokoll: CoinFinder barrierefrei machen

**Name:** Ben Neunteufel
**Klasse:** 5AHITS
**Fach:** MEDT
**Projekt:** CoinFinder (MEDT-Projekt aus der 4. Klasse)
**Ziel:** Die Web-App soll WCAG 2.2 AA erfüllen. Der Score soll bei mindestens 90 % liegen, und es soll keine kritischen Fehler mehr geben.
**Prüf-Werkzeug:** WAVE (Web Accessibility Evaluation Tool von WebAIM)
**Datum:** 25.11.2026
**Hinweis:** Die Änderungen am Code wurden mit KI-Unterstützung (Claude Code) umgesetzt.
**KI-Hinweis:** Das Kontaktformular (Schritt 1) und die Barrierefreiheitserklärung (Schritt 6) wurden mit KI (Claude Code) generiert.

---

## 1. Ausgangslage (Ist-Analyse)

Zum Start habe ich mir vier Seiten mit WAVE angeschaut. Ich wollte zuerst wissen, wo es überhaupt Probleme gibt und wie viel noch zu verbessern ist. Dabei sind diese Werte herausgekommen:

| Seite | Fehler | Kontrast-Fehler | Warnungen | AIM Score |
|-------|-------:|----------------:|----------:|----------:|
| Dashboard | 0 | 8 | 9 | **6,5 (65 %)** |
| Kontakt | 4 | 3 | 9 | **6,2 (62 %)** |
| Watchlist | 3 | 3 | 12 | **6,8 (68 %)** |
| Login | 2 | 2 | 5 | **6,9 (69 %)** |

Vor den Verbeserungen war also noch keine der geprüften Seiten bei den geforderten **90 %**.

![WAVE-Zusammenfassung Dashboard vorher](<Bilder/Schritt0 Ausgang WAVE - dashboard Zusammenfassung.png>)

*Bild 1: WAVE auf dem Dashboard vor den Verbesserungen: 8 Kontrast-Fehler, 9 Warnungen, AIM Score 6,5.*

![Dashboard mit WAVE-Markierungen vorher](<Bilder/Schritt0 Ausgang WAVE - dashboard Markierungen.png>)

*Bild 2: Das Dashboard mit den WAVE-Markierungen. Rot sind Kontrast-Fehler, orange („Tr“) sehr kleine Schrift.*

---

## 2. Gefundene Probleme

| Nr. | Problem | Wo | WCAG-Kriterium |
|----:|---------|----|----------------|
| 1 | **Zu wenig Kontrast:** dunkelgraue Texte (`#4a4e66`, nur 2,1 : 1), Rot knapp zu schwach, weiße Schrift auf Orange (2,8 : 1) | alle Seiten | 1.4.3 Kontrast |
| 2 | **Sehr kleine Schrift:** viele Texte nur 9 bis 11 px, alle Größen in festen `px` | alle Seiten | 1.4.4 Textgröße ändern |
| 3 | **Keine Überschriften:** Titel sahen wie Überschriften aus, waren aber nur `<div>` | alle Seiten | 1.3.1, 2.4.6 |
| 4 | **`<noscript>` ohne Hinweis:** ohne JavaScript nur eine leere Seite | alle Seiten | – (Warnung) |
| 5 | **Formularfelder ohne Beschriftung:** `<label>` nicht mit dem Feld verbunden | Kontakt, Watchlist, Alarme, Login | 1.3.1, 3.3.2, 4.1.2 |
| 6 | **Keine Barrierefreiheitserklärung** | – | Aufgabenstellung |

Ich habe die App dann auch selber getestet, weil WAVE nicht alles finden kann. Dabei sind mir noch Probleme bei der Tastatur-Bedienung und beim Fokus-Rahmen aufgefalen. Auch der Abmelde-Knopf hatte keinen verständlichen Namen. Bei 200 % Zoom war die Navigation weg. Dazu kamen Gewinn und Verlust, die teilweise nur an der Farbe zu erkennen waren, und Live-Kurse, deren Änderungen ein Screenreader nicht ansagt.

---

## 3. Umsetzung Schritt für Schritt

### Schritt 1: Kontaktformular als Testobjekt

**KI-Hinweis:** Das Kontaktformular wurde mit KI (Claude Code) generiert.

In der App gab es kaum Eingabefelder. Deshalb habe ich zum Testen eine Seite **„Kontakt“** ergänzt. Dort kann man Name, E-Mail, Betreff und eine Nachricht eingeben und die Datenschutz-Checkbox anklicken. Die Seite hat die neue Route `/contact` und einen Link in der Seitenleiste. Das Formular ist nur zum Ausprobieren gedacht und schickt nichts an den Server.

Beim ersten Test hat WAVE dort gleich **4 Fehler „Missing form label“** und 3 Kontrast-Fehler angezeigt. Der AIM Score lag bei **6,2**.

![WAVE auf der Kontakt-Seite vorher](<Bilder/Schritt1 Kontaktformular WAVE vorher - contact.png>)

*Bild 3: WAVE auf der neuen Kontakt-Seite: 4 Fehler bei den Formularfeldern.*

---

### Schritt 2: Kontrast verbessern

**Was war das Problem?** Auf dem Dashboard gab es 8 Kontrast-Fehler, auf der Kontakt-Seite waren es 3. Vor allem die grauen Texte waren auf dem dunklen Hintergrund schwer zu lesen.

**Was habe ich geändert?** Fast alle Farben stehen als CSS-Variablen in `styles.css`. Ich habe die Werte dort angepast. Das war praktisch, weil dadurch nicht jede Seite einzeln geändert werden musste.

| Wo | Vorher | Nachher |
|----|--------|---------|
| Sehr graue Texte (Karten-Titel, „NAVIGATION“, Coin-Namen) | `#4a4e66` → 2,06 : 1 | `#8a8fa8` → **5,26 : 1** |
| Graue Texte (Untertitel, Beschriftungen) | `#8a8fa8` → 5,26 : 1 | `#a3a8bf` → **7,13 : 1** |
| Rot (Verlust, Fehlermeldungen) | `#ef4444` → 4,47 : 1 | `#f87171` → **6,08 : 1** |
| Oranger Knopf, Logo, Avatar | weiß auf Orange → 2,80 : 1 | dunkle Schrift → **6,73 : 1** |
| Platzhalter in Feldern | `#757575` → 3,27 : 1 | `#8a8fa8` → **4,72 : 1** |

**Dateien:** `styles.css`, `layout.component.ts`, `login.component.ts`, `prices.component.ts`

![Dashboard vorher](<Bilder/Schritt2 Kontrast vorher - dashboard.png>)

*Bild 4: Dashboard vorher. Karten-Titel und Coin-Namen sind kaum lesbar.*

![Dashboard nachher](<Bilder/Schritt2 Kontrast nachher - dashboard.png>)

*Bild 5: Das Dashboard nach der Änderung. Die grauen Texte heben sich jetzt besser vom Hintergrund ab.*

---

### Schritt 3: Schriftgrößen vergrößern und auf `rem` umstellen

**Was war das Problem?** Viele Texte waren nur 9 bis 11,5 px groß. Außerdem waren alle Schriftgrößen in festen Pixeln angegeben. Wenn ich die Standard-Schrift im Browser größer eingestellt habe, hat sich die Schrift in der App nicht mitvergrößert.

**Was habe ich geändert?**
- Alle Texte sind jetzt **mindestens 12 px** groß.
- Ich habe die Schriftgrößen in **`rem`** umgerechnet (1 rem = 16 px), z. B. `font-size: 13px` → `font-size: 0.8125rem`. Dadurch wächst die Schrift jetzt mit, wenn man die Browser-Einstellungen ändert.

**Dateien:** `styles.css` und 8 Komponenten (Layout, Dashboard, Watchlist, Alarme, Kurse, Login, Kontakt, Benachrichtigungen)

**Beim Test mit 200 % Zoom:** Die Texte konnte ich gut lesen. Dabei gab es aber ein anderes Problem: Unter 900 px Breite wird die Seitenleiste mit `display: none` ausgeblendet. Damit konnte ich nicht mehr zwischen den Seiten wechseln (WCAG 1.4.10). Diesen Punkt habe ich vorerst offen gelassen, er steht auch in Kapitel 4.

![Dashboard bei 200 % Zoom](<Bilder/Schritt3 Zoom 200 Prozent - dashboard.png>)

*Bild 6: Dashboard bei 200 % Zoom. Die Schrift ist gut lesbar, aber die Navigation ist verschwunden.*

**Ergebnis in WAVE nach Schritt 2 und 3:** Das Dashboard hatte jetzt **0 Kontrast-Fehler und einen AIM Score von 10 von 10**. Auf der Kontakt-Seite waren die Kontrast-Fehler auch bei 0, der AIM Score lag dort bei 7,4. Die Fehler bei den Formularfeldern waren zu dem Zeitpunkt noch nicht behoben.

---

### Schritt 4: Formular-Beschriftungen, Pflichtfelder und Fehlermeldungen

**Was war das Problem?** Die Beschriftungen standen zwar neben den Feldern, waren im Code aber nicht damit verbunden. Ein Screenreader sagte deshalb nur „Eingabefeld“. Ich habe das dann auch bei den anderen Formularen kontroliert. Das Problem gab es bei Kontakt, Watchlist, Alarmen und Login.

**Was habe ich geändert?** Ich habe alle 13 Felder durchgesehen und Folgendes angepasst:
- **Beschriftung verbunden:** `<label for="kontakt-name">Name *</label>` + `<input id="kontakt-name">`
- **Checkbox:** Der Datenschutz-Text ist jetzt ein `<label>`. Dadurch kann man auch auf den Text klicken und muss nicht genau das kleine Kästchen treffen.
- **Pflichtfelder:** Attribut `required` + sichtbares oranges `*` + Hinweis „Felder mit * sind Pflichtfelder.“ Das Sternchen hat `aria-hidden="true"`.
- **Fehlermeldungen:** Ich habe `role="alert"` ergänzt, damit der Screenreader die Meldung sofort vorliest.
- **Autovervollständigung:** `autocomplete="name"`, `"email"`, `"username"`, `"current-password"`.

**Dateien:** `contact.component.ts`, `watchlist.component.ts`, `alerts.component.ts`, `login.component.ts`, `styles.css`

![Kontakt nachher mit Fehlermeldung](<Bilder/Schritt4 Formulare nachher - contact Fehlermeldung.png>)

*Bild 7: Kontakt-Seite nachher. Pflichtfelder sind markiert, die Fehlermeldung wird vorgelesen.*

**Ergebnis in WAVE (Kontakt):** Die Fehler sind von **4 → 0** gesunken, die Warnungen von 7 → 2 und der AIM Score ist von **7,4 → 10** gestiegen. WAVE zeigt jetzt 5 × „Form label“ an. Die Beschriftungen werden also erkannt.

---

### Schritt 5: Überschriften-Struktur und `<noscript>`-Hinweis

**Was war das Problem?** Die Titel sahen zwar wie Überschriften aus, waren im Code aber keine echten Überschriften. Beim `<noscript>` gab es ein ähnliches Problem: Angular setzte es beim Bauen selber ein, darin stand aber nur ein Stylesheet-Link und kein hilfreicher Hinweis.

**Was habe ich geändert?**
- Die Seitentitel sind jetzt `<h1>` und die Kartentitel `<h2>`, z. B. `<div class="titel">Dashboard</div>` → `<h1 class="titel">Dashboard</h1>`. Am Aussehen musste ich dafür nichts ändern.
- Die Emojis in den Überschriften habe ich mit `<span aria-hidden="true">` für Screenreader versteckt.
- In `angular.json` habe ich `inlineCritical: false` gesetzt. In `index.html` steht jetzt ein eigener Hinweis: „CoinFinder braucht JavaScript. Bitte aktiviere JavaScript in deinem Browser, um die App zu nutzen.“

**Dateien:** 6 Komponenten, `styles.css`, `index.html`, `angular.json`

![Dashboard mit WAVE-Markierungen nach Schritt 5](<Bilder/Schritt5 WAVE nachher - dashboard Markierungen.png>)

*Bild 8: WAVE erkennt jetzt „h1“ bei „Dashboard“ und „h2“ bei den Karten-Titeln.*

**Ergebnis in WAVE:** „No heading structure“ wird auf den Seiten nicht mehr angezeit. Die Warnung `<noscript>` ist noch da. Ich habe sie kontrolliert und so gelassen, weil dort jetzt der gewünschte Hinweis steht. WAVE meldet jedes `<noscript>`, damit man den Inhalt selber überprüft.

---

### Schritt 6: Barrierefreiheitserklärung

**KI-Hinweis:** Die Barrierefreiheitserklärung (Text und Unterseite) wurde mit KI (Claude Code) generiert. Für den Text der Erklärung ist KI laut Aufgabenstellung erlaubt.

**Was habe ich ergänzt?**
- Es gibt eine neue, **öffentliche Unterseite** `/barrierefreiheit`. Man kann sie ohne Anmeldung öffnen. Der Aufbau richtet sich nach der EU-Mustererklärung 2018/1523 und dem FFG-Muster.
- Im Text stehen der Geltungsbereich, der Stand der Vereinbarkeit (**teilweise vereinbar** mit WCAG 2.2 AA), die noch vorhandenen Barrieren mit WCAG-Kriterium und die Erstellung als Selbstbewertung. Dazu kommen Feedback über das Kontaktformular und das Durchsetzungsverfahren (FFG, § 5 WZG).
- Damit man die Erklärung auch findet, gibt es einen Link unter dem Login-Knopf und den Menüpunkt „♿ Barrierefreiheit“ in der Seitenleiste.
- Das Kontaktformular ist jetzt ebenfalls **ohne Anmeldung** erreichbar. So kommt man auch ohne Konto zum Formular, um eine Barriere zu melden. Es bleibt allerdings ein Testformular und sendet nichts ab.
- Bei der Seite habe ich auch auf die Struktur geachtet: `h1` → 7 × `h2` → 2 × `h3`, dazu Listen und ein eigener Seitentitel.

**Dateien:** neu `barrierefreiheit.component.ts`; `app.routes.ts`, `login.component.ts`, `layout.component.ts`, `styles.css`

![Login nachher mit Link zur Erklärung](<Bilder/Schritt6 Erklärung nachher - login ohne Anmeldung.png>)

*Bild 9: Login-Seite mit dem Link „Erklärung zur Barrierefreiheit“.*

![Die Erklärung zur Barrierefreiheit](<Bilder/Schritt10 Endstand - barrierefreiheit.png>)

*Bild 10: Die neue Unterseite „Erklärung zur Barrierefreiheit“ im Endstand, mit allen offenen Punkten.*

**Ergebnis in WAVE:** Auf der Erklärung und beim Login wurden jeweils **0 Fehler und 10 von 10** angezeigt.

---

### Schritt 7: Navigation bei 200 % Zoom – zurückgestellt

---

### Schritt 8: Tastatur-Bedienung

**So habe ich getestet:** Ich habe die Maus weggelassen und die App nur mit `Tab`, `Enter`, den Pfeiltasten und `Escape` bedient. Dabei habe ich geschaut, ob ich alle Elemente erreichen und auch erkennen kann, wo ich gerade bin.

**Gefundene Probleme und Maßnahmen:**

| Problem | Maßnahme | WCAG |
|---------|----------|------|
| Fokus-Rahmen nur dünn und blau (2,8 : 1), bei Eingabefeldern abgeschaltet | `:focus-visible { outline: 3px solid var(--akzent-hell); outline-offset: 2px; }` → 3 px orange, **7,4 : 1** | 2.4.7, 1.4.11 |
| 7 × Tab bis zum Inhalt | Sprunglink „Zum Inhalt springen“ als erster Link, springt zu `<main id="hauptinhalt">` | 2.4.1 |
| Coin-Vorschläge in der Watchlist nur mit Maus wählbar | Vorschläge als `<button>`, Pfeiltasten, Enter, Escape, Ansage „8 Vorschläge gefunden“ (`aria-live`) | 2.1.1, 4.1.2 |
| Abmelde-Knopf hieß nur „✕“ | `aria-label="Abmelden"` | 4.1.2 |
| Kurse: aktiver Knopf nur an der Farbe erkennbar, „7T“ unverständlich | `aria-pressed`, `aria-label="7 Tage"` | 4.1.2 |

**Dateien:** `styles.css`, `layout.component.ts`, `watchlist.component.ts`, `prices.component.ts`, `barrierefreiheit.component.ts`

![Sprunglink und Fokus-Rahmen](<Bilder/Schritt8 Tastatur nachher - dashboard Sprunglink.png>)

*Bild 11: Nach dem ersten Tab erscheint der Sprunglink mit dem neuen orangen Fokus-Rahmen.*

![Watchlist-Suche per Tastatur](<Bilder/Schritt8 Tastatur nachher - watchlist Suche.png>)

*Bild 12: Mit Pfeil runter ist der Vorschlag „Bitcoin“ fokussiert und kann mit Enter gewählt werden.*

**Ergebnis:** Die oben beschriebenen Tests mit der Tastatur haben funktioniert. In WAVE bleiben Dashboard und Watchlist bei **10 von 10**. Für die Tastatur-Bedienung musste ich aber selber testen, weil WAVE das nicht prüfen kann. Das Problem mit der verschwundenen Navigation bei starkem Zoom ist weiterhin offen.

---

### Schritt 9: Farbe und Live-Kurse – zurückgestellt

---

### Schritt 10: Endprüfung

Zum Schluss habe ich alle 7 Seiten noch einmal mit WAVE und per Skript geprüft. Dabei ging es um Kontrast, Überschriften, Beschriftungen, Alternativtexte, `<main>` und die eingestellte Sprache. Das ist der Stand nach den Änderungen:

| Seite | Kontrast | `h1` | Felder ohne Label | Bilder ohne `alt` | `<main>` |
|-------|----------|-----:|------------------:|------------------:|----------|
| Login | ok | 1 | 0 von 2 | 0 | **fehlt** |
| Dashboard | ok | 1 | – | 0 | ja |
| Watchlist | ok | 1 | 0 von 3 | 0 | ja |
| Alarme | ok | 1 | 0 von 3 | 0 | ja |
| Kurse | ok | 1 | – | 0 | ja |
| Kontakt | ok | 1 | 0 von 5 | 0 | ja |
| Erklärung | ok | 1 | – | 0 | ja |

Danach habe ich die Barrierefreiheitserklärung noch einmal an den Endstand angepasst. Die Punkte, die noch nicht gelöst sind, stehen dort mit dabei.

![WAVE auf der Kurse-Seite im Endstand](<Bilder/Schritt10 WAVE Endstand - prices Markierungen.png>)

*Bild 13: WAVE auf der Kurse-Seite im Endstand: 0 Fehler. Man sieht `aria-pressed` und `aria-label="7 Tage"` aus Schritt 8.*

---

## 4. Endergebnis

### 4.1 WAVE-Ergebnis aller Seiten

| Seite | Fehler vorher → nachher | Kontrast-Fehler vorher → nachher | AIM Score vorher | AIM Score nachher |
|-------|:-----------------------:|:--------------------------------:|-----------------:|------------------:|
| Dashboard | 0 → 0 | 8 → **0** | 6,5 (65 %) | **10 (100 %)** |
| Kontakt | 4 → **0** | 3 → **0** | 6,2 (62 %) | **10 (100 %)** |
| Watchlist | 3 → **0** | 3 → **0** | 6,8 (68 %) | **10 (100 %)** |
| Login | 2 → **0** | 2 → **0** | 6,9 (69 %) | **10 (100 %)** |
| Alarme | – → 0 | – → 0 | – | **10 (100 %)** |
| Kurse | – → 0 | – → 0 | – | **10 (100 %)** |
| Erklärung (neu) | – → 0 | – → 0 | – | **10 (100 %)** |

**Das geforderte WAVE-Ergebnis habe ich erreicht:** Alle 7 Seiten haben einen AIM Score von **10 von 10 (100 %)** und **0 Fehler**. Am Anfang lagen die geprüften Seiten bei **62 bis 69 %**. Als Warnung bleibt das beabsichtigte `<noscript>`, beim Login kommt noch „No page regions“ dazu. Ganz barrierefrei ist die App damit trotzdem noch nicht, weil es noch die unten aufgelisteten Probleme gibt.

### 4.2 Was ist noch offen?

Diese Punkte habe ich vorerst offen gelassen (Schritt 7 und 9). Ich habe sie auch in die Barrierefreiheitserklärung geschrieben. Deshalb steht dort **„teilweise vereinbar“**, obwohl WAVE schon einen guten Score anzeigt:

| Offener Punkt | WCAG-Kriterium |
|---------------|----------------|
| Navigation verschwindet bei 200 % Zoom | 1.4.10 Umbruch |
| Gewinn und Verlust teilweise nur über Farbe erkennbar | 1.4.1 Benutzung von Farbe |
| Live-Kurse werden vom Screenreader nicht angesagt | 4.1.3 Statusmeldungen |
| Kurs-Diagramm ohne Textalternative | 1.1.1 Nicht-Text-Inhalt |
| Emojis in Seitenleiste und Login werden vorgelesen | 1.1.1 Nicht-Text-Inhalt |
| Login-Seite ohne `<main>`-Bereich | 1.3.1 Info und Beziehungen |
| Gleicher Seitentitel auf allen Seiten | 2.4.2 Seitentitel |

### 4.3 Was ich gelernt habe

- **Auf WAVE allein kann man sich nicht verlassen.** Am Anfang dachte ich, dass bei 10 von 10 Punkten alles passt. Die Seite ist dadurch aber nicht automatisch komplet barrierefrei. Ich habe die Bedienung mit der Tastatur, den Fokus, den Zoom und die Farben selber ausprobirt. Dabei ist mir zum Beispiel aufgefallen, dass die Navigation bei 200 % Zoom verschwindet und man die Coin-Vorschläge nicht mit der Tastatur auswählen konnte. WAVE hat das nicht angezeigt.
- **Die Farben an einer Stelle zu haben, war praktisch.** In `styles.css` sind die Farben als CSS-Variablen gespeichert. Ich habe dort ein paar Werte geändet und dadurch war der Kontrast gleich in der ganzen App besser.
- **Man muss auch auf den anderen Seiten nachschauen.** Bei den Beschriftungen habe ich gemekt, dass sie nicht nur im Kontaktformular fehlen. Bei der Watchlist, den Alarmen und beim Login gab es das gleiche Problem. Deshalb habe ich dann auch die anderen Seiten kontrolliert.
- **In der Erklärung muss man ehrlich sein.** Wenn etwas noch nicht funktionirt, muss das auch in der Barrierefreiheitserklärung stehen. Ich habe sie deshalb nach den einzelnen Schritten immer wieder angepasst.
