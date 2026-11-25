# ============================
# Stage 1: Angular Frontend bauen
# ============================
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

COPY frontend-angular/package*.json ./
RUN npm install

COPY frontend-angular/ ./

# Angular 17 (application builder) legt Output in /dist/browser/ ab
RUN npx ng build --configuration production --output-path /dist

# ============================
# Stage 2: Express Backend
# ============================
FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --production

COPY backend/ .

# Angular 17 legt die fertigen Dateien in /dist/browser/ ab
# Express serviert diesen Ordner als statische Dateien
COPY --from=frontend-builder /dist/browser ./public

EXPOSE 3001

CMD ["node", "server.js"]
