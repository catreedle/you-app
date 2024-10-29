import {
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { RabbitMQService } from './rabbitmq.service';
import { MessagingService } from './messaging.service';

interface UserSocket {
    [userId: string]: string; // Maps userId to Socket ID
}

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class MessagingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private server: Server;
    private users: UserSocket = {};

    constructor(
        private readonly messagingService: MessagingService,
        private readonly rabbitMQService: RabbitMQService
    ) { }

    afterInit(server: Server) {
        this.server = server;
        console.log('WebSocket server initialized');
    }

    async handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);

        client.on('register_user', async (userId: string) => {
            this.users[userId] = client.id;
            console.log(`User ${userId} registered with socket ${client.id}`);
            
            // Start consuming messages for this user
            await this.rabbitMQService.startConsumingForUser(userId, async (message) => {
                try {
                    this.server.to(client.id).emit('receive_message', {
                        senderId: message.senderId,
                        content: message.content,
                        messageId: message._id
                    });
                    
                    await this.messagingService.markMessageDelivered(message._id);
                    console.log(`Message ${message._id} delivered to user ${userId}`);
                } catch (error) {
                    console.error('Error delivering message:', error);
                    throw error;
                }
            });
        });
    }

    async handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);

        // Find and remove the disconnected user
        const userId = Object.keys(this.users).find(
            key => this.users[key] === client.id
        );

        if (userId) {
            delete this.users[userId];
            // Stop consuming messages for this user
            await this.rabbitMQService.stopConsumingForUser(userId);
            console.log(`User ${userId} disconnected`);
        }
    }
}