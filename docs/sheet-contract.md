# Google Sheet contract

This document describes the expected spreadsheet format and the rules the bot applies when reading rows from Google Sheets.

## Expected columns

The sheet is expected to have these columns:

| Column | Purpose |
| --- | --- |
| `Date` | date for the plan or reminder |
| `Host` | owner or owners responsible for the plan |
| `Activity` | the main description for the reminder |
| `Notes` | optional secondary details |

The bot expects these headers to be present and treats the sheet as a single table of plan records.

## Date handling

The `Date` field may appear in one of two forms:

- `mm-dd` such as `11-02`
- `mm/dd/yyyy` such as `12/17/2026`

For month-day values, the bot uses a rolling-window rule to infer the year. It compares nearby candidate years around the current date and chooses the nearest valid date rather than assuming a single fixed year blindly.

This avoids common edge cases around late-year and early-year transitions, where a date such as `12-31` should not always be matched to the current year if the nearest valid occurrence is actually in the prior or next year.

## Host handling

The `Host` field supports three patterns:

- a single person, such as `Alice`
- multiple people, such as `Jen AND Hannah` or `Jen, Hannah`
- the special value `All`, which resolves to a Discord `@everyone` mention

Host names are normalized case-insensitively before lookup. The runtime mapping in `HOST_TO_DISCORD_ID` should use the same lowercase form so that names like `Alice`, `alice`, and `ALICE` all resolve consistently.

## Row parsing behavior

The bot treats each row as a plan record and normalizes it into an internal reminder model before scheduling and messaging logic uses it.

The parser should:

- trim whitespace
- normalize casing for host lookups
- treat missing values as empty strings
- skip malformed rows without crashing the bot
- preserve the human-readable activity text
- ignore `Notes` unless richer reminder output is added later

## Data flow

The app reads the sheet, parses each row, converts it to a normalized object, and then decides whether it is due or upcoming before sending a reminder to Discord.

This separation keeps spreadsheet concerns isolated from bot messaging and scheduling logic.
