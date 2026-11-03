# Usage

This bot is designed to run as a small background service that reads a Google Sheet and sends a reminder message in Discord on a scheduled basis.

## Typical flow

1. Load configuration from environment variables.
2. Connect to Google Sheets using service-account credentials.
3. Read the configured sheet.
4. Normalize rows into a reminder model.
5. Resolve `Host` to one or more Discord users, or to `@everyone` for the special `All` case.
6. Determine whether a plan is due or upcoming.
7. Post a reminder in the configured Discord channel.
8. Write operational warnings and errors to the bot log channel.

## Date handling

The sheet stores dates as `mm-dd` and the bot infers the year using a rolling 6-month window. It compares the candidate years around the current date (`currentYear - 1`, `currentYear`, `currentYear + 1`) and selects the closest valid date in that window.

This keeps dates in late-year ranges from being blindly attached to the current year when the nearest valid date is actually in the prior or next year.

## Host handling

The `Host` cell supports three possible patterns:

- a single person, such as `Alice`
- multiple people, such as `Jen AND Hannah` or `Jen, Hannah`
- the special keyword `All`, which sends a `@everyone` reminder

The host names are normalized case-insensitively before lookup, so the same user can appear in any capitalization and still match `HOST_TO_DISCORD_ID`.

## Reminder logic

The app should:

- read the sheet once per configured interval
- parse rows into a common shape
- determine the most relevant upcoming plan
- post a reminder that mentions the assigned person or group
- continue running even if a single row or mapping fails

## Example reminder

```text
@Alice, this is your reminder for your plan this week: Movie night.
Date: 11-09
Notes: Bring snacks.
```

## Local testing

When testing locally, prefer:

- mocked sheet data
- a fixture-based parser test
- a fake Discord client or dry-run logger

This keeps the bot usable without production secrets or live Discord access.
