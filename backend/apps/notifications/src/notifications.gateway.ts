import { 
  WebSocketGateway, 
  WebSocketServer, 
  OnGatewayConnection 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'; 

@WebSocketGateway({ 
  cors: { origin: '*' } 
})
export class NotificationGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    
    if (userId) {
      const roomName = `user_${userId}`;
      client.join(roomName);
      console.log(`Client ${client.id} joined room: ${roomName}`);
    }
  }

  sendToUser(userId: string, data: any) {
    // This emits only to the specific user's room
    this.server.to(`user_${userId}`).emit('notification', data);
  }
}
