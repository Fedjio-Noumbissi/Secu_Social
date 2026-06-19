# Secu Social

Application de gestion de la sécurité sociale (CNPS Cameroun).

## Structure

- `secu-social-backend/` — API REST Spring Boot (PostgreSQL)
- `secu-social/` — Frontend React + Vite

## Backend

```bash
cd secu-social-backend
mvn spring-boot:run
```

Port : `8080` — Base de données : PostgreSQL (`secusocial`)

## Frontend

```bash
cd secu-social
npm install
npm run dev
```

Port : `5173`

### Production

```bash
npm run build
node server.js
```
