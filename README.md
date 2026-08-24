# 🏘️ Society Maintenance Tracker

A full-stack web application for managing society/apartment complaints and notices. Built with **Next.js 16**, **Prisma**, **SQLite**, and **Resend** for email notifications.

Residents can raise complaints, track their status, and receive email updates. Admins can manage complaints, post notices, and monitor the overall society health via a dashboard.

---

## 🌐 Live Demo

**Live URL:** [https://society-maintenance-tracker-1-zqd7.onrender.com](https://society-maintenance-tracker-1-zqd7.onrender.com)

**How to test the app:**

### Option 1 — Use Pre-Seeded Demo Accounts (No Registration Needed)

These accounts are already set up — just login directly:

| Role | Email | Password |
|------|-------|----------|
| 🏠 **Resident** | `demo.societymaintenance@gmail.com` | `Demo@1234` |
| 🔧 **Admin** | `pq@gmail.com` | `Admin@1234` |

### Option 2 — Register with Your Own Email

You can also **register with any email ID** of your choice as either a **Resident** or **Admin** — just click Register and fill in the details.

> 📧 **Want to receive real email notifications?**
> By default, emails only work for the configured Resend account.
> To receive emails on **your own inbox**, you must add your own **Resend API key** in the `.env` file (or Render Environment Variables):
> ```env
> RESEND_API_KEY="re_your_api_key_here"
> ```
> Get your free API key at [resend.com](https://resend.com).

> **Note:** Demo accounts (`pq@gmail.com` & `demo.societymaintenance@gmail.com`) are automatically re-seeded on every deployment — passwords always reset to the values above.

---

## 📸 Features

### 👤 Resident Features
- **Register & Login** with secure credential-based authentication
- **Raise Complaints** with title, description, category, and optional photo upload
- **Track Complaint Status** — Open → In Progress → Resolved / Flagged
- **View Notice Board** — Important notices are pinned at the top
- **Email Notifications** — Receive emails when complaint status changes or a new important notice is posted

### 🔧 Admin Features
- **Dashboard** — Overview of all complaints by status, category, and overdue count
- **Manage Complaints** — Update status, set priority (Low/Medium/High), add admin notes
- **Complaint History** — Full audit trail of every status change with timestamps
- **Flag Overdue Complaints** — Complaints open too long can be flagged
- **Post Notices** — Create regular or important notices (important = email to all residents)
- **Bulk Actions** — Select multiple complaints, paginate, filter, and sort

---

## 🛠️ Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| **Framework**  | Next.js 16 (App Router)             |
| **Frontend**   | React 19, Tailwind CSS 3, Lucide Icons |
| **Backend**    | Next.js API Routes (Server-side)    |
| **Database**   | SQLite via Prisma ORM               |
| **Auth**       | NextAuth.js (Credentials Provider)  |
| **Email**      | Resend API                          |
| **Language**   | TypeScript 5                        |

---

## 📁 Project Structure

```
society-maintenance-tracker/
├── prisma/
│   ├── schema.prisma          # Database schema (User, Complaint, Notice, etc.)
│   ├── seed.js                # Demo user seed script (runs on every deploy)
│   ├── seed.ts                # TypeScript version of the seed script
│   └── dev.db                 # SQLite database file
├── public/
│   ├── uploads/               # Uploaded complaint photos
│   └── ...                    # Static assets (images, icons)
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx           # Landing page (auto-redirects by role)
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── dashboard/         # Admin dashboard
│   │   ├── complaints/        # Complaints pages (list, new, [id] detail)
│   │   ├── notices/           # Notice board
│   │   └── api/               # Backend API routes
│   │       ├── auth/          # Auth endpoints (NextAuth + register)
│   │       ├── complaints/    # CRUD for complaints
│   │       ├── dashboard/     # Admin analytics
│   │       └── notices/       # CRUD for notices
│   ├── components/            # Reusable React components
│   │   ├── Navigation.tsx     # Top navigation bar
│   │   ├── ProfileMenu.tsx    # User avatar & dropdown menu (with sign out)
│   │   └── Providers.tsx      # NextAuth SessionProvider wrapper
│   ├── lib/                   # Backend utilities
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── email.ts           # Resend email sender utility
│   │   └── prisma.ts          # Prisma client singleton
│   └── types/
│       └── next-auth.d.ts     # TypeScript type extensions for NextAuth
├── .env                       # Environment variables
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd society-maintenance-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory (or rename `.env.example`):

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="re_your_api_key_here"
MAIL_FROM="Society Admin <onboarding@resend.dev>"
```

#### How to get Resend API Key:
1. Go to [https://resend.com](https://resend.com) and create a free account.
2. Navigate to **API Keys** in the dashboard.
3. Click **Create API Key**, give it a name (e.g., "Society App"), and click **Add**.
4. Copy the generated `re_...` key and paste it into your `.env` file.

> **Note:** With Resend's free plan using `onboarding@resend.dev`, emails can only be sent to the email address you signed up with. For production, verify your own domain on Resend's dashboard.

### 4. Set Up the Database & Seed Demo Users

```bash
npx prisma generate
npx prisma db push
node prisma/seed.js
```

This will:
- Generate the Prisma client from the schema
- Create the SQLite database and apply the schema
- Seed two demo accounts:
  - **Resident:** `demo.societymaintenance@gmail.com` / `Demo@1234`
  - **Admin:** `pq@gmail.com` / `Admin@1234`

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at: **[http://localhost:3000](http://localhost:3000)**

---

## ☁️ Deploying to Render

1. Push your code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com) connected to your repo
3. Set the **Build Command** to:
   ```
   npm install && npm run build
   ```
   > The build script automatically runs `prisma generate`, `prisma db push`, `seed.js`, and `next build`
4. Set the **Start Command** to:
   ```
   npm run start
   ```
5. Add these **Environment Variables** on Render:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `file:./dev.db` |
   | `NEXTAUTH_SECRET` | `your-secret-key` |
   | `NEXTAUTH_URL` | `https://your-app-name.onrender.com` ⚠️ Must be your actual Render URL |
   | `RESEND_API_KEY` | `re_your_api_key` |
   | `MAIL_FROM` | `Society Admin <onboarding@resend.dev>` |

   > ⚠️ **Important:** `NEXTAUTH_URL` must be your live Render URL (not localhost), otherwise sign out will redirect incorrectly.

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| POST   | `/api/auth/register`      | Register a new user      |
| POST   | `/api/auth/[...nextauth]` | NextAuth sign-in/sign-out|

### Complaints
| Method | Endpoint                  | Description                                      |
|--------|---------------------------|--------------------------------------------------|
| GET    | `/api/complaints`         | List complaints (filtered by role, status, date, category) |
| POST   | `/api/complaints`         | Create a new complaint (with optional photo)      |
| GET    | `/api/complaints/[id]`    | Get complaint details with history                |
| PATCH  | `/api/complaints/[id]`    | Update status/priority/note (Admin only)          |

### Notices
| Method | Endpoint          | Description                                          |
|--------|-------------------|------------------------------------------------------|
| GET    | `/api/notices`     | Get all notices (important ones first)                |
| POST   | `/api/notices`     | Create a notice (Admin only, emails residents if important) |

### Dashboard
| Method | Endpoint            | Description                        |
|--------|---------------------|------------------------------------|
| GET    | `/api/dashboard`    | Admin analytics (status & category counts) |

---

## 🗄️ Database Schema

### User
| Field      | Type     | Description                  |
|------------|----------|------------------------------|
| id         | String   | Unique ID (CUID)             |
| name       | String   | Full name                    |
| email      | String   | Email (unique)               |
| password   | String   | Bcrypt hashed password       |
| role       | String   | `ADMIN` or `RESIDENT`        |
| createdAt  | DateTime | Account creation timestamp   |

### Complaint
| Field       | Type     | Description                           |
|-------------|----------|---------------------------------------|
| id          | String   | Unique ID (CUID)                      |
| title       | String   | Complaint title                       |
| description | String   | Detailed description                  |
| category    | String   | e.g., Plumbing, Electrical, Security  |
| photoUrl    | String?  | Optional uploaded image path          |
| status      | String   | Open / In Progress / Resolved / Flagged |
| priority    | String?  | Low / Medium / High                   |
| userId      | String   | Resident who raised it                |
| createdAt   | DateTime | When it was raised                    |
| updatedAt   | DateTime | Last update timestamp                 |

### ComplaintHistory
| Field       | Type     | Description                       |
|-------------|----------|-----------------------------------|
| id          | String   | Unique ID (CUID)                  |
| complaintId | String   | Related complaint                 |
| status      | String   | Status at this point              |
| note        | String?  | Admin note / comment              |
| actorId     | String   | Who made the change               |
| createdAt   | DateTime | When the change was made          |

### Notice
| Field       | Type     | Description                       |
|-------------|----------|-----------------------------------|
| id          | String   | Unique ID (CUID)                  |
| title       | String   | Notice title                      |
| content     | String   | Notice body                       |
| isImportant | Boolean  | If true, emails all residents     |
| authorId    | String   | Admin who posted it               |
| createdAt   | DateTime | When it was posted                |

---

## 📧 Email Notifications

The app sends real email notifications using **Resend** in these scenarios:

1. **Complaint Status Change** — When an admin updates a complaint's status (e.g., Open → In Progress → Resolved), the resident who raised it receives an email with the new status and any admin notes.

2. **Important Notice Posted** — When an admin posts a notice marked as "Important", all residents in the system receive an email with the notice content.

---

## 🧪 Available Scripts

| Script            | Command                  | Description                    |
|-------------------|--------------------------|--------------------------------|
| Dev Server        | `npm run dev`            | Start development server       |
| Build             | `npm run build`          | Generate + push DB + seed + build |
| Start Production  | `npm run start`          | Start production server        |
| Lint              | `npm run lint`           | Run ESLint                     |
| Seed Demo Users   | `node prisma/seed.js`    | Create/reset demo accounts     |
| Prisma Generate   | `npx prisma generate`    | Generate Prisma client         |
| Prisma DB Push    | `npx prisma db push`     | Push schema to database        |
| Prisma Studio     | `npx prisma studio`      | Open visual database editor    |

---

## 🔐 User Roles

| Role       | Permissions                                                        |
|------------|--------------------------------------------------------------------|
| **ADMIN**  | View dashboard, manage all complaints, set priority, update status, post notices |
| **RESIDENT** | Raise complaints, track own complaints, view notice board        |

---

## 📝 License

This project is for educational and demonstration purposes.
