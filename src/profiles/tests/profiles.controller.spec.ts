import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from '../profiles.controller';
import { ProfileService } from '../profiles.service';
import { ProfileDto } from '../profiles.dto';

describe('ProfileController', () => {
    let controller: ProfileController;
    let service: ProfileService;

    // Mock profile data
    const mockProfileDto: ProfileDto = {
        displayName: 'John Doe',
        gender: 'male',
        birthday: new Date('1990-01-01'),
        height: 180,
        weight: 75,
        setHoroscopeFromBirthday: jest.fn(),
        setZodiacFromBirthday: jest.fn(),
    };

    const mockUser = {
        _id: 'mock-user-id',
    };

    const mockRequest = {
        user: mockUser,
    };

    const mockProfile = {
        ...mockProfileDto,
        userId: mockUser._id,
    };

    // Mock service methods
    const mockProfileService = {
        createProfile: jest.fn(),
        getProfile: jest.fn(),
        updateProfile: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProfileController],
            providers: [
                {
                    provide: ProfileService,
                    useValue: mockProfileService,
                },
            ],
        }).compile();

        controller = module.get<ProfileController>(ProfileController);
        service = module.get<ProfileService>(ProfileService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createProfile', () => {
        it('should create a profile successfully', async () => {
            mockProfileService.createProfile.mockResolvedValue(mockProfile);

            const result = await controller.createProfile(mockProfileDto, mockRequest);

            expect(service.createProfile).toHaveBeenCalledWith(
                mockUser._id,
                mockProfileDto,
            );
            expect(result).toEqual(mockProfile);
        });

        it('should handle service errors during profile creation', async () => {
            const error = new Error('Failed to create profile');
            mockProfileService.createProfile.mockRejectedValue(error);

            await expect(
                controller.createProfile(mockProfileDto, mockRequest),
            ).rejects.toThrow(error);
        });
    });

    describe('getProfile', () => {
        it('should retrieve a profile successfully', async () => {
            mockProfileService.getProfile.mockResolvedValue(mockProfile);

            const result = await controller.getProfile(mockRequest);

            expect(service.getProfile).toHaveBeenCalledWith(mockUser._id);
            expect(result).toEqual(mockProfile);
        });

        it('should handle service errors during profile retrieval', async () => {
            const error = new Error('Profile not found');
            mockProfileService.getProfile.mockRejectedValue(error);

            await expect(controller.getProfile(mockRequest)).rejects.toThrow(error);
        });
    });

    describe('updateProfile', () => {
        it('should update a profile successfully', async () => {
            const updatedProfile = { ...mockProfile, firstName: 'Jane' };
            mockProfileService.updateProfile.mockResolvedValue(updatedProfile);

            const result = await controller.updateProfile(mockProfileDto, mockRequest);

            expect(service.updateProfile).toHaveBeenCalledWith(
                mockUser._id,
                mockProfileDto,
            );
            expect(result).toEqual(updatedProfile);
        });

        it('should handle service errors during profile update', async () => {
            const error = new Error('Failed to update profile');
            mockProfileService.updateProfile.mockRejectedValue(error);

            await expect(
                controller.updateProfile(mockProfileDto, mockRequest),
            ).rejects.toThrow(error);
        });
    });

    // Test JWT Guard
    describe('Guards', () => {
        it('should have JwtAuthGuard applied to all endpoints', () => {
            const createProfileMetadata = Reflect.getMetadata(
                '__guards__',
                controller.createProfile,
            );
            const getProfileMetadata = Reflect.getMetadata(
                '__guards__',
                controller.getProfile,
            );
            const updateProfileMetadata = Reflect.getMetadata(
                '__guards__',
                controller.updateProfile,
            );

            expect(createProfileMetadata).toBeDefined();
            expect(getProfileMetadata).toBeDefined();
            expect(updateProfileMetadata).toBeDefined();
        });
    });
});