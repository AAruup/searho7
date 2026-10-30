# SEA.RHO7 Proactive Agent (first release)

This branch adds a durable, scheduled goal runner to the existing Firebase Functions backend and exposes a small control panel inside Agent Workbench.

## What it does

- Stores user-owned objectives in Firestore collection `seaRho7AgentGoals`.
- Uses the existing server-side `GEMINI_API_KEY` secret; no customer model keys are required.
- Runs a scheduled worker every five minutes (Asia/Kolkata).
- Advances each objective in bounded planning/review cycles and records progress history.
- Supports pause, resume, stop, and approval-pending states.
- Uses Firestore transactions and short worker leases to reduce duplicate concurrent runs.
- Authenticates every API request with a Firebase ID token and checks goal ownership.

## Important capability boundary

This first release is a proactive planner, not an unrestricted computer-use agent. It can reason, create plans, draft content, maintain checklists, and track progress. It has no email, payment, publishing, deletion, deployment, browser, or arbitrary-code execution tools. It must not claim to have performed those actions. Requests that imply external side effects are routed to an approval-pending state. Approval currently records the user's acknowledgement and lets the agent continue planning; it does not execute the external action.

## API

The Firebase Functions endpoint is:

`https://us-central1-<FIREBASE_PROJECT_ID>.cloudfunctions.net/agenticApi`

All requests require `Authorization: Bearer <Firebase ID token>`.

- `GET`: list up to 30 goals owned by the signed-in user.
- `POST { "action": "create", "objective": "...", "successCriteria": "..." }`
- `POST { "action": "pause" | "resume" | "stop", "goalId": "..." }`
- `POST { "action": "approve", "goalId": "...", "approvalNote": "..." }`

## Deployment checklist

1. Review the branch and run the frontend TypeScript check and Functions syntax/lint checks.
2. Confirm Firebase project, Functions region, Firestore availability, and Scheduler API/billing configuration.
3. Confirm the existing `GEMINI_API_KEY` secret is configured for Functions.
4. Deploy Functions from this branch to a staging Firebase project first.
5. Verify authenticated create/list/pause/resume/stop flows and scheduled worker logs.
6. Only after staging acceptance, merge and deploy production Functions and Hosting through the existing release process.

Do not deploy the scheduled worker to production until the Firebase project and billing/Scheduler configuration have been confirmed. The live application is not changed by this branch alone.
