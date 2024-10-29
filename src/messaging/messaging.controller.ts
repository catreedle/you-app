import { BadRequestException, Body, Controller, Get, NotFoundException, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
@ApiTags('Messaging')
@ApiBearerAuth() // Apply bearer token authentication for endpoints
export class MessagingController {
    constructor(
        private readonly messagingService: MessagingService
    ) { }

    @Post('sendMessage')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Send a message to a recipient' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                recipientId: { type: 'string', example: 'recipient123' },
                content: { type: 'string', example: 'Hello, how are you?' },
            },
            required: ['recipientId', 'content'],
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Message sent successfully',
    })
    @ApiResponse({ status: 400, description: 'Invalid data or bad request' })
    async postMessage(@Body() body, @Request() req) {
        const { recipientId, content } = body;
        const senderId = req.user._id;
        
        if (!recipientId || !content) {
            throw new BadRequestException('Recipient ID and content are required.');
        }
        return this.messagingService.sendMessage(recipientId, content, senderId);
    }

    @Get('viewMessages')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'View all messages for the authenticated user' })
    @ApiResponse({
        status: 200,
        description: 'Messages retrieved successfully',
    })
    @ApiResponse({ status: 404, description: 'Messages not found' })
    async viewMessages(@Request() req) {
        const userId = req.user._id;
        const messages = await this.messagingService.getMessagesForUser(userId);

        if (!messages || messages.length === 0) {
            throw new NotFoundException('No messages found for this user.');
        }

        return messages;
    }
}
