import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt'; // For generating JWT tokens
import * as bcrypt from 'bcrypt'; // For password hashing

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    // Register a new user
    async register(registerUserDto: RegisterUserDto) {
        // Hash the password
        const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
        
        // Create the user
        return this.usersService.create({
            ...registerUserDto,
            password: hashedPassword,
        });
    }

    // Login a user
    async login(loginUserDto: LoginUserDto) {
        const user = await this.usersService.findByEmail(loginUserDto.email);
        // Check if user exists and password is correct
        if (user && (await bcrypt.compare(loginUserDto.password, user.password))) {
            // Generate JWT token
            const payload = { email: user.email, sub: user._id };
            return {
                access_token: this.jwtService.sign(payload),
            };
        }
        throw new UnauthorizedException('Invalid credentials'); // Handle invalid login
    }
}
