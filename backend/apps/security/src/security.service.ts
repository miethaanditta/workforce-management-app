import { KAFKA_SERVICE, KAFKA_TOPICS } from '@app/kafka';
import { ConflictException, ForbiddenException, Inject, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { DatabaseService, kafkaPublished, kafkaReceived, users } from './database';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { userRoleEnum } from '@app/common';

@Injectable()
export class SecurityService implements OnModuleInit {
  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
    private readonly dbService: DatabaseService,
    private readonly jwtService: JwtService
  ) { }

  async onModuleInit() {
    // connect to kafka when module initialize
    await this.kafkaClient.connect();
  }

  async registerAdmin(email: string, password: string, name: string) {
    return this.register("ADMIN", email, password, name, true);
  }

  async register(userRole: string, email: string, password: string, name: string, isRegisterAdmin?: boolean) {
    if (userRole !== "ADMIN") {
      throw new ForbiddenException('You are not authorized to create new account');
    }

    const existingUser = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    var role = isRegisterAdmin ? userRoleEnum.enumValues[1] : userRoleEnum.enumValues[0];

    // Create user
    const [user] = await this.dbService.db
      .insert(users)
      .values({ email, password: hashedPassword, name, role: role })
      .returning();

    const message = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      timestamp: new Date().toISOString()
    };

    const [publish] = await this.dbService.db
      .insert(kafkaPublished)
      .values({
        topic: KAFKA_TOPICS.USER_REGISTERED,
        message: JSON.stringify(message),
      })
      .returning();

    this.kafkaClient.emit(KAFKA_TOPICS.USER_REGISTERED, {
      message: message,
      messageId: publish.messageId
    });

    return { message: 'User registered successfully', userId: user.id };
  }

  async login(email: string, password: string) {
    const [user] = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      access_tokens: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  async updatePassword(userId: string, password: string) {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [updated] = await this.dbService.db
      .update(users)
      .set({
        password: hashedPassword
      })
      .where(eq(users.id, userId))
      .returning();

    return updated.id;
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
}
