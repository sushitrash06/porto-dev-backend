import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RequestEmailChangeDto {
    @ApiProperty({ example: 'new-email@example.com' })
    @IsEmail()
    @IsNotEmpty()
    newEmail: string;

    @ApiProperty({ example: 'currentpassword123' })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}
