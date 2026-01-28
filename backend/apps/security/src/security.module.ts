import { Module } from '@nestjs/common';
import { SecurityServiceController } from './security.controller';
import { SecurityService } from './security.service';
import { KafkaModule } from '@app/kafka';
import { DatabaseModule } from './database';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    KafkaModule.register('security-group'), 
    DatabaseModule, 
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'secret', 
        signOptions: { expiresIn: '1d' },
      })
    })
  ],
  controllers: [SecurityServiceController],
  providers: [SecurityService, JwtStrategy],
})
export class SecurityServiceModule {}
