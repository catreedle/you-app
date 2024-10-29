import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
    @ApiProperty({
        description: 'The username of the user',
        example: 'john_doe',
    })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        description: 'The email address of the user',
        example: 'john.doe@example.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'The password of the user',
        example: 'Password123!',
        minLength: 8,
    })
    @IsString()
    @MinLength(8, { message: 'Password is too short. It should be at least 8 characters long.' })
    @Matches(/(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter.' })
    @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter.' })
    @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number.' })
    @Matches(/(?=.*[\W_])/, { message: 'Password must contain at least one special character.' })
    password: string;
}
