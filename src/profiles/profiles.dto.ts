import { IsIn, IsOptional, IsString, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { getHoroscope } from '../utils/horoscope.utils';
import { getZodiac } from '../utils/zodiac.utils';
import { ApiProperty } from '@nestjs/swagger';

export class ProfileDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ 
    description: 'The display name of the user', 
    example: 'John Doe', 
    required: false 
  })
  displayName?: string;

  @IsOptional()
  @IsString()
  @IsIn(['male', 'female', 'other'], { message: 'Gender must be "male", "female", or "other".' })
  @ApiProperty({ 
    description: 'The gender of the user', 
    enum: ['male', 'female', 'other'], 
    required: false 
  })
  gender: 'male' | 'female' | 'other';

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ApiProperty({ 
    description: 'The birthday of the user', 
    type: String, 
    format: 'date', 
    required: false 
  })
  birthday?: Date;

  @ApiProperty({ 
    description: 'The horoscope of the user based on their birthday', 
    readOnly: true 
  })
  horoscope?: string;

  @ApiProperty({ 
    description: 'The zodiac sign of the user based on their birthday', 
    readOnly: true 
  })
  zodiac?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ 
    description: 'The height of the user in centimeters', 
    example: 180, 
    required: false 
  })
  height?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ 
    description: 'The weight of the user in kilograms', 
    example: 75, 
    required: false 
  })
  weight?: number;

  setHoroscopeFromBirthday() {
    if (this.birthday) {
      this.horoscope = getHoroscope(this.birthday);
    }
  }

  setZodiacFromBirthday() {
    if (this.birthday) {
      this.zodiac = getZodiac(this.birthday);
    }
  }
}
