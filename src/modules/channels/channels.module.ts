import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { ChannelsService } from './services/channels.service';
import { ChannelsRepository } from './repositories/channel.repository';
import { UsersModule } from '../users/users.module';
import { ChannelsController } from './controllers/channels.controller';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [TypeOrmModule.forFeature([Channel]), UsersModule, WorkspacesModule],
  controllers: [ChannelsController],
  providers: [
    {
      provide: 'IChannelRepository',
      useClass: ChannelsRepository,
    },
    {
      provide: 'IChannelService',
      useClass: ChannelsService,
    },
  ],
  exports: ['IChannelService', 'IChannelRepository'],
})
export class ChannelsModule {}
