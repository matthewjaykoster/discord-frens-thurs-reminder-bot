import { createDiscordClient } from './bot/client.js';
import { loadConfig } from './config/env.js';
import { runReminderCheck } from './scheduler/weekly.js';

async function main(): Promise<void> {
    const config = loadConfig();
    const client = createDiscordClient(config);

    client.on('ready', async () => {
        try {
            await runReminderCheck(client, config);
        } catch (error) {
            console.error('Reminder check threw an error:', error);
        }
    });
}

main().catch((error) => {
    console.error('Bot failed to start:', error);
});
