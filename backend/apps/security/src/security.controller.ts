import { Body, Headers, Controller, Put, Post, UseGuards, Param, ParseUUIDPipe, Logger } from '@nestjs/common';
import { SecurityService } from './security.service';
import { LoginDto, RegisterDto, UpdatePasswordDto } from '@app/common';
import { AuthGuard } from '@nestjs/passport';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KAFKA_TOPICS } from '@app/kafka';

@Controller()
export class SecurityServiceController {
  private readonly logger = new Logger(SecurityServiceController.name);
  
  constructor(private readonly SecurityService: SecurityService) { }

  @Post("register-admin")
  registerAdmin(
    @Body() dto: RegisterDto
  ) {
    return this.SecurityService.registerAdmin(dto.email, dto.password, dto.name);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post("register")
  register(
    @Body() dto: RegisterDto,
    @Headers('x-user-role') userRole: string
  ) {
    return this.SecurityService.register(userRole, dto.email, dto.password, dto.name);
  }

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.SecurityService.login(dto.email, dto.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put("update-password/:id")
  updatePassword(
    @Body() dto: UpdatePasswordDto,
    @Param('id', ParseUUIDPipe) userId: string
  ) {
    return this.SecurityService.updatePassword(userId, dto.password!);
  }

  @EventPattern(KAFKA_TOPICS.USER_DELETED)
  async handleDeleteUser(@Payload() data: {
    message: {
      userId: string;
      timestamp: string;
    },
    messageId: string
  }) {
    this.logger.log('Received deleted user from Workforce Service:', JSON.stringify(data));
    await this.SecurityService.deleteUser(data);
  }
}
