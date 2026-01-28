import { SERVICES_PORTS } from "@app/common";
import { HttpService } from "@nestjs/axios";
import { HttpException, Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";

@Injectable()
export class NotificationsService {
    private readonly notificationsUrl = `http://localhost:${SERVICES_PORTS.NOTIFICATIONS}`;

    constructor(private readonly httpService: HttpService) { }

    async getInbox(token: string, userId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.notificationsUrl}/inbox/${userId}`, {
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
