import { Test, TestingModule } from '@nestjs/testing';
import { MessagingController } from '../messaging.controller';
import { MessagingService } from '../messaging.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

// Mock the JwtAuthGuard to simulate authentication
class MockJwtAuthGuard {
    canActivate(context: ExecutionContext) {
        // Simulate that the guard always allows the request
        const request = context.switchToHttp().getRequest();
        request.user = { _id: 'sender123' }; // Mock user object
        return true;
    }
}

describe('MessagingController', () => {
    let controller: MessagingController;
    let messagingService: MessagingService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MessagingController],
            providers: [
                {
                    provide: MessagingService,
                    useValue: {
                        sendMessage: jest.fn(),
                        getMessagesForUser: jest.fn(),
                    },
                },
            ],
        })
        .overrideGuard(JwtAuthGuard)
        .useClass(MockJwtAuthGuard)
        .compile();

        controller = module.get<MessagingController>(MessagingController);
        messagingService = module.get<MessagingService>(MessagingService);
    });

    describe('postMessage', () => {
        it('should send a message successfully', async () => {
            const sendMessageResponse = { success: true };
            const body = { recipientId: 'recipient123', content: 'Hello, how are you?' };

            messagingService.sendMessage = jest.fn().mockResolvedValue(sendMessageResponse);

            const result = await controller.postMessage(body, { user: { _id: 'sender123' } });

            expect(result).toEqual(sendMessageResponse);
            expect(messagingService.sendMessage).toHaveBeenCalledWith('recipient123', 'Hello, how are you?', 'sender123');
        });

        it('should throw an error for invalid data', async () => {
            const body = { recipientId: '', content: 'Hello' }; // Invalid recipientId

            await expect(controller.postMessage(body, { user: { _id: 'sender123' } }))
                .rejects
                .toThrow();

            expect(messagingService.sendMessage).not.toHaveBeenCalled();
        });
    });

    describe('viewMessages', () => {
        it('should retrieve messages successfully', async () => {
            const mockMessages = [
                { senderId: 'sender123', content: 'Hello!', recipientId: 'recipient123' },
                { senderId: 'sender456', content: 'Hi there!', recipientId: 'recipient789' },
            ];
            messagingService.getMessagesForUser = jest.fn().mockResolvedValue(mockMessages);

            const result = await controller.viewMessages({ user: { _id: 'sender123' } });

            expect(result).toEqual(mockMessages);
            expect(messagingService.getMessagesForUser).toHaveBeenCalledWith('sender123');
        });

        it('should throw an error if no messages found', async () => {
            messagingService.getMessagesForUser = jest.fn().mockResolvedValue([]);

            await expect(controller.viewMessages({ user: { _id: 'sender123' } }))
                .rejects
                .toThrow();

            expect(messagingService.getMessagesForUser).toHaveBeenCalledWith('sender123');
        });
    });
});
