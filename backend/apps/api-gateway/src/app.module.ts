import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { SecurityModule } from './security/security.module';
import { WorkforceModule } from './workforce/workforce.module';
import { JwtStrategy } from 'apps/security/src/jwt.strategy';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    PassportModule, 
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'secret', 
        signOptions: { expiresIn: '1d' },
      })
    }),
    SecurityModule,
    WorkforceModule,
    NotificationsModule
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
