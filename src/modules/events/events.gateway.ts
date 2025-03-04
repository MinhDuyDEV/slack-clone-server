import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Inject, Logger } from '@nestjs/common';
import { AuthenticatedSocket } from './authenticated-socket';
import { IMessageService } from 'src/core/interfaces/services/message.service.interface';
import { IChannelService } from 'src/core/interfaces/services/channel.service.interface';
import { IUserService } from 'src/core/interfaces/services/user.service.interface';
import { IWorkspaceService } from 'src/core/interfaces/services/workspace.service.interface';
import { IWorkspaceRepository } from 'src/core/interfaces/repositories/workspace.repository.interface';
import { SocketAuthMiddleware } from './ws.mw';
import { AuthService } from '../auth/auth.service';
import { GatewaySessionManager } from './gateway-session-manager';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 15000,
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject('IMessageService')
    private readonly messageService: IMessageService,
    @Inject('IChannelService')
    private readonly channelService: IChannelService,
    @Inject('IUserService')
    private readonly userService: IUserService,
    @Inject('IWorkspaceService')
    private readonly workspaceService: IWorkspaceService,
    @Inject('IWorkspaceRepository')
    private readonly workspaceRepository: IWorkspaceRepository,
    @Inject('IAuthService')
    private readonly authService: AuthService,
    private readonly sessions: GatewaySessionManager,
  ) {}
  afterInit(server: AuthenticatedSocket) {
    server.use(SocketAuthMiddleware(this.authService) as any);
  }

  handleConnection(socket: AuthenticatedSocket, ...args: any[]): any {
    Logger.log('user connected in socket', JSON.stringify(socket.user));
    Logger.log('handleConnection');
    this.sessions.setUserSocket(socket.user.id, socket);
  }

  handleDisconnect(socket: AuthenticatedSocket): any {
    Logger.log('user disconnected in socket', JSON.stringify(socket.user));
    Logger.log('handleDisconnect');
    this.sessions.removeUserSocket(socket.user.id);
  }
}
