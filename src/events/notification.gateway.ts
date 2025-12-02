import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins for simplicity. Adjust for production!
  },
})
export class NotificationGateway {
  // Get an instance of the Socket.IO server
  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('EventsGateway');

  //   emit message to specific device
  sendPayload(deviceId: string, payload: any) {
    const { deviceId: sensorId, ...rest } = payload;

    this.server.to(deviceId).emit('sensorPayload', rest);
  }
}
