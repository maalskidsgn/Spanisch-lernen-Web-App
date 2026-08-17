# Bauanleitung für den Habloo-Server als Docker-Container.
# Enthält Node.js für den Express-Server und yt-dlp für die YouTube-Transkripte.

FROM node:22-slim

# yt-dlp braucht Python; curl zum Herunterladen, Zertifikate für HTTPS
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Das aktuelle yt-dlp direkt von GitHub holen
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    -o /usr/local/bin/yt-dlp \
  && chmod +x /usr/local/bin/yt-dlp

# YouTube verlangt inzwischen eine JavaScript-Laufzeit. Node ist hier ohnehin
# an Bord, also sagen wir yt-dlp dauerhaft, dass es Node benutzen soll.
RUN printf -- "--js-runtimes node\n" > /etc/yt-dlp.conf

WORKDIR /app

# Erst nur die Paketlisten kopieren und installieren (bessere Build-Caches)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Dann den Server-Code
COPY server ./server

EXPOSE 8787
CMD ["node", "server/index.js"]
