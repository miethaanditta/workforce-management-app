import { Controller, Get, Headers, Param, ParseUUIDPipe, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { NotificationsService } from "./notifications.service";

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @UseGuards(AuthGuard('jwt'))
    @Get("inbox/:id")
    getInbox(
      @Headers("authorization") token: string,
      @Param('id', ParseUUIDPipe) userId: string
    ) {
      return this.notificationsService.getInbox(token, userId);
    }
}
