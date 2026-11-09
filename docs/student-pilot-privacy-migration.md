# Sea.rho7 private-student pilot: staged migration

**Do not deploy Firestore rules alone.** This branch must deploy its frontend changes together with the rules, after a preview build, emulator checks, backups, and a rollback rehearsal.

## What changes
- Profiles at `users/{uid}` can only be read by the owner. Client role, teacher verification and identity fields cannot be changed.
- Chat changes from globally visible `messages/{id}` to private `users/{uid}/messages/{id}`. The visual room selector only groups **your own** messages, not other students' posts.
- ProjectHub tasks move from shared `projects/default-hub/tasks` to `users/{uid}/projects/default-hub/tasks`.
- Academy becomes a simple session-only AI homework screen; peer directory, DMs, tutor enrollment and public projects are intentionally disabled for the 20-student pilot.
- An AI answer with source `local` is labeled as a local helper, not as verified cloud AI.

## Data migration / privacy caveats
- Legacy `messages` and `projects` documents are **not deleted** and are **not migrated** by this patch. After the rule update, users won't see older shared conversations and projects. Before rollout, export the database with an approved administrator and decide whether legacy content must be retained separately. Do not assign shared records to owners without reliable provenance and consent.
- A client can still create an AI-labeled message in **its own private** chat; this is not server-verifiable provenance. Only a trusted backend should produce auditable AI history in a later phase.
- Academy responses are session-only; they are lost on reload. This is explicitly shown in the interface.
- Self-declared teacher accounts previously created must be reviewed by the administrator. Rules block new client escalation but do not automatically revoke existing claims.
- Current browsing app may hold a provider key in local storage; review key handling and remove browser-visible provider keys before wider launch.
- Existing Firebase environment and aliases must be verified before deploy; repo code is not proof of live config.

## Tests
Run `npm ci`, then `npm run lint`. For Firestore tests, install `@firebase/rules-unit-testing` and `firebase-tools` locally and run:

```sh
npx firebase emulators:exec --project demo-searho7-privacy --only firestore "node --test tests/firestore.rules.test.cjs"
```

Requires Java 21. CI workflow runs these steps on the pull request. Test owner/stranger/unauthenticated access and role escalation. This is not a substitute for full end-to-end testing on a real Firebase preview.

## Pre-release gates
1. Confirm current Firebase project ID, DNS target, existing students and data retention requirements.
2. Back up Firestore and verify restoration strategy.
3. Check CI, peer review source changes, and test student sign-in/anonymous login using a staging Firebase project.
4. Validate the AI question path, model fallback label, history isolation, project isolation and phone UI.
5. Deploy frontend and rules together with a written rollback; validate health, access isolation, and logs.
6. Review AWS spend and linked backend separately. **No live AWS/Firebase changes have been made through this branch.**
