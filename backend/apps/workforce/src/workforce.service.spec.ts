import { Test, TestingModule } from '@nestjs/testing';
import { WorkforceService } from './workforce.service';
import { KAFKA_SERVICE } from '@app/kafka';
import { DatabaseService } from './database';

describe('WorkforceService', () => {
    let service: WorkforceService;

    // create mock objects
    const mockKafkaClient = {
        emit: jest.fn(),
        connect: jest.fn(),
    };

    const mockDbService = {
        db: {
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            values: jest.fn().mockReturnThis(),
            returning: jest.fn().mockReturnThis(),
            innerJoin: jest.fn().mockReturnThis(),
            leftJoin: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WorkforceService,
                { provide: KAFKA_SERVICE, useValue: mockKafkaClient },
                { provide: DatabaseService, useValue: mockDbService },
            ],
        }).compile();

        service = module.get<WorkforceService>(WorkforceService);

        // clear mock call history before each test
        jest.clearAllMocks();
    });

    describe('create-staff', () => {
        it('should create a new staff successfully', async () => {
            const mockStaff = {
                id: '11fdf8b2-b691-4157-8531-1e5d76573cd9',
                userId: '53fdf8b2-b691-4157-8531-1e5d76573cd9',
                name: 'User Test',
                positionId: '44fdf8b2-b691-4157-8531-1e5d76573cd9',
            };

            mockDbService.db.returning.mockReturnValueOnce([mockStaff]);

            const result = await service.createStaff(
                'ADMIN',
                expect.objectContaining(mockStaff)
            );

            expect(result).toEqual(expect.objectContaining(mockStaff));
        });
    });

    describe('update-staff', () => {
        it('should update staff successfully', async () => {
            let mockStaff = {
                id: '11fdf8b2-b691-4157-8531-1e5d76573cd9',
                userId: '53fdf8b2-b691-4157-8531-1e5d76573cd9',
                name: 'User Test',
                positionId: '44fdf8b2-b691-4157-8531-1e5d76573cd9',
            };

            mockDbService.db.limit.mockReturnValueOnce([mockStaff]);

            const mockPublished = {
                messageId: '22fdf8b2-b691-4157-8531-1e5d76573cd9',
                topic: 'notification.send-push'
            };

            mockDbService.db.returning
                .mockReturnValueOnce([mockStaff])
                .mockReturnValueOnce([mockPublished]);

            const result = await service.updateStaff(
                '11fdf8b2-b691-4157-8531-1e5d76573cd9',
                {
                    phoneNo: '08123456789'
                },
                '53fdf8b2-b691-4157-8531-1e5d76573cd9',
                'USER'
            );

            expect(result).toEqual(expect.objectContaining(mockStaff));

            expect(mockKafkaClient.emit).toHaveBeenCalledWith(
                'notification.send-push',
                expect.objectContaining({
                    messageId: '22fdf8b2-b691-4157-8531-1e5d76573cd9'
                })
            );
        });
    });

    describe('clock-in', () => {
        const mockAttendance = {
            staffId: '11fdf8b2-b691-4157-8531-1e5d76573cd9',
            attendanceDate: new Date(2026, 1, 26),
            clockIn: new Date(2026, 1, 26, 9, 10, 0),
        };

        it('should clock in successfully', async () => {
            // mock no existing attendance
            mockDbService.db.limit.mockReturnValueOnce([]);
            mockDbService.db.returning.mockResolvedValueOnce([mockAttendance]);

            var result = await service.clockIn('11fdf8b2-b691-4157-8531-1e5d76573cd9');

            expect(result).toEqual(mockAttendance);
        });

        it('should throw ConflictException if user already clocked in', async () => {
            mockDbService.db.limit.mockReturnValueOnce([mockAttendance]);

            await expect(
                service.clockIn('11fdf8b2-b691-4157-8531-1e5d76573cd9')
            ).rejects.toThrow('You have already clocked in');
        });
    });

    describe('clock-out', () => {
        const mockCompleteAttendance = {
            staffId: '11fdf8b2-b691-4157-8531-1e5d76573cd9',
            attendanceDate: new Date(2026, 1, 26),
            clockIn: new Date(2026, 1, 26, 9, 10, 0),
            clockOut: new Date(2026, 1, 26, 17, 0, 0),
        };

        it('should clock out successfully', async () => {
            const mockAttendance = {
                staffId: '11fdf8b2-b691-4157-8531-1e5d76573cd9',
                attendanceDate: new Date(2026, 1, 26),
                clockIn: new Date(2026, 1, 26, 9, 10, 0),
                clockOut: null
            };

            mockDbService.db.limit.mockResolvedValueOnce([mockAttendance]);
            mockDbService.db.returning.mockResolvedValueOnce([mockCompleteAttendance]);

            var result = await service.clockOut('11fdf8b2-b691-4157-8531-1e5d76573cd9');

            expect(result.clockOut).toBeDefined();
        });

        it('should throw ConflictException if user already clocked in', async () => {
            mockDbService.db.limit.mockReturnValueOnce([mockCompleteAttendance]);

            await expect(
                service.clockOut('11fdf8b2-b691-4157-8531-1e5d76573cd9')
            ).rejects.toThrow('You have already clocked out');
        });
    });
});
