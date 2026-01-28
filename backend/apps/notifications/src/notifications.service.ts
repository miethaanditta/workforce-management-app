import { KAFKA_SERVICE, KAFKA_TOPICS } from '@app/kafka';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { DatabaseService, inboxes, kafkaReceived, users } from './database';
import { eq, desc } from 'drizzle-orm';
import { NotificationGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
    private readonly dbService: DatabaseService,
    private readonly gateway: NotificationGateway
  ) { }

  async onModuleInit() {
    // connect to kafka when module initialize
    await this.kafkaClient.connect();
  }

  async createLocalUserRef(data: {
    message: {
      id: string;
      name: string;
      email: string;
      role: "ADMIN" | "USER";
      timestamp: string;
    },
    messageId: string
  }) {
    const existingMessage = await this.dbService.db
      .select()
      .from(kafkaReceived)
      .where(eq(kafkaReceived.messageId, data.messageId))
      .limit(1);

    if (existingMessage.length > 0) {
      throw new ConflictException('Message has been consumed');
    }

    // Create local user ref
    await this.dbService.db
      .insert(users)
      .values({
        id: data.message.id,
        name: data.message.name,
        email: data.message.email,
        role: data.message.role
      })
      .returning();

    await this.dbService.db
      .insert(kafkaReceived)
      .values({
        topic: KAFKA_TOPICS.USER_REGISTERED,
        message: JSON.stringify(data.message),
        messageId: data.messageId
      })
      .returning();
  }

  async deleteUser(data: {
    message: {
      userId: string;
      timestamp: string;
    };
    messageId: string;
  }) {
    const existingMessage = await this.dbService.db
      .select()
      .from(kafkaReceived)
      .where(eq(kafkaReceived.messageId, data.messageId))
      .limit(1);

    if (existingMessage.length > 0) {
      throw new ConflictException('Message has been consumed');
    }

    const [deletedUser] = await this.dbService.db
      .delete(users)
      .where(eq(users.id, data.message.userId))
      .returning();

    await this.dbService.db
      .insert(kafkaReceived)
      .values({
        topic: KAFKA_TOPICS.USER_DELETED,
        message: JSON.stringify(data.message),
        messageId: data.messageId
      })
      .returning();
  }

  async sendNotification(data: {
    message: {
      staffUserId: string;
      staffName: string;
      changes: string[];
      timestamp: string;
    },
    messageId: string
  }) {
    const existingMessage = await this.dbService.db
      .select()
      .from(kafkaReceived)
      .where(eq(kafkaReceived.messageId, data.messageId))
      .limit(1);

    if (existingMessage.length > 0) {
      throw new ConflictException('Message has been consumed');
    }

    const admins = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.role, 'ADMIN'));

    const adminIds = admins.map(row => row.id);

    const title = `New Update from Staff`;
    const content = `${data.message.staffName} has updated his/her ${data.message.changes.join(', ')}.`;

    adminIds.forEach(async id => {
      const [inbox] = await this.dbService.db
        .insert(inboxes)
        .values({
          recipientId: id,
          senderId: data.message.staffUserId,
          title: title,
          content: content
        })
        .returning();

      this.gateway.sendToUser(id, inbox);
    });

    await this.dbService.db
      .insert(kafkaReceived)
      .values({
        topic: KAFKA_TOPICS.USER_REGISTERED,
        message: JSON.stringify(data.message),
        messageId: data.messageId
      })
      .returning();
  }

  async getInbox(userId: string) {
    return this.dbService.db
      .select()
      .from(inboxes)
      .where(eq(inboxes.recipientId, userId))
      .orderBy(desc(inboxes.createdAt));
  }
}
