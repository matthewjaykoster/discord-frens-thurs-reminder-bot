import { Client, GatewayIntentBits, type TextChannel } from 'discord.js';
import type { Config } from '../config/env.js';

export function createDiscordClient(config: Config): Client {
    const client = new Client({
        intents: [GatewayIntentBits.Guilds],
    });

    client.on('ready', () => {
        if (!client.user) {
            return;
        }

        console.log(`[LOG] Logged in as ${client.user.tag}`);
    });

    client.login(config.discordToken).catch((error: unknown) => {
        console.error('[ERROR] Failed to log in to Discord:', error);
    });

    return client;
}

export async function sendReminderMessage(client: Client, config: Config, content: string): Promise<void> {
    const channel = await client.channels.fetch(config.reminderChannelId);

    if (!channel || !('send' in channel)) {
        throw new Error('Discord reminder channel not found or not sendable');
    }

    const textChannel = channel as TextChannel;
    await textChannel.send(content);
}

export async function sendLogMessage(client: Client, config: Config, content: string): Promise<void> {
    try {
        const channel = await client.channels.fetch(config.logChannelId);

        if (!channel || !('send' in channel)) {
            console.error('[ERROR] Failed to send log message: log channel missing or not sendable');
            return;
        }

        const textChannel = channel as TextChannel;
        await textChannel.send(`[LOG] ${content}`);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[ERROR] Failed to send log message: ${message}`);
    }
}
