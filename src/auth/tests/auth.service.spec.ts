import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { User } from '../../users/users.schema';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
    ...jest.requireActual('bcrypt'),
    hash: jest.fn().mockResolvedValue('$2b$10$fixedHashValueForTesting12345'),
    compare: jest.fn().mockImplementation((password: string, hashed: string) => {
        return Promise.resolve(password === 'Password123!');
    }),
}));

interface MockUser extends User {
    _id?: string;
    username: string;
    email: string;
    password: string;
}

describe('AuthService', () => {
    let authService: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;

    const fixedHashedValue = '$2b$10$fixedHashValueForTesting12345';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: {
                        create: jest.fn(),
                        findByEmail: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn(),
                    },
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
    });

    describe('register', () => {
        it('should register a new user', async () => {
            const registerUserDto: RegisterUserDto = {
                username: 'john_doe',
                email: 'john.doe@example.com',
                password: 'Password123!',
            };

            const createdUser: MockUser = {
                _id: 'some_id',
                username: registerUserDto.username,
                email: registerUserDto.email,
                password: fixedHashedValue,
            };

            (usersService.create as jest.Mock).mockResolvedValue(createdUser);

            const result = await authService.register(registerUserDto);
            expect(result).toEqual(createdUser);
            expect(usersService.create).toHaveBeenCalledWith({
                ...registerUserDto,
                password: fixedHashedValue,
            });
        });
    });

    describe('login', () => {
        it('should login a user with valid credentials', async () => {
            const loginUserDto: LoginUserDto = {
                email: 'john.doe@example.com',
                password: 'Password123!',
            };

            const user: MockUser = {
                _id: 'some_id',
                username: 'john_doe',
                email: loginUserDto.email,
                password: fixedHashedValue,
            };

            (usersService.findByEmail as jest.Mock).mockResolvedValue(user);
            (jwtService.sign as jest.Mock).mockReturnValue('access_token');

            const result = await authService.login(loginUserDto);
            expect(result).toEqual({ access_token: 'access_token' });
            expect(usersService.findByEmail).toHaveBeenCalledWith(loginUserDto.email);
            expect(jwtService.sign).toHaveBeenCalledWith({ email: user.email, sub: user._id });
        });

        it('should throw UnauthorizedException for invalid credentials', async () => {
            const loginUserDto: LoginUserDto = {
                email: 'john.doe@example.com',
                password: 'WrongPassword123!',
            };

            const user: MockUser = {
                _id: 'some_id',
                username: 'john_doe',
                email: loginUserDto.email,
                password: fixedHashedValue,
            };

            (usersService.findByEmail as jest.Mock).mockResolvedValue(user);

            await expect(authService.login(loginUserDto)).rejects.toThrow(UnauthorizedException);
            expect(usersService.findByEmail).toHaveBeenCalledWith(loginUserDto.email);
        });
    });
});
