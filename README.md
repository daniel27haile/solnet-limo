# Solnet Limo

**Elite Transportation Service by Solomon**
> Create an Elegant Impression & a Memory for the Lifetime!

- **Phone:** 970-473-1479
- **Email:** hello@solnetlimo.com
- **Availability:** 24/7

---

## Project Structure

```
solnet-limo/
├── solnet-limo-client/   # Angular 18 frontend
├── solnet-limo-api/      # Node.js / Express / MongoDB API
├── .github/
│   └── workflows/
│       └── deploy.yml    # CI/CD — deploys on push to main
├── DEPLOYMENT.md         # DigitalOcean + Nginx + DNS setup guide
└── .gitignore
```

---

## Local Development

### 1. Backend (API)

```bash
cd solnet-limo-api
npm install
cp .env.example .env
# Edit .env — set MONGO_URI, JWT_SECRET, and any optional keys
npm run dev        # starts on http://localhost:5000
```

Seed the database (creates services, fleet, admin user):

```bash
npm run seed
```

**Default admin credentials (change after first login):**
- Email: `admin@solnetlimo.com`
- Password: `SolnetAdmin2024!`

### 2. Frontend (Client)

```bash
cd solnet-limo-client
npm install
npm start          # starts on http://localhost:4200
```

The Angular dev server proxies `/api` calls to `http://localhost:5000` via `proxy.conf.json`.

---

## Production Build

### Frontend

```bash
cd solnet-limo-client
npm ci
npm run build -- --configuration production
# Output: dist/solnet-limo/browser/
```

### Backend

```bash
cd solnet-limo-api
npm ci --omit=dev
npm start
```

---

## Environment Variables

### Backend (`solnet-limo-api/.env`)

| Variable | Description |
|---|---|
| `NODE_ENV` | `production` or `development` |
| `PORT` | API port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Strong random secret for JWT signing |
| `CLIENT_URL` | Frontend origin for CORS (e.g. `https://www.solnetlimo.com`) |
| `GOOGLE_MAPS_API_KEY` | Server-side Maps key (Distance Matrix, Geocoding) |
| `SQUARE_ACCESS_TOKEN` | Square payment access token |
| `SQUARE_ENVIRONMENT` | `sandbox` or `production` |
| `SQUARE_LOCATION_ID` | Square location ID |
| `EMAIL_HOST` | SMTP host |
| `EMAIL_PORT` | SMTP port (typically `587`) |
| `EMAIL_USER` | SMTP user |
| `EMAIL_PASS` | SMTP app password |
| `ADMIN_NOTIFICATION_EMAIL` | Receives booking notifications |

### Frontend (injected at build time via GitHub Actions)

| GitHub Secret / Variable | Destination |
|---|---|
| `ANGULAR_API_BASE_URL` (var) | `environment.apiUrl` |
| `GOOGLE_MAPS_BROWSER_API_KEY` | `environment.googleMapsBrowserKey` |
| `SQUARE_APPLICATION_ID` | `environment.squareAppId` |
| `SQUARE_LOCATION_ID` | `environment.squareLocationId` |

---

## CI/CD — GitHub Actions

Deployment runs automatically on every push to `main`.

### Required GitHub Secrets

| Secret | Value |
|---|---|
| `DO_HOST` | DigitalOcean Droplet IP address |
| `DO_USER` | SSH user (e.g. `root` or `deploy`) |
| `DO_PORT` | SSH port (typically `22`) |
| `DO_SSH_KEY` | Full contents of your private SSH key |
| `GOOGLE_MAPS_BROWSER_API_KEY` | Google Maps browser key |
| `SQUARE_APPLICATION_ID` | Square application ID |
| `SQUARE_LOCATION_ID` | Square location ID |

### Required GitHub Variable

| Variable | Value |
|---|---|
| `ANGULAR_API_BASE_URL` | `https://api.solnetlimo.com/api` |

---

## Pages

### Public

| Page | URL |
|---|---|
| Home | `/` |
| About | `/about` |
| Services | `/services` |
| Fleet | `/fleet` |
| Booking | `/booking` |
| Contact | `/contact` |
| FAQ | `/faq` |

### Admin Portal

| Page | URL |
|---|---|
| Login | `/admin/login` |
| Dashboard | `/admin/dashboard` |
| Bookings | `/admin/bookings` |
| Messages | `/admin/messages` |
| Services | `/admin/services-management` |
| Fleet | `/admin/fleet-management` |
| Pricing | `/admin/pricing` |

---

## Tech Stack

**Frontend:** Angular 18 · TypeScript · SCSS · Reactive Forms · Angular Router

**Backend:** Node.js · Express.js · MongoDB · Mongoose · JWT · Bcrypt · Nodemailer · Helmet · Axios

**Payments:** Square Web Payments SDK (frontend tokenization) + Square REST API (backend charge)

**Maps:** Google Maps JS API · Places Autocomplete · Distance Matrix · Geocoding

**Deployment:** DigitalOcean · Nginx · PM2 · GitHub Actions

---

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full server setup, Nginx config, SSL, and DNS instructions.
