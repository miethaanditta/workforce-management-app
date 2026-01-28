import { Test, TestingModule } from '@nestjs/testing';
import { SecurityService } from './security.service';
import { JwtService } from '@nestjs/jwt';
import { KAFKA_SERVICE } from '@app/kafka';
import { DatabaseService } from './database';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed-password'),
    compare: jest.fn()
}));

describe('SecurityService', () => {
    let service: SecurityService;

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
        },
    };

    const mockJwtService = {
        sign: jest.fn().mockReturnValue('mocked-jwt-token'),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SecurityService,
                { provide: KAFKA_SERVICE, useValue: mockKafkaClient },
                { provide: DatabaseService, useValue: mockDbService },
                { provide: JwtService, useValue: mockJwtService }
            ],
        }).compile();

        service = module.get<SecurityService>(SecurityService);

        // clear mock call history before each test
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            // mock no existing user
            mockDbService.db.limit.mockReturnValueOnce([]);

            const mockUser = {
                id: '53fdf8b2-b691-4157-8531-1e5d76573cd9',
                email: 'user@test.com',
                name: 'User Test',
                role: 'USER'
            };

            const mockPublished = {
                messageId: '23fdf8b2-b691-4157-8531-1e5d76573cd9',
                topic: 'user.registered'
            };

            mockDbService.db.returning
                .mockReturnValueOnce([mockUser])
                .mockReturnValueOnce([mockPublished]);

            const result = await service.register(
                'ADMIN',
                'user@test.com',
                'securePassword',
                'User Test'
            );

            expect(result).toEqual({
                message: 'User registered successfully',
                userId: '53fdf8b2-b691-4157-8531-1e5d76573cd9'
            });

            expect(bcrypt.hash).toHaveBeenCalledWith('securePassword', 10);

            expect(mockKafkaClient.emit).toHaveBeenCalledWith(
                'user.registered',
                expect.objectContaining({
                    messageId: '23fdf8b2-b691-4157-8531-1e5d76573cd9'
                })
            );
        });

        it('should throw ConflictException if user already exist', async () => {
            mockDbService.db.limit.mockReturnValueOnce([{
                id: '53fdf8b2-b691-4157-8531-1e5d76573cd8',
                email: 'user@test.com'
            }]);

            await expect(
                service.register(
                    'ADMIN',
                    'user@test.com',
                    'securePassword',
                    'User Test'
                )
            ).rejects.toThrow('User already exists');
        });
    });

    describe('login', () => {
        const mockUser = {
            id: '53fdf8b2-b691-4157-8531-1e5d76573cd9',
            email: 'user@test.com',
            name: 'User Test',
            role: 'USER',
            password: 'hashed-password'
        };

        it('should login successfully', async () => {
            mockDbService.db.limit.mockReturnValueOnce([mockUser]);

            (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

            const result = await service.login(
                'user@test.com',
                'securePassword'
            );

            expect(result).toEqual({
                access_tokens: 'mocked-jwt-token',
                user: {
                    id: '53fdf8b2-b691-4157-8531-1e5d76573cd9',
                    email: 'user@test.com',
                    name: 'User Test',
                    role: 'USER',
                }
            });
        });

        it('should throw UnauthorizedException if wrong password', async () => {
            mockDbService.db.limit.mockReturnValueOnce([mockUser]);

            (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

            await expect(
                service.login(
                    'user@test.com',
                    'wrongPassword'
                )
            ).rejects.toThrow('Invalid credentials');
        });
    });
});
