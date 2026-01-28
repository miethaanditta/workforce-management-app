import { KAFKA_SERVICE, KAFKA_TOPICS } from '@app/kafka';
import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { attendances, DatabaseService, files, kafkaPublished, kafkaReceived, positions, staffs, users } from './database';
import { ClientKafka } from '@nestjs/microservices';
import { CreateStaffDto, UpdateStaffDto } from '@app/common';
import { ilike, or, eq, and, gte, lt, desc } from 'drizzle-orm';

@Injectable()
export class WorkforceService implements OnModuleInit {
  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
    private readonly dbService: DatabaseService,
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

  async createStaff(userRole: string, createStaffDto: CreateStaffDto) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('You are not authorized to create new staff');
    }

    const [staff] = await this.dbService.db
      .insert(staffs)
      .values({
        ...createStaffDto
      })
      .returning();

    return staff;
  }

  async findAllStaff(keyword?: string) {
    return this.dbService.db
      .select({
        id: staffs.id,
        userId: users.id,
        email: users.email,
        name: staffs.name,
        phoneNo: staffs.phoneNo,
        positionId: positions.id,
        positionName: positions.name
      })
      .from(staffs)
      .innerJoin(
        users,
        eq(staffs.userId, users.id)
      )
      .innerJoin(
        positions,
        eq(staffs.positionId, positions.id)
      )
      .where(keyword ? or(
        ilike(staffs.name, `%${keyword}%`),
        ilike(users.email, `%${keyword}%`),
        ilike(positions.name, `%${keyword}%`)
      ) : undefined
      );
  }

  async findOneStaff(userId: string) {
    const [staff] = await this.dbService.db
      .select({
        id: staffs.id,
        userId: users.id,
        email: users.email,
        name: staffs.name,
        phoneNo: staffs.phoneNo,
        positionId: positions.id,
        positionName: positions.name,
        fileId: files.id,
        fileName: files.filename,
        fileContent: files.content
      })
      .from(staffs)
      .innerJoin(
        users,
        eq(staffs.userId, users.id)
      )
      .innerJoin(
        positions,
        eq(staffs.positionId, positions.id)
      )
      .leftJoin(
        files,
        eq(staffs.fileId, files.id)
      )
      .where(eq(staffs.userId, userId))
      .limit(1);

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    return staff;
  }

  async updateStaff(
    id: string,
    updateStaffDto: UpdateStaffDto,
    userId: string,
    userRole: string
  ) {
    const staff = await this.findOneStaff(id);

    if (staff.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You are not authorized to update this data');
    }

    const updatedData: Record<string, unknown> = { ...updateStaffDto };

    if (userRole == 'ADMIN' && updateStaffDto.positionId) {
      updatedData.position_id = updateStaffDto.positionId;
    }

    if (updateStaffDto.fileId) {
      updatedData.file_id = updateStaffDto.fileId;
    }

    if (updateStaffDto.phoneNo) {
      updatedData.phone_no = updateStaffDto.phoneNo;
    }

    updatedData.modified_by = userId;

    const [updated] = await this.dbService.db
      .update(staffs)
      .set(updatedData)
      .where(eq(staffs.userId, id))
      .returning();

    // send notif
    const message = {
      staffUserId: updated.userId,
      staffName: updated.name,
      changes: Object.keys(updateStaffDto),
      timestamp: new Date().toISOString()
    };

    const [publish] = await this.dbService.db
      .insert(kafkaPublished)
      .values({
        topic: KAFKA_TOPICS.SEND_PUSH,
        message: JSON.stringify(message),
      })
      .returning();

    this.kafkaClient.emit(KAFKA_TOPICS.SEND_PUSH, {
      message: message,
      messageId: publish.messageId
    });

    return updated;
  }

  async deleteStaff(id: string) {
    const [result] = await this.dbService.db
      .delete(staffs)
      .where(eq(staffs.id, id))
      .returning();

    if (!result) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }

    const [deletedUser] = await this.dbService.db
      .delete(users)
      .where(eq(users.id, result.userId))
      .returning();

    // remove user in other ms
    const message = {
      userId: deletedUser.id,
      timestamp: new Date().toISOString()
    };

    const [publish] = await this.dbService.db
      .insert(kafkaPublished)
      .values({
        topic: KAFKA_TOPICS.USER_DELETED,
        message: JSON.stringify(message),
      })
      .returning();

    this.kafkaClient.emit(KAFKA_TOPICS.USER_DELETED, {
      message: message,
      messageId: publish.messageId
    });

    return { message: 'Deleted successfully' };
  }

  async findTodayAttendance(staffId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(startOfDay.getDate() + 1);

    const [attendance] = await this.dbService.db
      .select()
      .from(attendances)
      .where(and(
        eq(attendances.staffId, staffId),
        and(
          gte(attendances.attendanceDate, startOfDay),
          lt(attendances.attendanceDate, endOfDay)
        )
      ))
      .limit(1);

    return attendance;
  }

  async findMyAttendances(staffId: string, startDateStr?: string, endDateStr?: string) {
    const startDate = startDateStr ? new Date(startDateStr) : null;
    const endDate = endDateStr ? new Date(endDateStr) : null;

    var startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    if (startDate) {
      startOfMonth = startDate;
    }

    var endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(startOfMonth.getMonth() + 1);

    if (endDate) {
      endOfMonth = endDate;
    }

    return this.dbService.db
      .select()
      .from(attendances)
      .where(and(
        eq(attendances.staffId, staffId),
        and(
          gte(attendances.attendanceDate, startOfMonth),
          lt(attendances.attendanceDate, endOfMonth)
        )
      ))
      .orderBy(desc(attendances.attendanceDate));
  }

  async findAllAttendances() {
    return this.dbService.db
      .select({
        id: attendances.id,
        attendanceDate: attendances.attendanceDate,
        clockIn: attendances.clockIn,
        clockOut: attendances.clockOut,
        staffId: attendances.staffId,
        name: staffs.name
      })
      .from(attendances)
      .innerJoin(
        staffs,
        eq(staffs.id, attendances.staffId)
      )
      .orderBy(desc(attendances.attendanceDate));
  }

  async clockIn(staffId: string) {
    const existingAttendance = await this.findTodayAttendance(staffId);

    if (existingAttendance) {
      throw new ConflictException('You have already clocked in');
    }

    let attendanceDate = new Date();
    attendanceDate.setHours(0,0,0,0);

    const [attendance] = await this.dbService.db
      .insert(attendances)
      .values({
        staffId: staffId,
        attendanceDate: attendanceDate,
        clockIn: new Date()
      })
      .returning();

    return attendance;
  }

  async clockOut(staffId: string) {
    const existingAttendance = await this.findTodayAttendance(staffId);

    if (existingAttendance.clockOut !== null) {
      throw new ConflictException('You have already clocked out');
    }

    const [updated] = await this.dbService.db
      .update(attendances)
      .set({
        clockOut: new Date()
      })
      .where(eq(attendances.id, existingAttendance.id))
      .returning();

    return updated;
  }

  async findAllPositions(keyword?: string) {
    return this.dbService.db
      .select()
      .from(positions)
      .where(keyword ? ilike(positions.name, `%${keyword}%`) : undefined);
  }

  async saveFile(file: Express.Multer.File) {
    const [newFile] = await this.dbService.db
      .insert(files)
      .values({
        filename: file.originalname,
        content: file.buffer, // Buffer received from Multer
      })
      .returning();
    
    return newFile;
  }
}
