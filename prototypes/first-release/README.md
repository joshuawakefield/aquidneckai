# AQ-024 first-release prototype

Proposed v0.1, not an approved final design or deployed reader. See the [design brief](../../docs/reports/2026-10-06-first-release-design-v01.md).

Use Node 22 and the existing installed dependencies:

```sh
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:8080/prototypes/first-release/`. Routes use `#/`, `#/evidence`, `#/practice`, `#/connect`. This is a separate HTML entry, absent from the normal app build and navigation. No new application dependency, service call or real sending/booking exists. Explicit external links open official sources in a new tab.

```sh
npx vitest run src/test/first-release.test.tsx
npx tsc --noEmit -p tsconfig.app.json
npx tsc --noEmit --jsx react-jsx --module esnext --moduleResolution bundler --target es2020 --skipLibCheck prototypes/first-release/main.tsx
npx eslint prototypes/first-release src/test/first-release.test.tsx
# Optional isolated build; choose an unused local output directory:
npx vite build prototypes/first-release --config vite.config.ts --outDir /tmp/aq024-prototype-build
```

Manual review: walk overview → source → practice → connection at desktop and 390px; expand the prompt with Enter, reveal/hide the review repeatedly, follow back links and browser history, cancel/reenter practice, preview/cancel the external contact route, reload each detail and test an unknown hash route. Confirm no mistaken real sending/booking, no overflow, visible focus, original source labels, explicit unknowns and no storage/API requests. Screenshots and temporary browser tooling stay outside Git.

The prototype is local demonstration content, not a synchronized news feed. Source dates and uncertainty are visible; do not present these examples as a currently available opportunity or an endorsement. No user validation or measured benefit has occurred.
