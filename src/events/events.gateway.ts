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
import { CreateNotificationDto } from 'src/endpoints/notification/dto/create-notification.dto';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins (Change for production!)
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventsGateway');

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

  // --- Room Management ---
  @SubscribeMessage('connectDevice')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { deviceId: string },
  ) {
    if (!data.deviceId) return; // Add validation

    client.join(data.deviceId);
    this.logger.log(`Client ${client.id} joined room ${data.deviceId}`);
  }

  @SubscribeMessage('disconnectDevice')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { deviceId: string },
  ) {
    if (!data.deviceId) return;

    client.leave(data.deviceId);
    client.emit('leftRoom', `You have left ${data.deviceId}`);
    this.logger.log(`Client ${client.id} left room ${data.deviceId}`);
  }

  // --- Public Methods (Call these from Services) ---

  /**
   * Sends data to a specific device room.
   * Usage: Inject EventsGateway into your Service to use this.
   */
  sendPayloadToDevice(deviceId: string, payload: any) {
    // Destructure to remove sensitive ID if needed, or just send payload
    const { deviceId: sensorId, ...rest } = payload;

    // Check if server exists before emitting (good for testing/serverless)
    if (this.server) {
      this.server.to(deviceId).emit('sensorPayload', rest);
      this.logger.log(`Payload sent to device room: ${deviceId}`);
    }
  }

  sendNotificationToDevice(
    deviceId: string,
    notification: CreateNotificationDto,
  ) {
    if (this.server) {
      this.server.to(deviceId).emit('notification', notification);
      this.logger.log(`Notification sent to device room: ${deviceId}`);
    }
  }
}
