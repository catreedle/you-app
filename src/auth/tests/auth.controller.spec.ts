import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';

describe('AuthController', () => {
    let authController: AuthController;
    let authService: AuthService;

    // Mock AuthService
    const mockAuthService = {
        register: jest.fn(),
        login: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    describe('register', () => {
        it('should register a user successfully', async () => {
            const registerDto: RegisterUserDto = {
                email: 'test@example.com',
                username: 'test',
                password: 'password',
            };
            // Mock the register method of AuthService
            mockAuthService.register.mockResolvedValue(registerDto);

            const result = await authController.register(registerDto);
            expect(result).toEqual(registerDto);
            expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
        });
    });

    describe('login', () => {
        it('should log in a user successfully', async () => {
            const loginDto: LoginUserDto = {
                email: 'test@example.com',
                password: 'password',
            };
            // Mock the login method of AuthService
            const mockToken = { access_token: 'token' };
            mockAuthService.login.mockResolvedValue(mockToken);

            const result = await authController.login(loginDto);
            expect(result).toEqual(mockToken);
            expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
        });

        it('should throw an UnauthorizedException for invalid credentials', async () => {
            const loginDto: LoginUserDto = {
                email: 'test@example.com',
                password: 'wrong-password',
            };
            // Mock the login method to throw an error
            mockAuthService.login.mockRejectedValue(new Error('Unauthorized'));

            await expect(authController.login(loginDto)).rejects.toThrow('Unauthorized');
            expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
        });
    });
});
