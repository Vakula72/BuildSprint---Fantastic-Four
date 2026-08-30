# Full Project Audit: Agentic Job Hunt Copilot

## Severity 1 (Critical):
1. **NextAuth Edge Compatibility:** NextAuth runs the `authorize` callback in edge environments on platforms like Vercel. `bcryptjs` and `better-sqlite3` are not fully compatible with the edge runtime, leading to silent failures or `CredentialsSignin` errors during production login flows. The dynamic import trick `await import('bcryptjs')` inside the `authorize` function is brittle and breaking the production build runtime, causing `CredentialsSignin` errors as seen in the stack trace.
2. **Signup Action Edge Compatibility:** `signupAction` inside `src/app/(auth)/signup/page.tsx` uses `bcryptjs` and `better-sqlite3` inside a server action. Next.js server actions are safer, but NextAuth's `authorize` is the main culprit here.

## Severity 2 (High):
1. **Layout Inheritance Bug:** The `/login` and `/signup` pages were inheriting the global Sidebar and Header because they were placed alongside the dashboard pages under `RootLayout`. I have already extracted the dashboard pages into a `(dashboard)` route group and moved `Header` and `Sidebar` to the `(dashboard)/layout.tsx` to fix this, ensuring the auth pages are full-screen.
2. **Dashboard Redirect on Unauthenticated Request:** The `/` (DashboardPage) fetches data and manually redirects to `/login` if it hits a 401. However, the root `/` route is marked as public in `middleware.ts`, but the dashboard requires auth. The middleware should protect `/` directly instead of relying on client-side fetching to fail.

## Severity 3 (Warning):
1. **Middleware Logic:** `isPublicRoute` includes `/`. But the root page is actually the dashboard, which should be protected. This causes a flash of unauthenticated content or unnecessary client-side redirects.
2. **Vitest Failures:** Tests D, E, and F in `tests/agent.test.ts` are failing because `GEMINI_API_KEY` is not set in the test environment, and the fallback logic relies on `console.error` which litters the test output, but ultimately the tests pass because the fallback works. However, the error output is messy.

## Action Plan:
1.  **Refactor Auth Edge Compatibility:** I will create a separate server action or dedicated Node.js runtime API route for the actual password comparison, or ensure `auth.ts` is explicitly forced into the Node.js runtime to guarantee `bcryptjs` and `better-sqlite3` work without edge crashes.
2.  **Update Middleware:** Change `isPublicRoute` in `middleware.ts` to NOT include `/`. The root path `/` is the dashboard and should be strictly protected by the middleware, redirecting to `/login` before rendering anything.
3.  **Ensure Signup is Node Runtime:** Verify `src/app/(auth)/signup/page.tsx` is executing in the Node runtime (which is default for Server Actions) to safely use `bcryptjs`.
