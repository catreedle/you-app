import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileModule } from './profiles/profiles.module';
import { MessagingModule } from './messaging/messaging.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRoot('mongodb://localhost:27017/you-app'),
        AuthModule,
        ProfileModule,
        MessagingModule
    ],
})
export class AppModule { }
