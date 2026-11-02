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

## Deployment notes

- Do not commit `.env` files or credential files.
- Avoid hardcoding IDs in source control.
- Keep the config values explicit and easy to audit.
- If the sheet owner changes or the sheet structure changes, update config and validation logic rather than spreading assumptions across the app.
