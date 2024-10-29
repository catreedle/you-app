import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './message.schema';
import { MessagingGateway } from './messaging.gateway';
import { RabbitMQService } from './rabbitmq.service';

@Module({
    imports: [
        UsersModule,
        MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }])
    ],
    controllers: [MessagingController],
    providers: [MessagingService, MessagingGateway, RabbitMQService]
})
export class MessagingModule { }
