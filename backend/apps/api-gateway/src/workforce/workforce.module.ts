import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WorkforceService } from './workforce.service';
import { WorkforceController } from './workforce.controller';

@Module({
  imports: [HttpModule],
  controllers: [WorkforceController],
  providers: [WorkforceService]
})
export class WorkforceModule {}
