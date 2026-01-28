import { PartialType } from '@nestjs/mapped-types';
import { RegisterDto } from './register.dto';

export class UpdatePasswordDto extends PartialType(RegisterDto) {}
