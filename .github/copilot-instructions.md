# Copilot instructions for this repository

This repo is a small Discord reminder bot for a shared community server. The core workflow is: read weekly plan data from a Google Spreadsheet, determine which plan is due or upcoming, and post a reminder in Discord that tags the user assigned to that plan.

## Product shape and architecture
- Keep the app in three layers: Discord bot/client, spreadsheet integration, and scheduling/reminder logic.
- Use a single bootstrap entrypoint such as `src/index.ts` or `bot.ts` to create the Discord client, load config, connect to Google Sheets, and start the scheduler.
- Store reminder data in clear objects such as `{ ownerId, ownerName, planTitle, dueDate, notes, channelId }` instead of hard-coding schedule behavior into command handlers.
- Group files by domain: `config`, `bot`, `commands`, `scheduler`, `sheet`, `reminders`.

## Data flow and integration pattern
- The Google Sheet is the system of record for weekly plans. Treat each row as a plan record, and normalize it to a shared internal shape before Discord logic uses it.
- Keep spreadsheet access in one integration module: API auth, worksheet access, row parsing, and schema mapping should stay separate from bot messaging.
- The scheduler should decide “what should be sent” based on the sheet data, not Discord commands or ad hoc checks scattered across the app.
- Discord-specific concerns (mentions, channel posting, user lookup, permissions) should remain separate from spreadsheet parsing and time calculations.

## Google Sheet contract and assumptions
- The sheet format is a single table with four columns: `Date`, `Host`, `Activity`, and `Notes`.
- `Date` is stored as a month-day string like `mm-dd` and must be interpreted with an assumed year; use a consistent rolling-window rule instead of assuming one fixed year blindly.
- `Host` is the human-readable name of the owner and must be mapped to a Discord user via a lookup table or name-to-ID resolution.
- `Activity` is the main plan description and should be preserved as the reminder text.
- `Notes` is optional and can be ignored for the first version, but it is useful as a secondary field if richer reminders are added later.
- Keep parsing resilient to user-entered variation: trim whitespace, normalize casing, treat missing values as empty strings, and skip malformed rows without crashing the bot.
- Use a 6-month rolling window when choosing the assumed year: if the parsed date is too far in the future or past, use the nearest valid year in the current/next range rather than a fixed “current year only” strategy.

## Project-specific conventions
- This bot is meant for recurring community coordination, so schedule logic should be timezone-aware and easy to reason about.
- A weekly “digest” pattern is the default: read the sheet once per week, compare rows to the current date, and post a reminder for the relevant plan owner.
- The reminder checking time should be configurable, not hardcoded; prefer a cron-like config value or env var such as `REMINDER_DAY_OF_WEEK`, `REMINDER_RUN_HOUR`, and `REMINDER_RUN_MINUTE`.
- Do not hardcode the spreadsheet ID, sheet name, server ID, channel IDs, Discord user IDs, or logger channel IDs in source files; keep them in environment variables or config.
- Prefer thin command handlers and reusable functions. If a slash command or startup callback triggers a reminder check, it should delegate to a scheduler/helper rather than doing spreadsheet parsing inline.
- Use a dedicated Discord log channel for warnings and errors. The bot should avoid crashes, but it should still report operational issues there for debugging.
- This project assumes US Eastern time for all reminder scheduling and date comparisons.

## Workflow and commands
- Inspect `package.json` before assuming commands; do not invent scripts.
- For a typical Node-based bot, expected commands are `npm install`, `npm run dev`, `npm start`, and optionally `npm test`, but use the repo’s actual scripts.
- If TypeScript is introduced, follow the repo’s configured build/test flow instead of adding new tooling without reason.
- Keep secrets in `.env` or a gitignored local config file; never commit Discord tokens, Google credentials, or spreadsheet URLs.
- Provide a local test path that can run without production secrets, using mocked sheet data or fixture-based tests.

## Documentation and code quality expectations
- Provide clear README documentation for setup, configuration, deployment, and daily operation.
- Add a small set of markdown docs for deployment, usage, env vars, and troubleshooting as the project grows.
- Keep code comments sparse but useful: explain non-obvious date logic, name-to-user resolution rules, and any sheet assumptions that are easy to misread.
- When a function or module does a nontrivial conversion (date parsing, host resolution, or reminder selection), document the exact rule in a nearby comment or doc block.

## Practical implementation guide
- Start with a minimal flow: load config → connect to Google Sheets → fetch rows → map to reminder objects → send mention + message in a target channel.
- Keep mention formatting in one place, e.g. a helper that resolves `ownerId` to a Discord mention string.
- Treat sheet parsing and reminder delivery as separate failure paths: log issues clearly, send them to the configured bot-log channel, and keep the bot process alive.
- Avoid broad abstraction before the core flow is working; the first useful version should be simple and readable.
- Keep the first release focused on reliability and clarity: stable parsing, simple scheduling, and readable docs matter more than clever architecture.
