import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { ChannelsService } from './services/channels.service';
import { ChannelsRepository } from './repositories/channel.repository';
import { UsersModule } from '../users/users.module';
import { ChannelsController } from './controllers/channels.controller';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { ChannelMemberRole } from './entities/channel-member-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, ChannelMemberRole]),
    UsersModule,
    forwardRef(() => WorkspacesModule),
  ],
  controllers: [ChannelsController],
  providers: [
    ChannelsRepository,
    ChannelsService,
    {
      provide: 'IChannelRepository',
      useClass: ChannelsRepository,
    },
    {
      provide: 'IChannelService',
      useClass: ChannelsService,
    },
  ],
  exports: [
    'IChannelService',
    'IChannelRepository',
    ChannelsRepository,
    ChannelsService,
  ],
})
export class ChannelsModule {}
