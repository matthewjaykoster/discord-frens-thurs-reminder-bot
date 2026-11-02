# Discord Frens Thursday Reminder Bot

A small Discord bot that reads weekly plan data from a Google Sheet and posts a reminder in the Discord server for the person or group assigned to that plan.

## What it does

- Reads a Google Sheet with the columns `Date`, `Host`, `Activity`, and `Notes`
- Normalizes rows into a common plan/reminder shape
- Handles three `Host` patterns: a single name, multiple names, or `All`
- Resolves human names like `Alice` to Discord user IDs
- Sends a reminder message in the configured Discord channel
- Runs on a configurable schedule so the reminder check happens at the right time

## Recommended project structure

```text
.
├── .github/
│   └── copilot-instructions.md
├── docs/
│   ├── configuration.md
│   ├── credentials.md
│   ├── deployment.md
│   ├── usage.md
│   └── troubleshooting.md
├── src/
│   ├── bot/
│   ├── commands/
│   ├── config/
│   ├── reminders/
│   ├── scheduler/
│   ├── sheet/
│   └── index.ts
├── tests/
│   └── fixtures/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── README.md
└── ...
```

## Core workflow

1. Load configuration from environment variables.
2. Connect to the Google Sheet.
3. Read rows from the configured worksheet.
4. Parse the `Date` field (`mm-dd`) into a real Date using a rolling 6-month year rule.
5. Match `Host` to one or more Discord user IDs, or to `@everyone` when the value is `All`.
6. Determine the relevant upcoming reminder.
7. Send a mention + message in the configured reminder channel.
8. Log warnings and errors to a dedicated Discord log channel without crashing the bot.

## Expected spreadsheet shape

| Date | Host | Activity | Notes |
| --- | --- | --- | --- |
| 11-02 | Alice | Movie night | Bring snacks |
| 11-09 | Jen AND Hannah | Board games | Maybe at my place |
| 11-16 | All | Community hangout | Open to everyone |

Notes:

- `Date` is stored as `mm-dd`
- `Host` is one of three patterns: single name, multiple names, or `All`
- `Activity` is the main plan description
- `Notes` is optional and may be ignored for the first version

## Configuration

This bot should use environment variables for all secrets and operational settings. See `docs/configuration.md` for the full list.

## Local development

Use a local `.env` file for development and a fixture-based or mocked sheet flow for tests. Avoid depending on production credentials for normal local runs.

## Deployment

See `docs/deployment.md` for deployment guidance and operational notes.

## Usage

See `docs/usage.md` for how the bot checks reminders and how to run it locally.

## Troubleshooting

See `docs/troubleshooting.md` for common issues and debugging steps.

## Date handling and rolling-year logic

The spreadsheet accepts date strings in either `mm-dd` or `mm/dd/yyyy` format. Month-day values are inferred using a rolling 6-month window, while full dates preserve the explicit year from the sheet.

The parser compares candidate years around the current date (`currentYear - 1`, `currentYear`, `currentYear + 1`) and picks the closest valid date within that window. This avoids the common edge case where dates in late July through December should not always be treated as current-year dates if the current date is in January, and vice versa.

## Host handling

The `Host` column supports three patterns:

- a single name such as `Alice`
- a multi-name group such as `Jen AND Hannah` or `Jen, Hannah`
- the special value `All`, which resolves to a Discord `@everyone` mention

Names are normalized case-insensitively and matched against the `HOST_TO_DISCORD_ID` map in lowercase form.

## Notes for future contributors

- Keep spreadsheet parsing and Discord logic separate.
- Prefer readable, explicit functions over over-abstracting.
- Document non-obvious date logic and name-to-user resolution clearly.
- Keep the first version simple and reliable.
