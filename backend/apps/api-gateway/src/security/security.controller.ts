import { Body, Controller, Get, Headers, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import { SecurityService } from './security.service';
import { LoginDto, RegisterDto, UpdatePasswordDto } from '@app/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Post("register-admin")
  registerAdmin(
    @Body() registerDto: RegisterDto
  ) {
    return this.securityService.registerAdmin(registerDto);
  }
  
  @UseGuards(AuthGuard('jwt'))
  @Post("register")
  register(
    @Body() registerDto: RegisterDto,
    @Headers("authorization") token: string, 
    @Headers('x-user-role') userRole: string
  ) {
    return this.securityService.register(token, userRole, registerDto);
  }

  @Post("login")
  login(@Body() loginDto: LoginDto) {
    return this.securityService.login(loginDto);
  }
  
  @UseGuards(AuthGuard('jwt'))
  @Put("update-password/:id")
  updatePassword(
    @Headers("authorization") authorization: string,
    @Body() updatePasswordDto: UpdatePasswordDto, 
    @Param('id', ParseUUIDPipe) userId: string
  ) {
    return this.securityService.updatePassword(authorization, userId, updatePasswordDto);
  }
}
