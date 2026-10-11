# 🏠 StayNest — AI-Powered Apartment Finder

Full-stack Next.js real estate platform with MongoDB, Mongoose, AI matching (Claude), and Stripe payments.

## ⚡ Quick Setup (5 Steps)

### Step 1 — Extract ZIP & Install

```bash
cd staynest
npm install
```

### Step 2 — Create .env file

```bash
cp .env.example .env
```

Edit `.env` and add:

```
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/staynest"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="any-random-32-char-string"
ANTHROPIC_API_KEY="sk-ant-..."   (optional - AI works without it)
STRIPE_SECRET_KEY="sk_test_..."  (optional - payments work without it)
```

### Step 3 — MongoDB Atlas Setup (FREE)

1. Go to mongodb.com/atlas → Sign up free
2. Create cluster → M0 FREE → Create
3. Database Access → Add User → username: staynest_user, password: staynest123
4. Network Access → Add IP → 0.0.0.0/0 (allow all)
5. Connect → Drivers → Copy connection string → paste in .env

### Step 4 — Seed Database

```bash
MONGODB_URI="your-connection-string" npm run seed
```

### Step 5 — Run!

```bash
npm run dev
```

Open http://localhost:3000 🎉

## 🔑 Demo Login

| Role  | Email              | Password |
| ----- | ------------------ | -------- |
| Admin | admin@staynest.com | admin123 |
| User  | user@staynest.com  | user123  |

## 📄 All Pages

| Page              | URL                   |
| ----------------- | --------------------- |
| Home + AI Matcher | /                     |
| Browse Apartments | /apartments           |
| Property Detail   | /apartments/[id]      |
| AI Search Results | /search               |
| Login             | /login                |
| Signup            | /signup               |
| Payment Gateway   | /payment              |
| Dashboard         | /dashboard            |
| My Bookings       | /dashboard/bookings   |
| AI Messages       | /dashboard/messages   |
| Payments          | /dashboard/payments   |
| Profile           | /dashboard/profile    |
| Admin Dashboard   | /admin                |
| Admin Properties  | /admin/properties     |
| Add Property      | /admin/properties/add |
| Admin Users       | /admin/users          |
| Admin Bookings    | /admin/bookings       |
| Admin AI Training | /admin/ai             |
| About             | /about                |
| Contact + AI Chat | /contact              |
| Privacy           | /privacy              |
| Terms             | /terms                |

## 🏗️ Tech Stack

- Next.js 14 + TypeScript
- MongoDB + Mongoose (NO Prisma!)
- NextAuth v4
- Anthropic Claude AI
- Stripe Payments
- Tailwind CSS
- Recharts
