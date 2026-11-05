import { createDiscordClient } from './bot/client.js';
import { loadConfig } from './config/env.js';
import { runReminderCheck } from './scheduler/weekly.js';

async function main(): Promise<void> {
    const config = loadConfig();
    const client = createDiscordClient(config);

    const runOnce = async (): Promise<void> => {
        try {
            await runReminderCheck(client, config);
        } catch (error) {
            console.error('Reminder check threw an error:', error);
        } finally {
            if (typeof client.destroy === 'function') {
                await client.destroy();
            }
        }
    };

    if (typeof client.once === 'function') {
        client.once('ready', runOnce);
        return;
    }

    client.on('ready', runOnce);
}

main().catch((error) => {
    console.error('Bot failed to start (top-level error):', error);
});
