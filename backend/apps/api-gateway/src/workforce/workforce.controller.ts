import { Body, Controller, Delete, Get, Headers, Param, ParseUUIDPipe, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WorkforceService } from './workforce.service';
import { CreateStaffDto, UpdateStaffDto } from '@app/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('workforce')
export class WorkforceController {
  constructor(private readonly workforceService: WorkforceService) { }

  @UseGuards(AuthGuard('jwt'))
  @Post("staff")
  createStaff(
    @Body() createStaffDto: CreateStaffDto,
    @Headers("authorization") token: string,
    @Headers('x-user-role') userRole: string
  ) {
    return this.workforceService.createStaff(token, userRole, createStaffDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get("staff")
  findAllStaff(
    @Headers("authorization") token: string,
    @Query('keyword') keyword?: string
  ) {
    return this.workforceService.findAllStaff(token, keyword);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get("staff/:id")
  findOneStaff(
    @Headers("authorization") token: string,
    @Param('id', ParseUUIDPipe) userId: string
  ) {
    return this.workforceService.findOneStaff(token, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put("staff/:id")
  updateStaff(
    @Body() updateStaffDto: UpdateStaffDto,
    @Headers("authorization") token: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.workforceService.updateStaff(token, userId, userRole, id, updateStaffDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete("staff/:id")
  deleteStaff(
    @Headers("authorization") token: string,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.workforceService.deleteStaff(token, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get("today-attendance/:id")
  findTodayAttendance(
    @Headers("authorization") token: string,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.workforceService.findTodayAttendance(token, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get("attendance/:id")
  findMyAttendances(
    @Headers("authorization") token: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: { startDate?: string, endDate?: string }
  ) {
    return this.workforceService.findMyAttendances(token, id, query.startDate, query.endDate);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get("attendance")
  findAllAttendances(
    @Headers("authorization") token: string
  ) {
    return this.workforceService.findAllAttendances(token);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(":id/clock-in")
  clockIn(
    @Headers("authorization") token: string,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.workforceService.clockIn(token, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(":id/clock-out")
  clockOut(
    @Headers("authorization") token: string,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.workforceService.clockOut(token, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get("positions")
  findAllPositions(
    @Headers("authorization") token: string,
    @Query('keyword') keyword?: string
  ) {
    return this.workforceService.findAllPositions(token, keyword);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post("files")
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Headers("authorization") token: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.workforceService.saveFile(token, file);
  }
}
