import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQService } from '../rabbitmq.service';
import { Channel, Connection } from 'amqplib';

jest.mock('amqplib', () => ({
    connect: jest.fn(),
}));

describe('RabbitMQService', () => {
    let service: RabbitMQService;
    let mockConnection: jest.Mocked<Connection>;
    let mockChannel: jest.Mocked<Channel>;

    beforeEach(async () => {
        // Create mock Connection and Channel
        mockConnection = {
            createChannel: jest.fn(),
            close: jest.fn(),
        } as unknown as jest.Mocked<Connection>;

        mockChannel = {
            assertQueue: jest.fn(),
            sendToQueue: jest.fn(),
            consume: jest.fn(),
            ack: jest.fn(),
            reject: jest.fn(),
            close: jest.fn(),
            cancel: jest.fn(),
        } as unknown as jest.Mocked<Channel>;

        (require('amqplib').connect as jest.Mock).mockResolvedValue(mockConnection);
        mockConnection.createChannel.mockResolvedValue(mockChannel);

        const module: TestingModule = await Test.createTestingModule({
            providers: [RabbitMQService],
        }).compile();

        service = module.get<RabbitMQService>(RabbitMQService);
        await service.onModuleInit();
    });

    afterEach(async () => {
        jest.clearAllMocks();
    });

    describe('onModuleInit', () => {
        it('should connect to RabbitMQ and create a channel', async () => {
            expect(mockConnection.createChannel).toHaveBeenCalled();
            expect(mockChannel).toBeDefined();
        });

        it('should log an error if connection fails', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            (require('amqplib').connect as jest.Mock).mockRejectedValue(new Error('Connection Error'));

            await service.onModuleInit();
            expect(consoleSpy).toHaveBeenCalledWith('RabbitMQ Connection Error:', expect.any(Error));
        });
    });

    describe('onModuleDestroy', () => {
        it('should close channel and connection', async () => {
            await service.onModuleDestroy();
            expect(mockChannel.close).toHaveBeenCalled();
            expect(mockConnection.close).toHaveBeenCalled();
        });

        it('should log an error if disconnection fails', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockChannel.close.mockRejectedValue(new Error('Disconnection Error'));

            await service.onModuleDestroy();
            expect(consoleSpy).toHaveBeenCalledWith('RabbitMQ Disconnection Error:', expect.any(Error));
        });
    });

    describe('queueMessage', () => {
        it('should assert the queue and send a message', async () => {
            const message = { recipientId: 'user123', content: 'Hello' };
            const queueName = `user_messages_${message.recipientId}`;

            await service.queueMessage(message);

            expect(mockChannel.assertQueue).toHaveBeenCalledWith(queueName, {
                durable: true,
                arguments: { 'x-message-ttl': 30 * 24 * 60 * 60 * 1000 },
            });
            expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
                queueName,
                Buffer.from(JSON.stringify(message)),
                { persistent: true }
            );
        });

        it('should log an error if message queuing fails', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockChannel.assertQueue.mockRejectedValue(new Error('Queue Error'));

            await expect(service.queueMessage({ recipientId: 'user123', content: 'Hello' }))
                .rejects.toThrow('Queue Error');
            expect(consoleSpy).toHaveBeenCalledWith('Error queuing message:', expect.any(Error));
        });
    });

    describe('startConsumingForUser', () => {
        it('should assert the queue, consume messages, and call callback', async () => {
            const userId = 'user123';
            const queueName = `user_messages_${userId}`;
            const message = { content: 'Hello' };
            const mockData = { content: Buffer.from(JSON.stringify(message)) };

            mockChannel.consume.mockImplementation(async (_, callback) => {
                await callback(mockData);
                return { consumerTag: 'consumer123' };
            });

            const callback = jest.fn().mockResolvedValueOnce(undefined);

            await service.startConsumingForUser(userId, callback);

            expect(mockChannel.assertQueue).toHaveBeenCalledWith(queueName, {
                durable: true,
                arguments: { 'x-message-ttl': 30 * 24 * 60 * 60 * 1000 },
            });
            expect(mockChannel.consume).toHaveBeenCalledWith(
                queueName,
                expect.any(Function)
            );
            expect(callback).toHaveBeenCalledWith(message);
            expect(service['activeConsumers'].get(userId)).toEqual('consumer123');
        });

        it('should log an error if setting up the consumer fails', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockChannel.consume.mockRejectedValue(new Error('Consumer Error'));

            await service.startConsumingForUser('user123', jest.fn());
            expect(consoleSpy).toHaveBeenCalledWith('Error setting up consumer:', expect.any(Error));
        });
    });

    describe('stopConsumingForUser', () => {
        it('should cancel the consumer for a specific user', async () => {
            const userId = 'user123';
            service['activeConsumers'].set(userId, 'consumerTag123');

            await service.stopConsumingForUser(userId);

            expect(mockChannel.cancel).toHaveBeenCalledWith('consumerTag123');
            expect(service['activeConsumers'].has(userId)).toBe(false);
        });

        it('should log an error if consumer cancellation fails', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockChannel.cancel.mockRejectedValue(new Error('Cancel Error'));
            service['activeConsumers'].set('user123', 'consumerTag123');

            await service.stopConsumingForUser('user123');
            expect(consoleSpy).toHaveBeenCalledWith('Error canceling consumer:', expect.any(Error));
        });
    });
});
