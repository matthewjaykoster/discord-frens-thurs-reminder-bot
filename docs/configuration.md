# Configuration

This bot should use environment variables for all secrets and runtime settings. A local `.env` file is the expected pattern for development.

For help generating or locating the Discord and Google values, see [`credentials.md`](./credentials.md).

## Required environment variables

```env
DISCORD_TOKEN="your-discord-bot-token"
DISCORD_GUILD_ID="your-guild-id"
DISCORD_REMINDER_CHANNEL_ID="channel-id-for-reminder-posts"
DISCORD_LOG_CHANNEL_ID="channel-id-for-warning-and-error-logs"

GOOGLE_SHEET_ID="your-google-sheet-id"
GOOGLE_SHEET_NAME="Sheet1"
GOOGLE_SERVICE_ACCOUNT_EMAIL="service-account-email"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

REMINDER_DAY_OF_WEEK="Thursday"
REMINDER_RUN_HOUR="9"
REMINDER_RUN_MINUTE="0"

HOST_TO_DISCORD_ID='{"alice":"123456789012345678","jen":"234567890123456789","hannah":"345678901234567890"}'
```

## Host mapping rules

The `Host` column in the spreadsheet can contain one of three patterns:

- A single person name, such as `Alice`
- A group of names, such as `Jen AND Hannah` or `Jen, Hannah`
- The literal word `All` to mean `@everyone`

The parser normalizes names by trimming whitespace and lowercasing, and the environment map should use the same lowercase names for lookup. Example:

```json
{
  "alice": "123456789012345678",
  "jen": "234567890123456789",
  "hannah": "345678901234567890"
}
```

`All` is treated as a special case and resolves to a Discord `@everyone` mention. Multi-name entries are expanded into multiple user mentions and sent in one reminder.

## Notes

- `DISCORD_REMINDER_CHANNEL_ID` is the channel where plan reminders are posted.
- `DISCORD_LOG_CHANNEL_ID` is the dedicated log channel for warnings, errors, and operational issues.
- `REMINDER_DAY_OF_WEEK` controls which day of the week the weekly reminder check should run on.
- `REMINDER_RUN_HOUR` and `REMINDER_RUN_MINUTE` control the local reminder time.
- The bot assumes US Eastern time for all reminder scheduling and daily comparisons.
- `HOST_TO_DISCORD_ID` can be replaced by a different lookup strategy later if needed, but it is a simple way to map human names to Discord IDs.

## Local development

Create a `.env` file in the repo root and keep it out of git. A `.env.example` file can be used as a template for teammates.

## Security

- Never commit tokens, service account keys, or spreadsheet URLs.
- Use a gitignored local config file for secrets.
- Keep values short and explicit; do not hardcode IDs in source files.
