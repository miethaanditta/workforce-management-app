import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationGateway } from './notifications.gateway';
import { KafkaModule } from '@app/kafka';
import { DatabaseModule } from './database';

@Module({
  imports: [
    KafkaModule.register('security-group'), 
    DatabaseModule
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationGateway],
})
export class NotificationsModule {}
