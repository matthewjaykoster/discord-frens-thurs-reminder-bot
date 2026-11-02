# Discord Frens Thursday Reminder Bot

A small Node.js + TypeScript Discord bot that reads a weekly planning sheet from Google Sheets and posts a reminder for the assigned host or group.

## What this bot does

- Reads the spreadsheet as the system of record for recurring plans
- Supports `Date`, `Host`, `Activity`, and `Notes` columns
- Handles single hosts, multiple hosts, and the special `All` case
- Normalizes names to Discord user IDs via a configurable host map
- Posts a reminder message in a target server channel
- Checks the schedule on a configurable weekday/time
- Logs operational warnings and errors to a dedicated Discord log channel

## Documentation

- [Configuration reference](./docs/configuration.md)
- [Credential setup](./docs/credentials.md)
- [Google Sheet contract](./docs/sheet-contract.md)
- [Usage guide](./docs/usage.md)
- [Deployment notes](./docs/deployment.md)
- [Troubleshooting](./docs/troubleshooting.md)

## Current project structure

```text
.
├── .github/
│   └── copilot-instructions.md
├── coverage/
├── dist/
├── docs/
│   ├── configuration.md
│   ├── credentials.md
│   ├── deployment.md
│   ├── sheet-contract.md
│   ├── troubleshooting.md
│   └── usage.md
├── src/
│   ├── bot/
│   │   └── client.ts
│   ├── commands/
│   ├── config/
│   │   ├── env.ts
│   │   └── index.ts
│   ├── index.ts
│   ├── reminders/
│   │   └── message.ts
│   ├── scheduler/
│   │   └── weekly.ts
│   └── sheet/
│       ├── google.ts
│       ├── parser.ts
│       ├── types.ts
│       └── index.ts
├── tests/
│   ├── bot-client.test.ts
│   ├── config-env.test.ts
│   ├── google-sheets.functional.test.ts
│   ├── index.test.ts
│   ├── reminder-message.test.ts
│   ├── scheduler-weekly.test.ts
│   └── sheet-parser.test.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
└── package-lock.json
```

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Create a local environment file

Copy the example file and fill in your values:

```bash
copy .env.example .env
```

Then edit `.env` with your Discord and Google configuration. See [docs/configuration.md](./docs/configuration.md) and [docs/credentials.md](./docs/credentials.md) for the full list and setup steps.

### 3. Run the app in development mode

```bash
npm run dev
```

### 4. Run the tests

```bash
npm test
```

For coverage:

```bash
npm run test:coverage
```

For the opt-in live Google Sheets check, if you have real credentials configured:

```bash
npm run test:functional
```

### 5. Build for production

```bash
npm run build
npm start
```

## Required environment variables

At minimum, the app expects values for:

- Discord bot token and channel IDs
- Google Sheet ID, sheet name, service account email, and private key
- Reminder schedule time/day settings
- Host-to-Discord-ID mapping

See [docs/configuration.md](./docs/configuration.md) for the full config reference.

## Notes

- Keep secrets in a local `.env` file and never commit them.
- Maintain clear separation between spreadsheet parsing and Discord messaging.
- Prefer readable, explicit logic, especially around year inference and host lookup.
- Use the docs as the source of truth for setup and troubleshooting.
