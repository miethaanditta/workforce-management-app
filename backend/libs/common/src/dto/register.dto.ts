import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Please provide a valid email' })
    @IsNotEmpty({ message: "Email is required" })
    email: string;

    @IsString({ message: 'Password must be a string' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @IsNotEmpty({ message: 'Password is required' })
    password: string;

    @IsString({ message: 'Name must be a string' })
    @MaxLength(255, { message: 'Name must be under 255 characters long' })
    @IsNotEmpty({ message: 'Name is required' })
    name: string;
}
