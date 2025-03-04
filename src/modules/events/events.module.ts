import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { ChannelsModule } from '../channels/channels.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { GatewaySessionManager } from './gateway-session-manager';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MessagesModule,
    ChannelsModule,
    WorkspacesModule,
  ],
  providers: [EventsGateway, GatewaySessionManager],
  exports: [EventsGateway, GatewaySessionManager],
})
export class EventsModule {}
