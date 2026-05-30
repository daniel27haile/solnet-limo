# Solnet Limo — Full-Stack Website

**Elite Transportation Service by Solomon**
> Create an Elegant Impression & a Memory for the Lifetime!

- **Phone:** 970-473-1479
- **Email:** Smoges16@yahoo.com
- **Availability:** 24/7

---

## Project Structure

```
solnet-limo/
├── server/          # Node.js / Express / MongoDB backend
└── client/          # Angular 18 frontend
```

---

## Quick Start

### 1. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env — add your MONGO_URI and JWT_SECRET
npm run seed       # seeds services, fleet, and admin user
npm run dev        # starts on http://localhost:5000
```

**Default admin credentials (change after first login):**
- Email: `admin@solnetlimo.com`
- Password: `SolnetAdmin2024!`

### 2. Frontend Setup

```bash
cd client
npm install
npm start          # starts on http://localhost:4200
```

The Angular dev server proxies `/api` calls to `http://localhost:5000` via `proxy.conf.json`.

---

## Environment Variables (server/.env)

```env
MONGO_URI=mongodb://localhost:27017/solnet-limo
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this
CLIENT_URL=http://localhost:4200
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
ADMIN_NOTIFICATION_EMAIL=Smoges16@yahoo.com
NODE_ENV=development
```

---

## Image Assets

Place your images in these folders inside `client/src/assets/images/`:

```
assets/images/
├── hero-bg.jpg              ← Hero section background (dark luxury SUV/limo scene)
├── fleet/
│   ├── black-suv.jpg
│   ├── stretch-limo.jpg
│   ├── luxury-sedan.jpg
│   ├── luxury-van.jpg
│   └── default-vehicle.jpg  ← Fallback image
├── about/
│   └── chauffeur.jpg        ← Professional chauffeur photo
└── logo.png                 ← Company logo (optional)
```

**Recommended image specs:**
- Hero: 1920×1080px minimum, dark/moody tone
- Fleet vehicles: 800×600px, 16:9 ratio
- About chauffeur: 800×600px

---

## Pages

### Public Website
| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Hero, services preview, fleet preview, testimonials |
| About | `/about` | Company story, values, team |
| Services | `/services` | All 17 services displayed as cards |
| Fleet | `/fleet` | All vehicles with details |
| Booking | `/booking` | Full reservation form |
| Contact | `/contact` | Contact form + info |
| FAQ | `/faq` | Accordion FAQ |

### Admin Portal
| Page | URL | Description |
|------|-----|-------------|
| Login | `/admin/login` | Admin authentication |
| Dashboard | `/admin/dashboard` | Stats + recent activity |
| Bookings | `/admin/bookings` | Manage all bookings |
| Messages | `/admin/messages` | View contact messages |
| Services | `/admin/services-management` | Add/edit/delete services |
| Fleet | `/admin/fleet-management` | Add/edit/delete vehicles |

---

## API Endpoints

```
POST   /api/bookings           Create booking (public)
GET    /api/bookings           List bookings (admin)
GET    /api/bookings/stats     Booking stats (admin)
GET    /api/bookings/:id       Get booking (admin)
PATCH  /api/bookings/:id/status Update status (admin)
DELETE /api/bookings/:id       Delete booking (admin)

POST   /api/contact            Submit message (public)
GET    /api/contact            List messages (admin)
GET    /api/contact/stats      Message stats (admin)
PATCH  /api/contact/:id/read   Mark read (admin)
DELETE /api/contact/:id        Delete message (admin)

GET    /api/services           List active services (public)
GET    /api/services/admin     All services (admin)
POST   /api/services           Create service (admin)
PATCH  /api/services/:id       Update service (admin)
DELETE /api/services/:id       Delete service (admin)

GET    /api/fleet              List active vehicles (public)
GET    /api/fleet/admin        All vehicles (admin)
POST   /api/fleet              Add vehicle (admin)
PATCH  /api/fleet/:id          Update vehicle (admin)
DELETE /api/fleet/:id          Delete vehicle (admin)

POST   /api/auth/login         Admin login
GET    /api/auth/me            Get current admin (admin)
```

---

## Production Build

```bash
# Build Angular
cd client && npm run build:prod

# Set NODE_ENV=production in server/.env
# Deploy dist/ folder to your hosting provider
# Deploy server/ to your Node.js host
```

---

## Tech Stack

**Frontend:** Angular 18 · TypeScript · SCSS · Reactive Forms · Angular Router

**Backend:** Node.js · Express.js · MongoDB · Mongoose · JWT · Bcrypt · Nodemailer
