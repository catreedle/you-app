import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connect, Connection, Channel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private connection: Connection;
    private channel: Channel;
    private readonly QUEUE_PREFIX = 'user_messages_';
    private activeConsumers: Map<string, string> = new Map(); // userId -> consumerTag

    async onModuleInit() {
        try {
            this.connection = await connect('amqp://localhost:5672');
            this.channel = await this.connection.createChannel();
            console.log('RabbitMQ Connected');
        } catch (error) {
            console.error('RabbitMQ Connection Error:', error);
        }
    }

    async onModuleDestroy() {
        try {
            // Cancel all consumers before shutting down
            for (const [_, consumerTag] of this.activeConsumers) {
                await this.channel?.cancel(consumerTag);
            }
            await this.channel?.close();
            await this.connection?.close();
        } catch (error) {
            console.error('RabbitMQ Disconnection Error:', error);
        }
    }

    private getUserQueue(userId: string): string {
        return `${this.QUEUE_PREFIX}${userId}`;
    }

    async queueMessage(message: any) {
        const userQueue = this.getUserQueue(message.recipientId);
        
        try {
            // Ensure queue exists for the user
            await this.channel.assertQueue(userQueue, { 
                durable: true,
                // Optional: Set message TTL (e.g., 30 days)
                arguments: {
                    'x-message-ttl': 30 * 24 * 60 * 60 * 1000
                }
            });

            await this.channel.sendToQueue(
                userQueue,
                Buffer.from(JSON.stringify(message)),
                { persistent: true }
            );
        } catch (error) {
            console.error('Error queuing message:', error);
            throw error;
        }
    }

    async startConsumingForUser(userId: string, callback: (message: any) => Promise<void>) {
        const userQueue = this.getUserQueue(userId);
        
        try {
            // Ensure queue exists
            await this.channel.assertQueue(userQueue, { 
                durable: true,
                arguments: {
                    'x-message-ttl': 30 * 24 * 60 * 60 * 1000
                }
            });

            // Start consuming messages for this user
            const { consumerTag } = await this.channel.consume(userQueue, async (data) => {
                if (data) {
                    const message = JSON.parse(data.content.toString());
                    try {
                        await callback(message);
                        this.channel.ack(data);
                    } catch (error) {
                        console.error('Error processing message:', error);
                        // Reject without requeue as we'll retry when user reconnects
                        this.channel.reject(data, false);
                    }
                }
            });

            // Store consumer tag for later cancellation
            this.activeConsumers.set(userId, consumerTag);
            console.log(`Started consuming messages for user ${userId}`);
        } catch (error) {
            console.error('Error setting up consumer:', error);
        }
    }

    async stopConsumingForUser(userId: string) {
        const consumerTag = this.activeConsumers.get(userId);
        if (consumerTag) {
            try {
                await this.channel.cancel(consumerTag);
                this.activeConsumers.delete(userId);
                console.log(`Stopped consuming messages for user ${userId}`);
            } catch (error) {
                console.error('Error canceling consumer:', error);
            }
        }
    }
}