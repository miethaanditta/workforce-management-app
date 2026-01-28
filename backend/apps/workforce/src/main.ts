import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { WorkforceModule } from './workforce.module';
import { SERVICES_PORTS } from '@app/common';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { KAFKA_BROKER, KAFKA_CLIENT_ID } from '@app/kafka';

async function bootstrap() {
  const app = await NestFactory.create(WorkforceModule);

  // connect kafka microservice for consuming events
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: `${KAFKA_CLIENT_ID}-workforce`,
        brokers: [KAFKA_BROKER]
      },
      consumer: {
        groupId: `workforce-group`
      }
    }
  });

  // start microservices (kafka consumer)
  await app.startAllMicroservices();

  // Enable Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );

  await app.listen(SERVICES_PORTS.WORKFORCE);
  console.log(`Workforce is running on port ${SERVICES_PORTS.WORKFORCE}`);
  console.log(`Kafka workforce consumer started`);
}
bootstrap();
