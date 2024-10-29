import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users.interface';
import { RegisterUserDto } from '../../auth/dto/register-user.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
    let usersService: UsersService;
    let userModel: Model<User>;

    const mockUserModel = {
        create: jest.fn(),
        findOne: jest.fn(),
        findById: jest.fn(),
        exec: jest.fn(),  // Add exec to simulate a query
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getModelToken('User'),
                    useValue: mockUserModel,
                },
            ],
        }).compile();

        usersService = module.get<UsersService>(UsersService);
        userModel = module.get<Model<User>>(getModelToken('User'));
    });

    describe('create', () => {
        it('should successfully create a user', async () => {
            const registerUserDto: RegisterUserDto = {
                username: 'test',
                email: 'test@example.com',
                password: 'Password123'
            };
            const mockUser = { _id: 'userId', ...registerUserDto };

            mockUserModel.create.mockResolvedValue(mockUser);
            const result = await usersService.create(registerUserDto);

            expect(result).toEqual(mockUser);
            expect(mockUserModel.create).toHaveBeenCalledWith(registerUserDto);
        });
    });

    describe('findByEmail', () => {
        it('should return a user if found', async () => {
            const email = 'test@example.com';
            const mockUser = { _id: 'userId', email };

            mockUserModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockUser),
            });
            const result = await usersService.findByEmail(email);

            expect(result).toEqual(mockUser);
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ email });
        });

        it('should return null if user is not found', async () => {
            const email = 'nonexistent@example.com';

            mockUserModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
            const result = await usersService.findByEmail(email);

            expect(result).toBeNull();
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ email });
        });
    });

    describe('findById', () => {
        it('should throw BadRequestException for invalid ObjectId', async () => {
            const invalidId = 'invalid_id';

            await expect(usersService.findById(invalidId)).rejects.toThrow(BadRequestException);
            await expect(usersService.findById(invalidId)).rejects.toThrow('Invalid user ID format.');
        });

        it('should return a user if found', async () => {
            const userId = '605c72c30b5c3d1f30c9aab0'; // Example valid ObjectId
            const mockUser = { _id: userId, email: 'test@example.com' };

            mockUserModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockUser),
            });
            const result = await usersService.findById(userId);

            expect(result).toEqual(mockUser);
            expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
        });

        it('should throw NotFoundException if user is not found', async () => {
            const userId = '605c72c30b5c3d1f30c9aab0';

            mockUserModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
            await expect(usersService.findById(userId)).rejects.toThrow(NotFoundException);
            await expect(usersService.findById(userId)).rejects.toThrow(`User with ID ${userId} not found.`);
        });
    });
});
