# ============================
# Stage 1: Angular Frontend bauen
# ============================
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

# Abhängigkeiten installieren
COPY frontend-angular/package*.json ./
RUN npm install

# Quellcode kopieren und Angular-App bauen
# Output-Pfad: /frontend/../backend/public → also /backend/public
COPY frontend-angular/ ./
RUN npm run build:prod

# ============================
# Stage 2: Express Backend
# ============================
FROM node:20-alpine

WORKDIR /app

# Backend-Abhängigkeiten
COPY backend/package*.json ./
RUN npm install --production

# Backend-Code kopieren
COPY backend/ .

# Angular-Build aus Stage 1 in public/-Ordner kopieren
# Express serviert diesen Ordner als statische Dateien
COPY --from=frontend-builder /app/public ./public

EXPOSE 3001

CMD ["node", "server.js"]
