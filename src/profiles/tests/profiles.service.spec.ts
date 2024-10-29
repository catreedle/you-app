import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProfileService } from '../profiles.service';
import { Profile } from '../profiles.schema';
import { ProfileDto } from '../profiles.dto';
import { Model } from 'mongoose';

describe('ProfileService', () => {
    let service: ProfileService;
    let model: Model<Profile>;

    const mockProfile = {
        user: 'user123',
        displayName: 'John Doe',
        gender: 'male',
        birthday: new Date('1990-01-01'),
        horoscope: 'Capricorn',
        zodiac: 'Dragon',
        height: 180,
        weight: 75,
    };

    const mockProfileDto = {
        displayName: 'John Doe',
        gender: 'male',
        birthday: new Date('1990-01-01'),
        height: 180,
        weight: 75,
        setHoroscopeFromBirthday: jest.fn(),
        setZodiacFromBirthday: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks(); // Clear all mocks before each test

        const MockModel = jest.fn().mockImplementation((dto) => ({
            ...dto,
            save: jest.fn().mockResolvedValue({ ...dto })
        })) as any;

        Object.assign(MockModel, {
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
        });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProfileService,
                {
                    provide: getModelToken(Profile.name),
                    useValue: MockModel
                },
            ],
        }).compile();

        service = module.get<ProfileService>(ProfileService);
        model = module.get<Model<Profile>>(getModelToken(Profile.name));
    });

    describe('createProfile', () => {
        it('should create a new profile if none exists', async () => {
            // Mock findOne().exec() to return null
            jest.spyOn(model, 'findOne').mockReturnValue({
                exec: jest.fn().mockResolvedValue(null)
            } as any);

            const expectedProfile = {
                user: 'user123',
                ...mockProfileDto
            };

            const result = await service.createProfile('user123', mockProfileDto as ProfileDto);

            expect(result).toEqual(expectedProfile);
            expect(mockProfileDto.setHoroscopeFromBirthday).toHaveBeenCalled();
            expect(model).toHaveBeenCalledWith({ user: 'user123', ...mockProfileDto });
        });

        it('should throw ConflictException if profile already exists', async () => {
            const existingProfile = { ...mockProfile };
            
            // Mock findOne().exec() to return an existing profile
            jest.spyOn(model, 'findOne').mockReturnValue({
                exec: jest.fn().mockResolvedValue(existingProfile)
            } as any);

            // Create a fresh DTO for this test
            const testDto = {
                ...mockProfileDto,
                setHoroscopeFromBirthday: jest.fn(),
                setZodiacFromBirthday: jest.fn(),
            };

            await expect(service.createProfile('user123', testDto as ProfileDto))
                .rejects.toThrow(ConflictException);
                
            expect(testDto.setHoroscopeFromBirthday).not.toHaveBeenCalled();
            expect(model).not.toHaveBeenCalled();
        });
    });

    describe('getProfile', () => {
        it('should retrieve the profile for a user', async () => {
            jest.spyOn(model, 'findOne').mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockProfile)
            } as any);

            const result = await service.getProfile('user123');
            expect(result).toEqual(mockProfile);
            expect(model.findOne).toHaveBeenCalledWith({ user: 'user123' });
        });
    });

    describe('updateProfile', () => {
        it('should update the profile for a user', async () => {
            jest.spyOn(model, 'findOneAndUpdate').mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockProfile)
            } as any);

            const result = await service.updateProfile('user123', mockProfileDto as ProfileDto);

            expect(result).toEqual(mockProfile);
            expect(mockProfileDto.setHoroscopeFromBirthday).toHaveBeenCalled();
            expect(mockProfileDto.setZodiacFromBirthday).toHaveBeenCalled();
            expect(model.findOneAndUpdate).toHaveBeenCalledWith(
                { user: 'user123' },
                mockProfileDto,
                { new: true }
            );
        });
    });
});