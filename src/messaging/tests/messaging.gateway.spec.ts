import { Test, TestingModule } from '@nestjs/testing';
import { MessagingGateway } from '../messaging.gateway';
import { MessagingService } from '../messaging.service';
import { RabbitMQService } from '../rabbitmq.service';
import { Socket, Server } from 'socket.io';

describe('MessagingGateway', () => {
    let gateway: MessagingGateway;
    let messagingService: MessagingService;
    let rabbitMQService: RabbitMQService;
    let mockServer: Partial<Server>;
    let mockClient: Partial<Socket>;

    beforeEach(async () => {
        // Setup mocks
        mockServer = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn()
        };

        mockClient = {
            id: 'test-socket-id',
            on: jest.fn(),
        };

        // Create mock services
        const mockMessagingService = {
            markMessageDelivered: jest.fn().mockResolvedValue(undefined)
        };

        const mockRabbitMQService = {
            startConsumingForUser: jest.fn().mockResolvedValue(undefined),
            stopConsumingForUser: jest.fn().mockResolvedValue(undefined)
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MessagingGateway,
                {
                    provide: MessagingService,
                    useValue: mockMessagingService
                },
                {
                    provide: RabbitMQService,
                    useValue: mockRabbitMQService
                }
            ],
        }).compile();

        gateway = module.get<MessagingGateway>(MessagingGateway);
        messagingService = module.get<MessagingService>(MessagingService);
        rabbitMQService = module.get<RabbitMQService>(RabbitMQService);
        
        // Initialize server
        gateway.afterInit(mockServer as Server);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('afterInit', () => {
        it('should initialize WebSocket server', () => {
            const consoleSpy = jest.spyOn(console, 'log');
            gateway.afterInit(mockServer as Server);
            expect(consoleSpy).toHaveBeenCalledWith('WebSocket server initialized');
        });
    });

    describe('handleConnection', () => {
        it('should log client connection', async () => {
            const consoleSpy = jest.spyOn(console, 'log');
            await gateway.handleConnection(mockClient as Socket);
            expect(consoleSpy).toHaveBeenCalledWith(`Client connected: ${mockClient.id}`);
        });

        it('should register user and start consuming messages', async () => {
            const userId = 'test-user-id';
            const consoleSpy = jest.spyOn(console, 'log');
            
            await gateway.handleConnection(mockClient as Socket);
            
            // Get the 'register_user' callback
            const [[event, callback]] = (mockClient.on as jest.Mock).mock.calls;
            expect(event).toBe('register_user');
            
            // Call the callback with userId
            await callback(userId);
            
            // Verify user registration
            expect(consoleSpy).toHaveBeenCalledWith(`User ${userId} registered with socket ${mockClient.id}`);
            expect(rabbitMQService.startConsumingForUser).toHaveBeenCalledWith(
                userId,
                expect.any(Function)
            );
        });

        it('should handle message delivery correctly', async () => {
            const userId = 'test-user-id';
            const mockMessage = {
                _id: 'test-message-id',
                senderId: 'sender-id',
                content: 'Hello, World!'
            };

            await gateway.handleConnection(mockClient as Socket);
            
            // Get and execute the register_user callback
            const [[, registerCallback]] = (mockClient.on as jest.Mock).mock.calls;
            await registerCallback(userId);
            
            // Get and execute the message callback
            const [[, messageCallback]] = (rabbitMQService.startConsumingForUser as jest.Mock).mock.calls;
            await messageCallback(mockMessage);
            
            // Verify message emission
            expect(mockServer.to).toHaveBeenCalledWith(mockClient.id);
            expect(mockServer.emit).toHaveBeenCalledWith('receive_message', {
                senderId: mockMessage.senderId,
                content: mockMessage.content,
                messageId: mockMessage._id
            });
            
            // Verify message marked as delivered
            expect(messagingService.markMessageDelivered).toHaveBeenCalledWith(mockMessage._id);
        });

        it('should handle message delivery error', async () => {
            const userId = 'test-user-id';
            const mockMessage = {
                _id: 'test-message-id',
                senderId: 'sender-id',
                content: 'Hello, World!'
            };
            const mockError = new Error('Delivery failed');
            
            // Mock the markMessageDelivered to throw an error
            (messagingService.markMessageDelivered as jest.Mock)
                .mockRejectedValueOnce(mockError);
            
            const consoleSpy = jest.spyOn(console, 'error');

            await gateway.handleConnection(mockClient as Socket);
            
            // Get and execute callbacks
            const [[, registerCallback]] = (mockClient.on as jest.Mock).mock.calls;
            await registerCallback(userId);
            
            const [[, messageCallback]] = (rabbitMQService.startConsumingForUser as jest.Mock).mock.calls;
            
            // Verify error is thrown and logged
            await expect(messageCallback(mockMessage)).rejects.toThrow(mockError);
            expect(consoleSpy).toHaveBeenCalledWith('Error delivering message:', mockError);
        });
    });

    describe('handleDisconnect', () => {
        it('should handle client disconnection and cleanup', async () => {
            const userId = 'test-user-id';
            const consoleSpy = jest.spyOn(console, 'log');
            
            // First connect and register user
            await gateway.handleConnection(mockClient as Socket);
            const [[, callback]] = (mockClient.on as jest.Mock).mock.calls;
            await callback(userId);
            
            // Then disconnect
            await gateway.handleDisconnect(mockClient as Socket);
            
            // Verify cleanup
            expect(consoleSpy).toHaveBeenCalledWith(`Client disconnected: ${mockClient.id}`);
            expect(consoleSpy).toHaveBeenCalledWith(`User ${userId} disconnected`);
            expect(rabbitMQService.stopConsumingForUser).toHaveBeenCalledWith(userId);
        });

        it('should handle disconnection of unregistered client', async () => {
            const consoleSpy = jest.spyOn(console, 'log');
            
            await gateway.handleDisconnect(mockClient as Socket);
            
            expect(consoleSpy).toHaveBeenCalledWith(`Client disconnected: ${mockClient.id}`);
            expect(rabbitMQService.stopConsumingForUser).not.toHaveBeenCalled();
        });

        it('should handle stopConsumingForUser error', async () => {
            const userId = 'test-user-id';
            const mockError = new Error('Failed to stop consuming');
            
            (rabbitMQService.stopConsumingForUser as jest.Mock)
                .mockRejectedValueOnce(mockError);
            
            // Connect and register user
            await gateway.handleConnection(mockClient as Socket);
            const [[, callback]] = (mockClient.on as jest.Mock).mock.calls;
            await callback(userId);
            
            // Verify error is propagated
            await expect(gateway.handleDisconnect(mockClient as Socket))
                .rejects.toThrow(mockError);
        });
    });
});