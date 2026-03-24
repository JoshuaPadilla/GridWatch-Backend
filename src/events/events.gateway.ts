import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Notification } from 'src/endpoints/notification/schema/notification.schema';
import { DEVICE_STATUS } from 'src/enums/device_status.enums';

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
    this.logger.log(
      `Client connected: ${client.id} on namespace ${client.nsp.name}`,
    );
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
    if (!data?.deviceId) {
      client.emit('joinRoomError', {
        reason: 'deviceId is required',
        socketId: client.id,
      });
      this.logger.warn(
        `Client ${client.id} attempted to join without deviceId`,
      );
      return;
    }

    client.join(data.deviceId);

    const room = this.server.sockets.adapter.rooms.get(data.deviceId);
    const roomSize = room?.size ?? 0;

    client.emit('joinedRoom', {
      deviceId: data.deviceId,
      socketId: client.id,
      roomSize,
    });

    this.logger.log(
      `Client ${client.id} joined room ${data.deviceId}. Room size: ${roomSize}`,
    );
  }

  @SubscribeMessage('disconnectDevice')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { deviceId: string },
  ) {
    if (!data?.deviceId) {
      client.emit('leaveRoomError', {
        reason: 'deviceId is required',
        socketId: client.id,
      });
      this.logger.warn(
        `Client ${client.id} attempted to leave without deviceId`,
      );
      return;
    }

    client.leave(data.deviceId);

    const room = this.server.sockets.adapter.rooms.get(data.deviceId);
    const roomSize = room?.size ?? 0;

    client.emit('leftRoom', {
      deviceId: data.deviceId,
      socketId: client.id,
      roomSize,
    });

    this.logger.log(
      `Client ${client.id} left room ${data.deviceId}. Room size: ${roomSize}`,
    );
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

  sendNotificationToDevice(deviceId: string, notification: Notification) {
    if (this.server) {
      this.server.to(deviceId).emit('notification', notification);
      this.logger.log(`Notification sent to device room: ${deviceId}`);
    }
  }

  changeDeviceStatus(deviceId: string, status: DEVICE_STATUS) {
    this.server.emit('changeDeviceStatus', { deviceId, status });
  }

  sendDevicePrediction(deviceId: string, riskScore: number) {
    console.log('Sending Prediction');
    if (this.server) {
      this.server.to(deviceId).emit('prediction', { deviceId, riskScore });
      this.logger.log(`Prediction sent to device room: ${deviceId}`);
    }
  }
}
