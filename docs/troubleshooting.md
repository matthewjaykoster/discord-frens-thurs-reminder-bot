# Troubleshooting

## Common issues

### The bot does not post reminders

Check:

- the Discord token is valid
- the target reminder channel ID is correct
- the bot has permission to send messages in that channel
- the scheduler is configured to run at the expected time

### The Google Sheet is not being read

Check:

- the Google service account has read access to the sheet
- the sheet ID and worksheet name are correct
- the sheet headers match `Date`, `Host`, `Activity`, and `Notes`

### Host names do not resolve to Discord users

Check:

- the name normalization rules are consistent
- the config mapping matches the actual host strings
- the bot has access to the guild and can resolve guild members

### Wrong date assumptions

Check:

- the parser accepts both `mm-dd` and `mm/dd/yyyy` values
- month-day strings are using the rolling 6-month window logic
- edge cases near year boundaries are handled gracefully

## Operational guidance

- Log warnings and errors to the configured bot log channel.
- Keep the process alive even when a single row fails.
- Prefer explicit logging over silent failures.
- Add fixture-based or mocked tests for parsing and selection logic.
