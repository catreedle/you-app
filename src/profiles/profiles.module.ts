import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Profile, ProfileSchema } from './profiles.schema';
import { ProfileService } from './profiles.service';
import { ProfileController } from './profiles.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema }]),
    AuthModule
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
