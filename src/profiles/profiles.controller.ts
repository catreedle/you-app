import { Controller, Post, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProfileService } from './profiles.service';
import { ProfileDto } from './profiles.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('profiles') // Tag for grouping related endpoints
@ApiBearerAuth() // Indicates that a bearer token is required
@Controller()
export class ProfileController {

    constructor(private readonly profileService: ProfileService) { }

    @Post('createProfile')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a user profile' })
    @ApiResponse({ status: 201, description: 'Profile created successfully.' })
    @ApiResponse({ status: 400, description: 'Bad request.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async createProfile(@Body() createProfileDto: ProfileDto, @Request() req) {
        const userId = req.user._id;
        return this.profileService.createProfile(userId, createProfileDto);
    }

    @Get('getProfile')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Retrieve user profile' })
    @ApiResponse({ status: 200, description: 'Profile retrieved successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async getProfile(@Request() req) {
        const userId = req.user._id;
        const profile = await this.profileService.getProfile(userId);
        return profile;
    }

    @Put('updateProfile')
    @UseGuards(JwtAuthGuard) // Ensure user is authenticated
    @ApiOperation({ summary: 'Update user profile' })
    @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 400, description: 'Bad request.' })
    async updateProfile(@Body() updateProfileDto: ProfileDto, @Request() req) {
        const userId = req.user._id;
        return this.profileService.updateProfile(userId, updateProfileDto);
    }
}
