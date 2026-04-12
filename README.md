# Code Buddy

Code Buddy is a full-stack AI code review platform built with React, Vite, Tailwind CSS, Monaco Editor, Node.js, Express, Prisma, MySQL, JWT authentication, GitHub OAuth, and LLM-powered code review.

## Overview

This project helps developers:

- paste code and get AI review feedback
- analyze repository files from GitHub
- store review history
- inspect score trends and code metrics
- review bugs, performance issues, and security issues in one workspace

The platform combines local static metrics with LLM-generated review output so users can understand both code quality and optimization opportunities.

## Core Features

- JWT-based registration and login
- GitHub OAuth connection flow
- AI-powered pasted-code review
- GitHub repository file browsing and review
- Review history persistence in MySQL
- Code metrics:
  - line count
  - function count
  - loop count
  - nested loop depth
  - complexity approximation
- Insights dashboard for saved reviews
- Rate limiting, validation, request sanitization, and centralized error handling

## Tech Stack

- Frontend: React 19, Vite, TypeScript, Tailwind CSS, Monaco Editor
- Backend: Node.js, Express, TypeScript
- Database: MySQL + Prisma
- Auth: JWT + GitHub OAuth
- AI: Groq-compatible LLM API integration

## Monorepo Structure

```text
ai-code-reviewer/
├── client/                  # React frontend
├── server/                  # Express backend
├── shared/                  # shared workspace package
├── docs/                    # architecture, demo, and portfolio docs
├── infrastructure/          # supporting infrastructure assets
└── README.md
```

## Frontend Highlights

- [client/src/features/auth/pages/Login.tsx](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/client/src/features/auth/pages/Login.tsx)
- [client/src/features/dashboard/pages/Dashboard.tsx](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/client/src/features/dashboard/pages/Dashboard.tsx)
- [client/src/features/editor/pages/CodeEditorPage.tsx](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/client/src/features/editor/pages/CodeEditorPage.tsx)
- [client/src/features/repositories/pages/Repositories.tsx](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/client/src/features/repositories/pages/Repositories.tsx)
- [client/src/features/reviews/pages/ReviewHistoryPage.tsx](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/client/src/features/reviews/pages/ReviewHistoryPage.tsx)
- [client/src/features/insights/pages/InsightsPage.tsx](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/client/src/features/insights/pages/InsightsPage.tsx)

## Backend Highlights

- [server/src/app.ts](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server/src/app.ts)
- [server/src/controllers/auth.controller.ts](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server/src/controllers/auth.controller.ts)
- [server/src/controllers/github.controller.ts](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server/src/controllers/github.controller.ts)
- [server/src/controllers/reviews.controller.ts](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server/src/controllers/reviews.controller.ts)
- [server/src/controllers/repositories.controller.ts](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server/src/controllers/repositories.controller.ts)
- [server/src/services/review.service.ts](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server/src/services/review.service.ts)
- [server/src/services/repository.service.ts](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server/src/services/repository.service.ts)
- [server/src/integrations/llm/llm.client.ts](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server/src/integrations/llm/llm.client.ts)
- [server/src/integrations/llm/llm.prompts.ts](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server/src/integrations/llm/llm.prompts.ts)
- [server/prisma/schema.prisma](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server/prisma/schema.prisma)

## Architecture

Detailed notes are in [docs/ARCHITECTURE.md](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/docs/ARCHITECTURE.md).

High-level flow:

```mermaid
flowchart LR
  A["React Client"] --> B["Express API"]
  B --> C["Auth Layer (JWT + GitHub OAuth)"]
  B --> D["Review Services"]
  D --> E["LLM Provider"]
  D --> F["Code Metrics Engine"]
  B --> G["Prisma ORM"]
  G --> H["MySQL"]
  B --> I["GitHub API"]
```

## Local Setup

### 1. Prerequisites

- Node.js 20+
- npm or pnpm
- MySQL 8+
- GitHub OAuth app
- LLM provider API key

### 2. Install Dependencies

```bash
cd "/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server"
npm install

cd "/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/client"
npm install
```

### 3. Configure Environment

Create `server/.env` from [server/.env.example](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server/.env.example).

Important values:

```env
PORT=5002
DATABASE_URL=mysql://root:your_mysql_password@localhost:3306/ai_code_reviewer
JWT_SECRET=replace_with_a_long_random_secret_at_least_32_characters
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5002/api/github/callback
LLM_API_KEY=your_llm_api_key
LLM_API_URL=https://api.groq.com/openai/v1
LLM_MODEL=llama-3.3-70b-versatile
```

### 4. Run Prisma Migration

```bash
cd "/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server"
npx prisma migrate dev
npx prisma generate
```

### 5. Start Backend

```bash
cd "/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server"
npm run dev
```

Backend default URL:

```text
http://localhost:5002
```

### 6. Start Frontend

```bash
cd "/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/client"
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

## GitHub OAuth Setup

Create a GitHub OAuth App with:

- Homepage URL: `http://localhost:5173`
- Authorization callback URL: `http://localhost:5002/api/github/callback`

If you want to connect another GitHub account, switch GitHub accounts on `github.com` first or use an incognito window before clicking `Connect GitHub`.

## API Summary

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/github/login`
- `GET /api/auth/github/callback`

### AI Review

- `POST /api/ai/review`
- `POST /api/reviews/analyze`
- `POST /api/reviews/code`

### Saved Reviews

- `GET /api/reviews/history`
- `GET /api/reviews/insights`

### GitHub

- `GET /api/github/repos`
- `GET /api/repositories/:owner/:repo/files`
- `GET /api/repositories/:owner/:repo/file`
- `POST /api/repositories/review-file`

## Database Models

Primary Prisma models:

- `User`
- `CodeReview`
- `ReviewIssue`

Schema reference:

- [server/prisma/schema.prisma](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server/prisma/schema.prisma)

## Security Notes

- JWT authentication on protected routes
- Auth and AI rate limiting
- Request sanitization middleware
- Zod validation
- Centralized error handling
- Secrets stored in environment variables

## Build Commands

```bash
cd "/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server" && npm run build
cd "/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/client" && npm run build
```

## Documentation Pack

- Architecture: [docs/ARCHITECTURE.md](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/docs/ARCHITECTURE.md)
- Demo flow: [docs/DEMO_SCRIPT.md](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/docs/DEMO_SCRIPT.md)
- Screenshot checklist: [docs/SCREENSHOTS.md](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/docs/SCREENSHOTS.md)
- Resume/project bullets: [docs/RESUME_BULLETS.md](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/docs/RESUME_BULLETS.md)

## Final-Day Notes

This final-day documentation pass includes:

- professional root README
- architecture explanation
- demo walkthrough script
- screenshot capture checklist
- ready-to-use resume/project bullet points

External tasks that still require your own accounts or manual action:

- recording an actual demo video
- adding final screenshots into the repo
- pushing the final code to your GitHub repository
