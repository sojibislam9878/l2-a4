# Service Booking Platform API

A backend REST API for an on-demand **home-service / technician booking platform**. Customers browse services, book technicians, pay online via Stripe, and leave reviews. Technicians manage their profile, availability, services, and job requests. Admins oversee users, bookings, and service categories.

**Live URL:** https://sojibislam9878assignment4.vercel.app

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Roles & Permissions](#roles--permissions)
- [Data Models](#data-models)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Authentication](#authentication)
- [Standard Response Format](#standard-response-format)
- [API Endpoints](#api-endpoints)
  - [Auth](#auth)
  - [Users (Admin listing)](#users)
  - [Technicians (Public)](#technicians-public)
  - [Technician Management](#technician-management)
  - [Services](#services)
  - [Categories](#categories)
  - [Bookings](#bookings)
  - [Reviews](#reviews)
  - [Payments](#payments)
  - [Admin](#admin)
- [Payment Flow (Stripe)](#payment-flow-stripe)
- [Error Handling](#error-handling)
- [Deployment](#deployment)

---

## Features

- 🔐 JWT authentication via httpOnly cookies with role-based authorization
- 👤 Three roles — **customer**, **technician**, **admin**
- 🧰 Technicians manage profile, weekly availability, and their services
- 📅 Booking lifecycle: `pending → accept / decline → complete`
- 💳 Stripe Checkout payments with webhook-driven status updates
- ⭐ Reviews allowed only after a completed booking
- 🛡️ Account ban/unban — banned users are blocked from all actions
- 🔎 Rich filtering & sorting on services and technicians
- 🧱 Centralized error handling and a consistent response shape
- 🗑️ Full `onDelete: Cascade` relations for clean data integrity

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express 5 |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Auth | JSON Web Tokens (`jsonwebtoken`), `bcrypt` |
| Payments | Stripe |
| Dev tooling | `tsx` (watch/run), `dotenv` |
| Hosting | Vercel |

---

## Roles & Permissions

| Role | Capabilities |
|---|---|
| **customer** | Browse services/technicians, book, pay, review |
| **technician** | All customer actions (except booking their own service) + manage profile, availability, services, and job statuses |
| **admin** | Manage users (ban/unban), view all bookings, manage service categories |

---

## Data Models

- **User** — `id, name, email, password, phone_no?, role, status, createdAt, updatedAt`
- **TechnicianProfile** — `id, user_id, bio?, skills[], experience_year?, hourly_rate?, availability[]`
- **Availability** — `id, technician_id, day, start_time, end_time`
- **Category** — `id, name, description`
- **Service** — `id, technician_id, category_id, title, description, price`
- **Booking** — `id, customer_id, technician_id, service_id, scheduled_at, address, note?, status`
- **Payment** — `id, booking_id, transaction_id, amount, method, status, paid_at?`
- **Review** — `id, booking_id, customer_id, technician_id, service_id, rating, comment`

**Enums**
- `Role`: `customer | technician | admin`
- `ActiveStatus`: `unban | ban`
- `BookingStatus`: `pending | accept | decline | in_progress | complete`
- `Status` (payment): `pending | completed | failed`
- `WeekDay`: `sunday | monday | tuesday | wednesday | thursday | friday | saturday`

---

## Getting Started

### Prerequisites
- Node.js 18+
- A PostgreSQL database
- A Stripe account (test mode) + Stripe CLI (for local webhooks)

### Installation
```bash
git clone <your-repo-url>
cd assignment4
npm install
```

### Set up the database
```bash
npx prisma db push      # sync schema to the database
npx prisma generate     # generate the Prisma client
```

### Run
```bash
npm run dev             # start in watch mode (tsx)
```
The server starts on the port from `PORT` (default `8000`).

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=8000
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

BCRYPT_SALT_ROUNDS=10

JWT_ACCESS_SECRET="your_access_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
JWT_ACCESS_EXPIRES_IN="1d"
JWT_REFRESH_EXPIRES_IN="7d"

STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

APP_URL="http://localhost:8000"
```

> On deployment (Vercel), set these in the project's **Environment Variables** settings. `APP_URL` must be the deployed URL in production (it drives Stripe redirect URLs and CORS).

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the server in watch mode (`tsx watch`) |
| `npm run build` | Compile TypeScript (`tsc`) |
| `npm start` | Run the compiled server (`node dist/server.js`) |

---

## Authentication

- On **login**, the API issues a JWT and sets it as an **httpOnly cookie** named `accessToken` (a `refreshToken` cookie is also set).
- Protected routes read the `accessToken` cookie, verify it, load the user, and reject if the account is **banned**.
- Role-restricted routes additionally check the user's `role`.
- Send requests with credentials enabled so the cookie is included (e.g. `fetch(..., { credentials: "include" })` or Postman "send cookies").

---

## Standard Response Format

**Success**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "descriptive message",
  "data": { }
}
```

**Error**
```json
{
  "success": false,
  "message": "what went wrong",
  "errorDetails": { }
}
```

---

## API Endpoints

> Base URL (local): `http://localhost:8000`
> Access legend — 🌐 Public · 🔑 Authenticated · 👤 Customer · 🧰 Technician · 🛡️ Admin

### Auth

#### `POST /api/auth/register` 🌐
Register a new user. Choosing `role: "technician"` also creates an empty technician profile with a default weekly schedule (Sun–Thu, 09:00–17:00). Unknown fields are rejected; `role` cannot be `admin`.
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "phone_no": "01700000000",
  "role": "customer"
}
```
`role` is optional (defaults to `customer`; allowed: `customer` | `technician`).

#### `POST /api/auth/login` 🌐
Authenticates and sets the `accessToken` cookie.
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

#### `GET /api/auth/me` 🔑
Returns the logged-in user. If the user is a technician, the response also includes their `technician_profile` with `availability`. _(No request body.)_

---

### Users

#### `GET /api/users` 🛡️
Returns all users (passwords excluded). _(No request body.)_

---

### Technicians (Public)

#### `GET /api/technicians` 🌐
List technicians (includes `user`). Supports filtering & sorting via query params:

| Query param | Description |
|---|---|
| `searchTerm` | matches skills (exact element), bio, user name/email |
| `skills` | exact skill match (array `has`) |
| `minExperience` / `maxExperience` | experience range |
| `minRate` / `maxRate` | hourly rate range |
| `sortBy` | `hourly_rate` \| `experience_year` \| `createdAt` \| `updatedAt` |
| `sortOrder` | `asc` \| `desc` (default `desc`) |

Example: `GET /api/technicians?skills=plumbing&minExperience=3&sortBy=hourly_rate&sortOrder=asc`

#### `GET /api/technicians/:id` 🌐
Single technician profile with `user`, `review` (with reviewer), and `availability`. _(No request body.)_

---

### Technician Management
_All routes require an authenticated **technician**._

#### `PUT /api/technician/profile` 🧰
Update own profile. All fields optional.
```json
{
  "bio": "Expert plumber with 5 years of experience",
  "skills": ["plumbing", "pipe line fix"],
  "experience_year": 5,
  "hourly_rate": 40.5
}
```

#### `PUT /api/technician/availability` 🧰
Replace the entire weekly schedule. Send `{ "slots": [] }` to clear. Slots on the same day must not overlap.
```json
{
  "slots": [
    { "day": "sunday", "start_time": "09:00", "end_time": "17:00" },
    { "day": "monday", "start_time": "10:00", "end_time": "15:00" }
  ]
}
```
`day`: `sunday`…`saturday`. `start_time` / `end_time`: `"HH:MM"` (start must be before end).

#### `GET /api/technician/bookings` 🧰
List bookings assigned to the logged-in technician. _(No request body.)_

#### `PATCH /api/technician/bookings/:id` 🧰
Update a booking's status. Allowed values only.
```json
{
  "status": "accept"
}
```
`status`: `accept` | `decline` | `complete`.

---

### Services

#### `GET /api/services` 🌐
List services (includes `category`, `technician`+user, and each `review`'s `rating`, `comment`, `customer_id`). Filters:

| Query param | Description |
|---|---|
| `searchTerm` | matches title, description, category name, technician name |
| `category_id` | filter by category |
| `technician_id` | filter by technician (profile id) |
| `minPrice` / `maxPrice` | price range |
| `sortBy` | `price` \| `title` \| `created_at` |
| `sortOrder` | `asc` \| `desc` (default `desc`) |

Example: `GET /api/services?category_id=<id>&minPrice=20&maxPrice=100&sortBy=price`

#### `POST /api/services` 🧰
Create a service (technician only). `technician_id` is derived from the token.
```json
{
  "category_id": "existing-category-id",
  "title": "Emergency Pipe Repair",
  "description": "24/7 plumbing fixes",
  "price": 60.0
}
```

---

### Categories

#### `GET /api/categories` 🌐
List all service categories. _(No request body.)_

---

### Bookings
_All routes require an authenticated **customer** or **technician**. Admins cannot book._

#### `POST /api/bookings` 👤🧰
Create a booking. `technician_id` is derived from the service. A technician cannot book their own service.
```json
{
  "service_id": "existing-service-id",
  "scheduled_at": "2026-07-15T14:00:00.000Z",
  "address": "123 Main Street, Dhaka",
  "note": "Please come in the afternoon"
}
```
`note` is optional. New bookings start with `status: "pending"`.

#### `GET /api/bookings` 👤🧰
List the logged-in user's own bookings. _(No request body.)_

#### `GET /api/bookings/:id` 👤🧰
Full details of one of the user's bookings (user, technician, service, payment, review). _(No request body.)_

---

### Reviews

#### `POST /api/reviews` 👤🧰
Create a review for a **completed** booking that belongs to the requester. `technician_id` and `service_id` are derived from the booking. One review per booking.
```json
{
  "booking_id": "completed-booking-id",
  "rating": 5,
  "comment": "Excellent service, highly recommended!"
}
```
`rating`: integer `1–5`.

---

### Payments
_All customer-facing routes require an authenticated **customer**._

#### `POST /api/payments/create` 👤
Create a Stripe Checkout session for an **accepted** booking. Returns a checkout `url`.
```json
{
  "booking_id": "accepted-booking-id"
}
```
Response `data`:
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "payment": { "status": "pending", "paid_at": null, "...": "..." }
}
```

#### `POST /api/payments/confirm` ⚙️ (Stripe webhook)
Called **by Stripe**, not by clients. Verifies the signature and updates the payment:
- `checkout.session.completed` → `completed` + sets `paid_at`
- `checkout.session.expired` / `async_payment_failed` → `failed`

Requires the raw request body and a valid `stripe-signature` header. _(Not manually callable — direct requests return `400`.)_

#### `GET /api/payments` 👤
List the logged-in user's payments. _(No request body.)_

#### `GET /api/payments/:id` 👤
Details of one of the user's payments (with booking + service). _(No request body.)_

---

### Admin
_All routes require an authenticated **admin**._

#### `GET /api/admin/users` 🛡️
List all users (passwords excluded). _(No request body.)_

#### `PATCH /api/admin/users/:id` 🛡️
Ban or unban a user.
```json
{
  "status": "ban"
}
```
`status`: `unban` | `ban`.

#### `GET /api/admin/bookings` 🛡️
List all bookings (with customer, technician, service). _(No request body.)_

#### `GET /api/admin/categories` 🛡️
List all categories. _(No request body.)_

#### `POST /api/admin/categories` 🛡️
Create a new service category.
```json
{
  "name": "Plumbing",
  "description": "Pipe and water related services"
}
```

---

## Payment Flow (Stripe)

```
1. Customer  → POST /api/payments/create   (booking must be "accept")
                → returns a Stripe checkout `url`
2. Customer  → pays on Stripe's hosted page
3. Stripe    → POST /api/payments/confirm  (webhook, automatic)
                → payment marked "completed" + paid_at set
4. Customer  → GET /api/payments           → sees it as completed
```

- **Local testing:** run `stripe listen --forward-to localhost:8000/api/payments/confirm` and set the printed `whsec_...` as `STRIPE_WEBHOOK_SECRET`.
- **Production:** register a webhook endpoint in the Stripe Dashboard pointing to `https://<your-domain>/api/payments/confirm` (Snapshot payload), select `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_failed`, and set its signing secret as `STRIPE_WEBHOOK_SECRET`.
- The success/cancel pages are `GET /payment/success` and `GET /payment/cancel` (driven by `APP_URL`).

---

## Error Handling

A centralized error handler produces consistent error responses and maps common cases:

| Situation | Status |
|---|---|
| `AppError` (thrown in services) | its own code |
| Prisma `P2002` (duplicate) | `409` |
| Prisma `P2025` (not found) | `404` |
| Prisma validation error | `400` |
| Expired JWT | `401` |
| Invalid JWT | `401` |
| Unknown route | `404` |
| Uncaught | `500` |

---

## Deployment

Deployed on **Vercel**. Key points:

- Set all environment variables in Vercel's dashboard (the local `.env` is git-ignored and not deployed).
- Set `APP_URL` to the deployed domain so Stripe redirects and CORS use the live URL.
- Register the Stripe webhook against the deployed `/api/payments/confirm` and set the matching `STRIPE_WEBHOOK_SECRET`.
