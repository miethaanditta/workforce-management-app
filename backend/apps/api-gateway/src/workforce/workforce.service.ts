import { CreateStaffDto, SERVICES_PORTS, UpdateStaffDto } from "@app/common";
import { HttpService } from "@nestjs/axios";
import { HttpException, Injectable } from "@nestjs/common";
import FormData = require('form-data');
import { firstValueFrom } from "rxjs";

@Injectable()
export class WorkforceService {
    private readonly workforceUrl = `http://localhost:${SERVICES_PORTS.WORKFORCE}`;

    constructor(private readonly httpService: HttpService) { }

    async createStaff(token: string, userRole: string, data: CreateStaffDto) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.workforceUrl}/staff`, data, {
                    headers: {
                        Authorization: token,
                        'x-user-role': userRole
                    }
                }),
            );

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async findAllStaff(token: string, keyword?: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.workforceUrl}/staff`, {
                    headers: {
                        Authorization: token
                    },
                    params: {
                        keyword: keyword
                    }
                }),
            );

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async findOneStaff(token: string, userId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.workforceUrl}/staff/${userId}`, {
                    headers: {
                        Authorization: token
                    }
                }),
            );

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async updateStaff(token: string, userId: string, userRole: string, id: string, data: UpdateStaffDto) {
        try {
            const response = await firstValueFrom(
                this.httpService.put(`${this.workforceUrl}/staff/${id}`, data, {
                    headers: {
                        Authorization: token,
                        'x-user-id': userId,
                        'x-user-role': userRole
                    }
                }),
            );

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async deleteStaff(token: string, id: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.delete(`${this.workforceUrl}/staff/${id}`, {
                    headers: {
                        Authorization: token
                    }
                }),
            );

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async findTodayAttendance(token: string, id: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.workforceUrl}/today-attendance/${id}`, {
                    headers: {
                        Authorization: token
                    }
                }),
            );

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async findMyAttendances(token: string, id: string, startDate?: string, endDate?: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.workforceUrl}/attendance/${id}`, {
                    headers: {
                        Authorization: token
                    },
                    params: {
                        startDate: startDate,
                        endDate: endDate
                    }
                }),
            );

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async findAllAttendances(token: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.workforceUrl}/attendance`, {
                    headers: {
                        Authorization: token
                    }
                }),
            );

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async clockIn(token: string, id: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.workforceUrl}/${id}/clock-in`, undefined, {
                    headers: {
                        Authorization: token
                    }
                }),
            );

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async clockOut(token: string, id: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.put(`${this.workforceUrl}/${id}/clock-out`, undefined, {
                    headers: {
                        Authorization: token
                    }
                }),
            );

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async findAllPositions(token: string, keyword?: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.workforceUrl}/positions`, {
                    headers: {
                        Authorization: token
                    },
                    params: {
                        keyword: keyword
                    }
                }),
            );

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async saveFile(token: string, file: Express.Multer.File) {
        try {
            const formData = new FormData();
        
            // Use file.buffer for memory storage or fs.createReadStream(file.path) for disk storage
            // The key 'file' must match the @UseInterceptors(FileInterceptor('file')) on the receiver
            formData.append('file', file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype,
            });

            const response = await firstValueFrom(
                this.httpService.post(`${this.workforceUrl}/files`, formData, {
                    headers: {
                        ...formData.getHeaders(),
                        Authorization: token
                    }
                }),
            );

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown): never {
        const err = error as {
            response?: { data: string | object; status: number }
        };

        if (err.response) {
            throw new HttpException(err.response.data, err.response.status);
        }

        throw new HttpException('Something went wrong', 503);
    }
}
