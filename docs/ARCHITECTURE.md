# Architecture

## System Design

The project follows a layered backend structure and a feature-based frontend structure.

### Frontend

- Router and guarded routes live in the app layer.
- Feature folders group page logic, API clients, and UI components together.
- Shared UI components handle page headers, banners, and spinners.
- Monaco Editor powers the code editing experience.

Key frontend entry points:

- [client/src/app/router/index.tsx](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/client/src/app/router/index.tsx)
- [client/src/features/editor/pages/CodeEditorPage.tsx](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/client/src/features/editor/pages/CodeEditorPage.tsx)
- [client/src/features/repositories/pages/Repositories.tsx](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/client/src/features/repositories/pages/Repositories.tsx)

### Backend

Backend responsibilities are separated into:

- `routes/`: endpoint declarations
- `controllers/`: request/response orchestration
- `services/`: business logic
- `repositories/`: persistence access
- `integrations/`: external providers like GitHub and the LLM
- `middlewares/`: auth, rate limiting, request sanitation, validation, error handling

Key backend entry points:

- [server/src/app.ts](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server/src/app.ts)
- [server/src/controllers/reviews.controller.ts](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server/src/controllers/reviews.controller.ts)
- [server/src/services/review.service.ts](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server/src/services/review.service.ts)

## Review Flow

1. User logs in with email/password and receives a JWT.
2. Frontend stores the JWT and calls protected review routes.
3. User submits pasted code or selects a repository file.
4. Backend validates the request with Zod.
5. Review service sends code to the LLM integration.
6. LLM response is parsed and normalized.
7. Static metrics are calculated locally.
8. Final review is saved in MySQL through Prisma.
9. Frontend renders issues, scores, metrics, and improved code.

## GitHub Flow

1. User clicks `Connect GitHub`.
2. Backend redirects to GitHub OAuth.
3. GitHub returns an authorization code.
4. Backend exchanges the code for an access token.
5. Token is stored against the current app user.
6. Repository APIs use the authenticated user’s saved GitHub token.

## Database Design

### User

- login identity
- hashed password
- optional GitHub token

### CodeReview

- original code
- improved code
- score snapshot
- repository metadata
- metrics snapshot
- ownership by app user

### ReviewIssue

- issue type
- severity
- line number
- recommendation

## Security Architecture

- JWT protects review, repo, and history routes
- route-level and global rate limiting reduce abuse
- sanitized request input lowers injection risk
- environment variables protect secrets
- GitHub tokens are tied to the logged-in app user

## AI Layer

The AI integration uses:

- prompt templates in [server/src/integrations/llm/llm.prompts.ts](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server/src/integrations/llm/llm.prompts.ts)
- HTTP client logic in [server/src/integrations/llm/llm.client.ts](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server/src/integrations/llm/llm.client.ts)
- response parsing and normalization in [server/src/integrations/llm/llm.parser.ts](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server/src/integrations/llm/llm.parser.ts)

The app combines:

- LLM reasoning for code issues and improved code
- deterministic local metrics from [server/src/services/code-metrics.service.ts](/Users/sujalkushwaha/Documents/New project/ai-code-reviewer/server/src/services/code-metrics.service.ts)

## Tradeoffs

- The app uses direct GitHub OAuth instead of a more complex organization-wide auth strategy.
- AI review quality depends on the configured provider and model.
- Some deployment files exist in the repo but still need project-specific production hardening if you deploy publicly.
