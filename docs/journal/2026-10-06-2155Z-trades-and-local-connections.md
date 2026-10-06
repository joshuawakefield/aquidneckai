# Small trades-owner focus and local collaboration

Task IDs: AQ-019 follow-up; AQ-011 reader-journey definition
Started: 2026-10-06T21:55:00Z (minute precision)
Starting commit: e8270f57331d64f491ef5090f6f17bc537e0aaf5
Status: preferences captured; reader-journey definition completed; implementation open

## Request

The owner wants to help local blue-collar business owners who work for themselves or with a very small team. They should learn to free themselves with AI and automation for the annoying parts of getting, keeping and refreshing customers. The preferred first connection path is peers, collaborators and local projects.

## Changes

Updated charter, operating interview status, D-021, current state, backlog and visitor tracker. Created the AQ-011 reader-journey/usefulness report from the owner answers and current reader source. Prioritized a fictional customer follow-up exercise as the first implementation, with a separately tracked source-backed local connection gap. No application code, live service or public deployment changed.

## Decisions and rationale

The first reader focus sharpens the existing business tilt without removing residents or broader scope. Choose an exercise using known facts and manual checking/sending so readers can judge useful effort saved. Peers/projects remain a real-evidence requirement rather than relabeling generic training resources. The initial measures are proposals; no user study or savings claim has been made.

## Verification

Source inspection establishes the eight-resource/three-experiment implementation baseline. Existing ReaderHome fixtures run with cloud-check.runCommand offline isolation: 5 tests passed. node scripts/check-project-memory.mjs --base e8270f57331d64f491ef5090f6f17bc537e0aaf5 passed for 39 Markdown files; git diff --check passed. These verify the current baseline and record structure, not the proposed new features. No user outreach, telemetry, production credentials, inference, worker, migration, deployment or cost change used.

## Next steps

Implement AQ-021's bounded customer-follow-up exercise and test the actual UI. Research AQ-022's first local peer/project candidate with source evidence before publishing a resource. Scheduling remains separately blocked in AQ-020; fresh restored-task verification remains AQ-001.
