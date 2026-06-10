# ⚡ ThunderCrawler

A full-stack, production-grade **web crawler** built with **Next.js 16**, **TypeScript**, **Prisma**, and **Redis**. ThunderCrawler lets you submit URLs, track crawl jobs in real time via WebSockets, and persist results to a serverless PostgreSQL database — all from a clean, modern UI.

---

## ✨ Features

- 🕷️ **Async web crawling** — submit URLs and crawl them in the background via dedicated workers
- 🔴 **Real-time progress updates** powered by WebSockets (`ws`)
- 🔐 **Authentication** with NextAuth v5 — credential-based login with bcrypt password hashing
- 🗄️ **Database persistence** via Prisma ORM + Neon (serverless PostgreSQL)
- ⚡ **Redis-backed job queue** — workers pull crawl jobs from a Redis queue (Docker Compose included)
- 🛡️ **Input validation** with Zod schemas
- 🎨 **Modern UI** built with Tailwind CSS v4, Radix UI, and shadcn/ui components
- 🧪 **Tests** directory included for unit/integration coverage

---

## 🛠️ Tech Stack

| Category        | Technology                                         |
|-----------------|----------------------------------------------------|
| Framework       | Next.js 16 (App Router)                            |
| Language        | TypeScript 5                                       |
| Auth            | NextAuth v5 (Prisma Adapter) + bcryptjs            |
| Database        | PostgreSQL via Neon (serverless) + Prisma ORM v7   |
| Job Queue       | Redis 7 (Docker)                                   |
| Real-time       | WebSockets (`ws`)                                  |
| UI              | Tailwind CSS v4, Radix UI, shadcn/ui, Lucide React |
| Validation      | Zod                                                |
| Package Manager | Bun / npm                                          |

---

## 📁 Project Structure

```
ThunderCrawler/
├── app/                  # Next.js App Router — pages & API routes
├── actions/              # Next.js Server Actions
├── components/           # Reusable React UI components (shadcn/ui)
├── config/               # App-wide configuration
├── generated/prisma/     # Auto-generated Prisma client
├── hooks/                # Custom React hooks
├── lib/                  # Shared utilities (Prisma client, helpers)
├── prisma/               # Prisma schema & migrations
├── public/               # Static assets
├── tests/                # Unit & integration tests
├── types/                # Global TypeScript type definitions
├── workers/              # Background crawl worker processes
├── docker-compose.yml    # Redis service for local development
├── index.ts              # Standalone Prisma entry point / seed script
├── middleware.ts          # Next.js middleware (auth guards, routing)
├── next.config.ts        # Next.js configuration
└── prisma.config.ts      # Prisma configuration
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ or [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/) (for Redis)
- A [Neon](https://neon.tech/) account (or any PostgreSQL database)

---

### 1. Clone the Repository

```bash
git clone https://github.com/THUNDERBLD/ThunderCrawler.git
cd ThunderCrawler
```

---

### 2. Install Dependencies

```bash
npm install
# or
bun install
```

---

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Database (Neon / PostgreSQL)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# Redis
REDIS_URL="redis://localhost:6379"
```

---

### 4. Start Redis (via Docker)

```bash
docker-compose up -d
```

This starts a Redis 7 instance on port `6379` with persistence enabled.

---

### 5. Set Up the Database

```bash
# Push the Prisma schema to your database
npx prisma db push

# (Optional) Open Prisma Studio to inspect data
npx prisma studio
```

---

### 6. Run the Development Server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 7. Run Background Workers

In a separate terminal, start the crawl worker:

```bash
# Adjust the path to your worker entry point
npx ts-node workers/index.ts
# or
bun workers/index.ts
```

---

## 🏗️ Architecture Overview

```
Browser ──(HTTP/WS)──► Next.js App
                           │
                    Server Actions
                           │
               ┌───────────┴────────────┐
               ▼                        ▼
         Prisma ORM               Redis Queue
               │                        │
        Neon PostgreSQL           Crawl Workers
         (persist results)        (fetch & crawl URLs)
```

1. A user submits a URL through the UI.
2. A **Server Action** validates the input (Zod) and enqueues a job in **Redis**.
3. A **background worker** dequeues the job, performs the HTTP crawl, and saves results to **PostgreSQL** via **Prisma**.
4. The client receives live progress updates over a **WebSocket** connection.

---

## 📜 Available Scripts

| Script        | Description                          |
|---------------|--------------------------------------|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build for production               |
| `npm run start` | Start the production server        |
| `npm run lint` | Run ESLint                          |

---

## 🚀 Deployment

### Deploy on Vercel

The easiest way to deploy ThunderCrawler is with [Vercel](https://vercel.com/):

1. Push your repository to GitHub.
2. Import it on [vercel.com/new](https://vercel.com/new).
3. Set all environment variables from your `.env` file in the Vercel dashboard.
4. Deploy!

> **Note:** The Redis-backed worker process needs to run separately (e.g., on a VPS, Railway, or Render) since Vercel is serverless and cannot run persistent background processes.

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**THUNDERBLD** — [@THUNDERBLD](https://github.com/THUNDERBLD)
