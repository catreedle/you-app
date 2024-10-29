import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile } from './profiles.schema';
import { ProfileDto } from './profiles.dto';

@Injectable()
export class ProfileService {
    constructor(@InjectModel(Profile.name) private readonly profileModel: Model<Profile>) { }

    async createProfile(userId: string, profileDto: ProfileDto) {

        const existingProfile = await this.profileModel.findOne({ user: userId }).exec();

        if (existingProfile) {
            throw new ConflictException('User already has a profile');
        }
        profileDto.setHoroscopeFromBirthday()
        profileDto.setZodiacFromBirthday()
        const profile = new this.profileModel({ user: userId, ...profileDto });
        return await profile.save();
    }

    async getProfile(userId: string) {
        // Find the profile for the user
        return this.profileModel.findOne({ user: userId }).exec();
    }

    async updateProfile(userId: string, profileDto: ProfileDto) {
        // Update the profile for the user
        profileDto.setHoroscopeFromBirthday()
        profileDto.setZodiacFromBirthday()
        return this.profileModel.findOneAndUpdate({ user: userId }, profileDto, { new: true }).exec();
    }
}
