import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateStaffDto {
    @IsUUID(undefined, { message: 'User Id must be a uuid' })
    @IsNotEmpty({ message: "User is required" })
    userId: string;

    @IsString({ message: 'Name must be a string' })
    @MaxLength(255, { message: 'Name must be under 255 characters long' })
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsUUID(undefined, { message: 'Position Id must be a uuid' })
    @IsNotEmpty({ message: "Position is required" })
    positionId: string;
    
    @IsString({ message: 'Phone No must be a string' })
    @MaxLength(255, { message: 'Phone No must be under 20 characters long' })
    @IsOptional()
    phoneNo: string;
    
    @IsUUID(undefined, { message: 'File Id must be a uuid' })
    @IsOptional()
    fileId: string;
}
