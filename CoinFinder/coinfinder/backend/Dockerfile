# ============================
# diese zusätzliche bauvorlage baut zuerst das frontend. compose verwendet die vorlage im projektordner.
# ============================
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

# die paketlisten werden zuerst kopiert und die benötigten frontend-pakete installiert.
COPY frontend-angular/package*.json ./
RUN npm install

# kopiert den frontend-code und führt dessen produktionsbuild aus.
# laut paketdatei schreibt dieser build die browserdateien unter /backend/public.
COPY frontend-angular/ ./
RUN npm run build:prod

# ============================
# für den laufenden container wird ein neues image mit dem backend vorbereitet.
# ============================
FROM node:20-alpine

WORKDIR /app

# hier werden nur die pakete installiert, die das backend zum laufen braucht.
COPY backend/package*.json ./
RUN npm install --production

# übernimmt die backend-dateien in den arbeitsordner des containers.
COPY backend/ .

# diese kopierzeile erwartet die fertige webseite im ersten baucontainer unter /app/public.
# das ist ein anderer pfad als der oben eingestellte buildpfad; die zeile wird hier nur erklärt, nicht geändert.
COPY --from=frontend-builder /app/public ./public

# beschreibt den serverport. der folgende startbefehl führt das backend aus.
EXPOSE 3001

CMD ["node", "server.js"]
