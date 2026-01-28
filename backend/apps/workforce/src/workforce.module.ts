import { Module } from '@nestjs/common';
import { WorkforceController } from './workforce.controller';
import { WorkforceService } from './workforce.service';
import { KafkaModule } from '@app/kafka';
import { DatabaseModule } from './database';

@Module({
  imports: [
    KafkaModule.register('workforce-group'), 
    DatabaseModule
  ],
  controllers: [WorkforceController],
  providers: [WorkforceService],
})
export class WorkforceModule {}
