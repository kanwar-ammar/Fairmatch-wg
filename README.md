# Fairmatch WG

Fairmatch WG is a WG-matching platform that prioritizes verified lifestyle compatibility over demographic bias. It helps students and residents discover better housing matches, apply to listings, manage interviews, and onboard into WG communities with fairness-focused flows.

## Application Summary

- Student side:
  - Profile and lifestyle preference setup
  - Browse WG listings and apply
  - Track applications and messages
  - Profile insights and matching overview
- Resident side:
  - WG setup and member management
  - Listing management
  - Application review and interview scheduling
  - Blind pre-casting flow before interview reveal

## Prerequisites (Desktop)

Install these before running the project:

- Node.js 20+ (Node 22 recommended)
- pnpm (latest stable)
- Git

Notes:

- The app uses Prisma with SQLite, so no external database server is required for local development.
- A local .env file is required with DATABASE_URL set.

## Environment Setup

Create a .env file in the project root with:

DATABASE_URL="file:./dev.db"

## Install Dependencies

Run from project root:

pnpm install

## Database Setup

Initialize/sync your local database schema:

pnpm db:push

Optional: seed sample data:

pnpm db:seed

## Run the Application

Development mode:

pnpm dev

Then open:

http://localhost:3000

Production mode:

1. Build:

pnpm build

2. Start server:

pnpm start

## Useful Scripts

- pnpm dev: start local development server
- pnpm build: create production build
- pnpm start: run production build
- pnpm lint: run linting
- pnpm db:generate: regenerate Prisma client
- pnpm db:push: sync Prisma schema to SQLite
- pnpm db:studio: open Prisma Studio
- pnpm db:seed: seed initial data
