# Deployment

This bot is designed to run as a lightweight background process in a server environment or a containerized host.

## Production deployment checklist

- Set environment variables from a secure secret manager or deployment platform.
- Use a dedicated Discord bot token.
- Use a dedicated log channel for warnings and errors.
- Ensure the Google service account has read access to the spreadsheet.
- Keep the runtime timezone configured explicitly.
- Confirm that the reminder channel and log channel IDs are valid.

## Recommended operational pattern

- Run the bot as a long-lived process or service.
- Use a process manager if needed (for example systemd, PM2, Docker, or a managed host).
- Keep the app resilient: a failed row should not bring down the bot.
- Log warnings and errors to the configured Discord log channel.

## GitHub Actions deployment

The lowest-friction free-hosting option for this project is GitHub Actions.

The workflow is intentionally small and one-shot:

- it checks out the repo
- installs dependencies
- builds the app
- runs the reminder job once
- commits the persisted reminder state back to the repo
- exits cleanly

The workflow file lives at `.github/workflows/weekly-reminder.yml` and supports both:

- a scheduled Monday run
- an on-demand `workflow_dispatch` trigger for manual testing or ad hoc execution

### Required GitHub secrets

Add these repository or environment secrets before enabling the workflow:

- `DISCORD_TOKEN`
- `DISCORD_GUILD_ID`
- `DISCORD_REMINDER_CHANNEL_ID`
- `DISCORD_LOG_CHANNEL_ID`
- `GOOGLE_SHEET_ID`
- `GOOGLE_SHEET_NAME`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `HOST_TO_DISCORD_ID`

Optional runtime settings:

- `REMINDER_STATE_PATH` — defaults to `.github/reminder-state.txt`

## Idempotency and duplicate protection

The reminder runner keeps a small state file in the repository to prevent the same plan from being sent twice during retry or duplicate workflow runs.

The dedupe key is built from the plan date, title, and owner list. If the state file already matches the current reminder target, the app logs a skip and exits without sending a second message.

This is important for GitHub Actions because retries and manual re-runs can otherwise post duplicate reminders to Discord.

## Deployment notes

- Do not commit `.env` files or credential files.
- Avoid hardcoding IDs in source control.
- Keep the config values explicit and easy to audit.
- If the sheet owner changes or the sheet structure changes, update config and validation logic rather than spreading assumptions across the app.
- Use `workflow_dispatch` for manual validation before you rely on the cron schedule.
