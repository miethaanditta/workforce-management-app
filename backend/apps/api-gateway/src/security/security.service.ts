import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LoginDto, RegisterDto, SERVICES_PORTS, UpdatePasswordDto } from '@app/common';

@Injectable()
export class SecurityService {
    private readonly securityUrl = `http://localhost:${SERVICES_PORTS.SECURITY}`;

    constructor(private readonly httpService: HttpService) {}

    async registerAdmin(data: RegisterDto) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.securityUrl}/register-admin`, data),
            );

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async register(token: string, userRole: string, data: RegisterDto) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.securityUrl}/register`, data, {
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

    async login(data: LoginDto) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.securityUrl}/login`, data),
            );

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async updatePassword(token: string, userId: string, data: UpdatePasswordDto) {
        try {
            const response = await firstValueFrom(
                this.httpService.put(`${this.securityUrl}/update-password/${userId}`, data, {
                    headers: { Authorization: token }
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
