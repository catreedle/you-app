import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { UsersService } from '../users/users.service';
import { Model } from 'mongoose';
import { Message } from './message.schema';
import { InjectModel } from '@nestjs/mongoose';
import { RabbitMQService } from './rabbitmq.service';

@Injectable()
export class MessagingService {
    private client: ClientProxy;

    constructor(
        @InjectModel(Message.name) private readonly messageModel: Model<Message>,
        private readonly usersService: UsersService,
        private readonly rabbitMQService: RabbitMQService

    ) { }

    async sendMessage(recipientId: string, content: string, senderId: string) {
        if (!(await this.isRecipientValid(recipientId))) {
            throw new UnauthorizedException('Invalid recipient.');
        }

        try {
            const savedMessage = new this.messageModel({
                recipientId,
                content,
                senderId,
                timestamp: new Date(),
            });
            await savedMessage.save();

            // Queue message for offline users
            await this.rabbitMQService.queueMessage(savedMessage);
            return savedMessage;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    private async isRecipientValid(recipientId: string): Promise<boolean> {
        const recipient = await this.usersService.findById(recipientId);
        return !!recipient;
    }

    async markMessageDelivered(messageId: string) {
        return this.messageModel.findByIdAndUpdate(messageId, {
            delivered: true,
            deliveredAt: new Date()
        });
    }

    async getMessagesForUser(userId: string): Promise<Message[]> {
        return this.messageModel.aggregate([
            {
                $match: {
                    recipientId: userId // Filter messages for the specified recipient
                }
            },
            {
                $group: {
                    _id: '$senderId', // Group by senderId
                    messages: { $push: '$$ROOT' } // Push all messages into an array for each sender
                }
            }
        ]).exec();
    }
}
