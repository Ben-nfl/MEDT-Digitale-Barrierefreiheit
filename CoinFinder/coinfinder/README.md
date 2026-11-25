# CoinFinder

**Technologien:**

| Bereich        | chnologie                                  |
|----------------|----------------------------------------------|
| Frontend       | Angular 17 (Standalone Components, RxJS)     |
| Backend        | Node.js + Express.js                         |
| Echtzeit       | WebSocket (ws-Bibliothek)                    |
| Datenbank      | PostgreSQL 16                                |
| API-Docs       | Swagger UI (OpenAPI 3.0)                     |
| Authentifizierung | JWT (JSON Web Tokens)                     |
| Container      | Docker + Docker Compose                      |
| Preisdaten     | CoinGecko Public API                         |

---

## Projektstruktur

```
coinfinder/
├── Dockerfile                  ← Multi-Stage Build (Angular + Express)
├── docker-compose.yml          ← Alle Container (DB, Seed, Backend)
├── README.md
│
├── backend/
│   ├── server.js               ← Express-Server + WebSocket-Server
│   ├── db.js                   ← PostgreSQL-Verbindung & Datenbankfunktionen
│   ├── seed.js                 ← Startdaten (Coins + Alarme)
│   ├── swagger.yaml            ← API-Dokumentation (OpenAPI 3.0)
│   ├── package.json
│   └── routes/
│       ├── auth.js             ← POST /api/auth/login, GET /api/auth/me
│       ├── watchlist.js        ← GET/POST /api/watchlist, DELETE /api/watchlist/:symbol
│       ├── alerts.js           ← GET/POST /api/alerts, DELETE/PATCH /api/alerts/:id
│       └── prices.js           ← GET /api/prices/current, /history/:symbol, /search
│
└── frontend-angular/
    ├── angular.json
    ├── package.json
    ├── proxy.conf.json         ← Proxy für lokale Entwicklung
    └── src/
        ├── main.ts
        ├── index.html
        ├── styles.css
        └── app/
            ├── app.component.ts
            ├── app.config.ts
            ├── app.routes.ts
            ├── services/
            │   ├── auth.service.ts         ← Login/Logout, JWT-Verwaltung
            │   ├── auth.guard.ts           ← Routen-Schutz
            │   ├── api.service.ts          ← REST-API Calls
            │   ├── websocket.service.ts    ← WebSocket-Client mit Auto-Reconnect
            │   └── notification.service.ts ← Toast-Benachrichtigungen
            └── components/
                ├── login/                  ← Login-Seite
                ├── dashboard/              ← Übersicht + Live-Kurse
                ├── watchlist/              ← Verwaltungsmaske (CRUD)
                ├── alerts/                 ← Verwaltungsmaske (CRUD)
                ├── prices/                 ← Anzeigemaske + Chart
                └── shared/
                    ├── layout/             ← Sidebar + Navigation
                    └── notification/       ← Toast-Benachrichtigungen
```

---



### Alle Container starten

Im /backend npm install pg
```bash
docker compose up --build
```

Beim ersten Start passiert automatisch folgendes:
1. **PostgreSQL-Container** startet und wartet auf Bereitschaft
2. **Seed-Container** befüllt die Datenbank mit Demo-Coins und Alarmen
3. **Backend-Container** baut das Angular-Frontend und startet den Express-Server

Die App ist dann erreichbar unter:

| Service       | URL                                |
|---------------|------------------------------------|
| Angular-App   | http://localhost:3001              |
| Swagger UI    | http://localhost:3001/api-docs     |
| PostgreSQL    | localhost:5432 (intern: `db:5432`) |

### Demo-Logins

| Benutzer | Passwort   | Rolle  |
|----------|------------|--------|
| `admin`  | `admin123` | Admin  |
| `user`   | `user123`  | User   |


## Funktionsübersicht

### Backend – REST-API

| Methode  | Endpunkt                     | Beschreibung                              |
|----------|------------------------------|-------------------------------------------|
| POST     | `/api/auth/login`            | Login, gibt JWT-Token zurück              |
| GET      | `/api/auth/me`               | Eigene Benutzerdaten abrufen              |
| GET      | `/api/watchlist`             | Alle Coins der Watchlist                  |
| POST     | `/api/watchlist`             | Coin hinzufügen                           |
| DELETE   | `/api/watchlist/:symbol`     | Coin entfernen                            |
| GET      | `/api/alerts`                | Alle Alarme abrufen                       |
| POST     | `/api/alerts`                | Neuen Preisalarm erstellen                |
| DELETE   | `/api/alerts/:id`            | Alarm löschen                             |
| PATCH    | `/api/alerts/:id/reset`      | Ausgelösten Alarm zurücksetzen            |
| GET      | `/api/prices/current`        | Aktuelle Kurse aller Watchlist-Coins      |
| GET      | `/api/prices/history/:symbol`| Kursverlauf (7/14/30 Tage)               |
| GET      | `/api/prices/search?q=`      | Coin-Suche via CoinGecko                  |
| GET      | `/api/prices/demo`           | Demo-Kurse (offline-fähig)                |
| GET      | `/api/health`                | Server-Status (Healthcheck)               |

### Backend – WebSocket

Der WebSocket-Server läuft auf demselben Port wie der HTTP-Server.  
Verbindung: `ws://localhost:3001?token=<JWT>`

| Nachrichtentyp          | Richtung       | Beschreibung                              |
|-------------------------|----------------|-------------------------------------------|
| `verbunden`             | Server → Client| Bestätigung nach erfolgreicher Verbindung |
| `price_update`          | Server → Client| Aktualisierte Kursdaten (alle ~60s)       |
| `price_alert_triggered` | Server → Client| Benachrichtigung wenn Alarm ausgelöst     |
| `admin_message`         | Server → Client| Broadcast-Nachricht vom Admin             |
| `ping` / `pong`         | bidirektional  | Heartbeat für Verbindungscheck            |

### Frontend – Angular

- **Login**: JWT-basierte Authentifizierung, Token wird im `localStorage` gespeichert
- **Dashboard**: Live-Kursübersicht, Statistiken, Echtzeitaktualisierung via WebSocket
- **Watchlist**: Coins suchen (CoinGecko-API), hinzufügen und entfernen (CRUD)
- **Alarme**: Preisalarme erstellen, löschen und zurücksetzen (CRUD)
- **Kurse**: Preisverläufe als Chart (Chart.js), Zeitraum wählbar (7/14/30 Tage)
- **WebSocket-Client**: Verbindet sich beim App-Start, reconnect automatisch, zeigt Echtzeit-Benachrichtigungen

---
