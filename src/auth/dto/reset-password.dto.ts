import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'a1b2c3d4e5...', description: 'Password reset token from email link' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'newSecurePassword123!', description: 'New password (min 6 characters)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
