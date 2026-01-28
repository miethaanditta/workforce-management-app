import { Controller, Get, Logger, Param, ParseUUIDPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { KAFKA_TOPICS } from '@app/kafka';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) { }

  @EventPattern(KAFKA_TOPICS.USER_REGISTERED)
  async handleUserCreated(@Payload() data: {
    message: {
      id: string;
      name: string;
      email: string;
      role: "ADMIN" | "USER";
      timestamp: string;
    },
    messageId: string
  }) {
    this.logger.log('Received new user from Security Service:', JSON.stringify(data));
    await this.notificationsService.createLocalUserRef(data);
  }

  @EventPattern(KAFKA_TOPICS.SEND_PUSH)
  async handleSendPushNotif(@Payload() data: {
    message: {
      staffUserId: string;
      staffName: string;
      changes: string[];
      timestamp: string;
    },
    messageId: string
  }) {
    this.logger.log('Received new notification from Workforce Service:', JSON.stringify(data));
    await this.notificationsService.sendNotification(data);
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
    await this.notificationsService.deleteUser(data);
  }

  @Get("inbox/:id")
  getInbox(@Param('id', ParseUUIDPipe) userId: string) {
    return this.notificationsService.getInbox(userId);
  }
}
