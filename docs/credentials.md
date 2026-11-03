# Getting required credentials

This project needs a Discord bot token and a Google service account setup so it can read the spreadsheet and post reminders.

## Discord setup

### 1. Create the bot

1. Open the Discord developer portal:
   <https://discord.com/developers/applications>
2. Click `New Application`.
3. Give the app a name, such as `Frens Thursday Bot`.
4. Open the `Bot` section.
5. Click `Add Bot`.
6. Under `Token`, click `Reset Token` or `Copy`.
7. Copy the value and save it as `DISCORD_TOKEN`.

Important: keep the token secret. Do not commit it into source control.

### 2. Get Discord IDs

Turn on Developer Mode in Discord:

1. Open User Settings.
2. Go to `Advanced`.
3. Enable `Developer Mode`.

Then:

- Right-click the server name and choose `Copy Server ID` to get `DISCORD_GUILD_ID`.
- Right-click the reminder channel and choose `Copy Channel ID` to get `DISCORD_REMINDER_CHANNEL_ID`.
- Right-click the log channel and choose `Copy Channel ID` to get `DISCORD_LOG_CHANNEL_ID`.
- Right-click a user and choose `Copy User ID` to build `HOST_TO_DISCORD_ID`.

### 3. Build the host map

The spreadsheet uses human-readable names such as `Alice` and `Bob`. The bot needs a mapping from those names to Discord user IDs.

The `Host` column can contain three forms:

- `Alice` for a single user
- `Jen AND Hannah` or `Jen, Hannah` for multiple users
- `All` to mention `@everyone`

The bot normalizes names to lowercase and resolves them case-insensitively. For that reason, the JSON map should store names in lowercase keys.

Example:

```json
{"alice":"123456789012345678","jen":"234567890123456789","hannah":"345678901234567890"}
```

This should be stored in `HOST_TO_DISCORD_ID` as a JSON object string. If you plan to use `All`, there is no Discord user ID to map; the special value is handled directly by the parser.

## Google setup

### 1. Get the Google Sheet ID

Open the Google Sheet in a browser. The URL looks like this:

```text
https://docs.google.com/spreadsheets/d/ABC123XYZ/edit#gid=0
```

The value between `/d/` and `/edit` is the spreadsheet ID:

```text
ABC123XYZ
```

Save it as `GOOGLE_SHEET_ID`.

### 2. Get the worksheet name

The worksheet tab name is often `Sheet1`, but it may be something else. Use the exact tab name as it appears in Google Sheets.

Save it as `GOOGLE_SHEET_NAME`.

### 3. Create a Google service account

1. Open Google Cloud Console:
   <https://console.cloud.google.com/>
2. Create or select a project.
3. Go to `IAM & Admin` → `Service Accounts`.
4. Click `Create Service Account`.
5. Give it a name such as `frens-thursday-bot`.
6. Finish the service account creation flow.

### 4. Create and download a JSON key

1. Open the service account.
2. Go to the `Keys` tab.
3. Click `Add Key` → `Create new key`.
4. Choose `JSON`.
5. Download the file.

Open the downloaded JSON file and copy these values:

- `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → `GOOGLE_PRIVATE_KEY`

Example:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL="reminder-bot@project-id.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 5. Share the sheet with the service account

1. Open the Google Sheet.
2. Click `Share`.
3. Add the service account email.
4. Give it at least `Viewer` access.
5. Save the share settings.

## Example `.env` block

```env
DISCORD_TOKEN="your-discord-bot-token"
DISCORD_GUILD_ID="123456789012345678"
DISCORD_REMINDER_CHANNEL_ID="987654321098765432"
DISCORD_LOG_CHANNEL_ID="111222333444555666"

GOOGLE_SHEET_ID="ABC123XYZ"
GOOGLE_SHEET_NAME="Sheet1"
GOOGLE_SERVICE_ACCOUNT_EMAIL="reminder-bot@project-id.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

HOST_TO_DISCORD_ID='{"alice":"123456789012345678","jen":"234567890123456789","hannah":"345678901234567890"}'
```

## Troubleshooting

- If the bot cannot access Google Sheets, check that the service account has been shared with the file.
- If the bot fails to post in Discord, confirm the bot has permission to send messages in the selected channels.
- If `HOST_TO_DISCORD_ID` does not match user names exactly, normalize the names consistently in the mapping and parser.
