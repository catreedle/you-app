import { Test, TestingModule } from '@nestjs/testing';
import { MessagingService } from '../messaging.service';
import { UsersService } from '../../users/users.service';
import { RabbitMQService } from '../rabbitmq.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../message.schema';
import { UnauthorizedException } from '@nestjs/common';

interface MockMessage extends Message {
    _id?: string;
}

describe('MessagingService', () => {
    let messagingService: MessagingService;
    let messageModel: Model<MockMessage>;
    let usersService: UsersService;
    let rabbitMQService: RabbitMQService;

    const mockUserService = {
        findById: jest.fn(),
    };

    const mockRabbitMQService = {
        queueMessage: jest.fn(),
    };

    // mock setup to handle save properly
    const mockMessageModel = function(data) {
        const instance = {
            recipientId: data.recipientId,
            content: data.content,
            senderId: data.senderId,
            timestamp: data.timestamp,
            save: jest.fn().mockResolvedValue({
                recipientId: data.recipientId,
                content: data.content,
                senderId: data.senderId,
                timestamp: data.timestamp
            })
        };
        return instance;
    } as any;
    
    mockMessageModel.findByIdAndUpdate = jest.fn();
    mockMessageModel.aggregate = jest.fn();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MessagingService,
                {
                    provide: getModelToken(Message.name),
                    useValue: mockMessageModel,
                },
                {
                    provide: UsersService,
                    useValue: mockUserService,
                },
                {
                    provide: RabbitMQService,
                    useValue: mockRabbitMQService,
                },
            ],
        }).compile();

        messagingService = module.get<MessagingService>(MessagingService);
        messageModel = module.get<Model<MockMessage>>(getModelToken(Message.name));
        usersService = module.get<UsersService>(UsersService);
        rabbitMQService = module.get<RabbitMQService>(RabbitMQService);
    });

    describe('sendMessage', () => {
        it('should throw UnauthorizedException for invalid recipient', async () => {
            mockUserService.findById.mockResolvedValue(null);

            await expect(
                messagingService.sendMessage('invalid_recipient', 'Hello!', 'sender_id'),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should save message and queue it for offline users', async () => {
            mockUserService.findById.mockResolvedValue({ _id: 'recipient_id' });

            const result = await messagingService.sendMessage('recipient_id', 'Hello!', 'sender_id');

            expect(result).toEqual(expect.objectContaining({
                recipientId: 'recipient_id',
                content: 'Hello!',
                senderId: 'sender_id',
                timestamp: expect.any(Date)
            }));
            
            expect(rabbitMQService.queueMessage).toHaveBeenCalledWith(expect.objectContaining({
                recipientId: 'recipient_id',
                content: 'Hello!',
                senderId: 'sender_id',
                timestamp: expect.any(Date)
            }));
        });
    });

    describe('markMessageDelivered', () => {
        it('should mark a message as delivered', async () => {
            const messageId = 'some_message_id';
            mockMessageModel.findByIdAndUpdate.mockResolvedValue({ delivered: true, deliveredAt: new Date() });

            const result = await messagingService.markMessageDelivered(messageId);

            expect(mockMessageModel.findByIdAndUpdate).toHaveBeenCalledWith(messageId, {
                delivered: true,
                deliveredAt: expect.any(Date),
            });
            expect(result).toEqual({ delivered: true, deliveredAt: expect.any(Date) });
        });
    });

    describe('getMessagesForUser', () => {
        it('should return messages for a specific user', async () => {
            const userId = 'recipient_id';
            const messages = [{ senderId: 'sender_id', content: 'Hello!' }];

            mockMessageModel.aggregate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(messages),
            });

            const result = await messagingService.getMessagesForUser(userId);

            expect(mockMessageModel.aggregate).toHaveBeenCalledWith([
                {
                    $match: {
                        recipientId: userId,
                    },
                },
                {
                    $group: {
                        _id: '$senderId',
                        messages: { $push: '$$ROOT' },
                    },
                },
            ]);
            expect(result).toEqual(messages);
        });
    });
});