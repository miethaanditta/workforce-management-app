import { Body, Headers, Controller, Get, Post, Put, Param, Query, ParseUUIDPipe, UseInterceptors, UploadedFile, BadRequestException, Logger, Delete } from '@nestjs/common';
import { WorkforceService } from './workforce.service';
import { CreateStaffDto, UpdateStaffDto } from '@app/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KAFKA_TOPICS } from '@app/kafka';

@Controller()
export class WorkforceController {
  private readonly logger = new Logger(WorkforceController.name);

  constructor(private readonly workforceService: WorkforceService) { }

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
    await this.workforceService.createLocalUserRef(data);
  }

  @Post("staff")
  createStaff(
    @Body() createStaffDto: CreateStaffDto,
    @Headers('x-user-role') userRole: string
  ) {
    return this.workforceService.createStaff(userRole, createStaffDto);
  }

  @Get("staff")
  findAllStaff(@Query('keyword') keyword?: string) {
    return this.workforceService.findAllStaff(keyword);
  }

  @Get("staff/:id")
  findOneStaff(@Param('id', ParseUUIDPipe) userId: string) {
    return this.workforceService.findOneStaff(userId);
  }

  @Put("staff/:id")
  updateStaff(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string
  ) {
    return this.workforceService.updateStaff(id, updateStaffDto, userId, userRole);
  }

  @Delete("staff/:id")
  deleteStaff(@Param('id', ParseUUIDPipe) id: string) {
    return this.workforceService.deleteStaff(id);
  }

  @Get("today-attendance/:id")
  findTodayAttendance(@Param('id', ParseUUIDPipe) staffId: string) {
    return this.workforceService.findTodayAttendance(staffId);
  }

  @Get("attendance/:id")
  findMyAttendances(
    @Param('id', ParseUUIDPipe) staffId: string,
    @Query() query: { startDate?: string, endDate?: string }
  ) {
    return this.workforceService.findMyAttendances(staffId, query.startDate, query.endDate);
  }

  @Get("attendance")
  findAllAttendances() {
    return this.workforceService.findAllAttendances();
  }

  @Post(":id/clock-in")
  clockIn(@Param('id', ParseUUIDPipe) staffId: string) {
    return this.workforceService.clockIn(staffId);
  }

  @Put(":id/clock-out")
  clockOut(@Param('id', ParseUUIDPipe) staffId: string) {
    return this.workforceService.clockOut(staffId);
  }

  @Get("positions")
  findAllPositions(@Query('keyword') keyword?: string) {
    return this.workforceService.findAllPositions(keyword);
  }

  @Post("files")
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.workforceService.saveFile(file);
  }
}
