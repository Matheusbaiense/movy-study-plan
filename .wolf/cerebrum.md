# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-06-10

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

- Prefer fixing documented bugs before starting planned features, even when the feature work is already scoped.

## Key Learnings

- **Project:** movy-study-plan
- **Description:** Simulador local para criar cotações e study plans da Movy Education.

- Validation must run in a temporary clone outside Google Drive when npm/node_modules are involved; Google Drive can corrupt or stall dependency installs.
- Timetable value `Manha` is a persisted/internal value; display it as `Manhã` via a label map instead of changing stored data.

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

- [2026-06-11] Do not use `git clone --local` from the Google Drive workspace for validation; hardlink creation can fail. Use `git clone --no-local` or a normal copy outside Drive.

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->

- [2026-06-11] Kept the `Manha` persisted value unchanged and added a UI label map so existing proposal data remains compatible while the visible Portuguese accent is correct.
