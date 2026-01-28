import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NotificationsModule } from './notifications.module';
import { SERVICES_PORTS } from '@app/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { KAFKA_BROKER, KAFKA_CLIENT_ID } from '@app/kafka';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsModule);

  // connect kafka microservice for consuming events
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: `${KAFKA_CLIENT_ID}-notifications`,
        brokers: [KAFKA_BROKER]
      },
      consumer: {
        groupId: `notifications-group`
      }
    }
  });

  // start microservices (kafka consumer)
  await app.startAllMicroservices();

  await app.listen(SERVICES_PORTS.NOTIFICATIONS);
  console.log(`Notifications is running on port ${SERVICES_PORTS.NOTIFICATIONS}`);
  console.log(`Kafka notifications consumer started`);
}
bootstrap();
