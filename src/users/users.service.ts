import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { User } from './users.interface';  // Import the interface
import { RegisterUserDto } from '../auth/dto/register-user.dto';

@Injectable()
export class UsersService {
    constructor(@InjectModel('User') private userModel: Model<User>) { }

    async create(registerUserDto: RegisterUserDto): Promise<User> {
        return this.userModel.create(registerUserDto);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findById(_id: string): Promise<User | null> {
        // Validate the ObjectId format
        if (!isValidObjectId(_id)) {
            throw new BadRequestException('Invalid user ID format.');
        }

        const user = await this.userModel.findById(_id).exec();

        // Throw NotFoundException if user does not exist
        if (!user) {
            throw new NotFoundException(`User with ID ${_id} not found.`);
        }

        return user;
    }
}
