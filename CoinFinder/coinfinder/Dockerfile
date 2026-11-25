# ============================
# zuerst wird die angular-app in fertige browserdateien umgewandelt.
# ============================
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

# kopiert zuerst nur die paketlisten, damit docker die installation bei reinen codeänderungen wiederverwenden kann.
COPY frontend-angular/package*.json ./
RUN npm install

# kopiert danach den eigentlichen frontend-code in den baucontainer.
COPY frontend-angular/ ./

# der produktionsbuild legt die fertigen browserdateien in /dist/browser ab.
RUN npx ng build --configuration production --output-path /dist

# ============================
# das endgültige image braucht nur das backend und die fertigen browserdateien.
# ============================
FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
# installiert die pakete, die das backend zum laufen braucht, ohne reine entwicklungshelfer.
RUN npm install --production

COPY backend/ .

# übernimmt die fertige webseite aus dem ersten baucontainer.
# express liefert diese dateien später aus seinem public-ordner aus.
COPY --from=frontend-builder /dist/browser ./public

# beschreibt den benutzten port im image. die verbindung nach außen legt docker compose fest.
EXPOSE 3001

# wenn der container normal startet, wird der webserver ausgeführt.
CMD ["node", "server.js"]
