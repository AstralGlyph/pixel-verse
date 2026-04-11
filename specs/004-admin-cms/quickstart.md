# Quickstart Guide: Admin CMS

**Date**: 2026-04-01  
**Feature**: 004-admin-cms

## Prerequisites

- Node.js 20 LTS
- pnpm (or npm)
- Git

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
```env
# Database
DATABASE_URL=file:./data/cms.db

# Session
SESSION_SECRET=your-secret-key-here

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me-on-first-run
ADMIN_EMAIL=admin@example.com
```

### 3. Initialize Database

```bash
pnpm run db:migrate
```

This creates the SQLite database and all tables.

### 4. Seed Default Data (Optional)

```bash
pnpm run db:seed
```

Creates the default admin user and built-in roles.

### 5. Start Development Server

```bash
pnpm run dev
```

- Admin panel: `http://localhost:4321/admin`
- Blog frontend: `http://localhost:4321`

## First Login

1. Navigate to `http://localhost:4321/admin`
2. Login with credentials from `.env` (`admin` / `change-me-on-first-run`)
3. Change the default password immediately

## Key Directories

```
src/admin/          # Admin UI (React components)
src/api/            # API route handlers
src/lib/db/         # Database schema and connection
src/lib/services/   # Business logic services
src/pages/          # Astro pages (SSR frontend)
src/middleware.ts   # Auth middleware
```

## Common Tasks

### Create a New Post
1. Login to admin panel
2. Click "New Post" in the sidebar
3. Fill in title and content (Markdown supported)
4. Click "Save Draft" or "Publish"

### Upload Media
1. Go to "Media Library" in the sidebar
2. Drag and drop files or click "Upload"
3. Files are stored in `public/uploads/`

### Manage Categories/Tags
1. Go to "Categories" or "Tags" in the sidebar
2. Create, edit, or delete entries
3. Assign to posts during editing

## Running Tests

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e
```

## Building for Production

```bash
pnpm run build
pnpm run preview
```

The production server runs in SSR mode, serving both the admin panel and the blog frontend from a single Node.js process.
