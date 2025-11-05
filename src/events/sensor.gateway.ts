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
export class SensorGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  // Get an instance of the Socket.IO server
  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('EventsGateway');

  //   handle join
  @SubscribeMessage('connectDevice')
  handleJoinSubject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sensorId: string },
  ) {
    client.join(data.sensorId);
    console.log(`Client ${client.id} joined subject room ${data.sensorId}`);
  }

  //   handle leave
  @SubscribeMessage('disconnectDevice')
  handleLeaveRoom(
    @MessageBody() data: { sensorId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.sensorId);
    client.emit('leftRoom', `You have left ${data.sensorId}`);
  }

  //   emit message to specific device
  sendPayload(deviceId: string, payload: any) {
    this.server.to(deviceId).emit('sensorPayload', payload);
  }

  // --- Lifecycle Hooks ---

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
