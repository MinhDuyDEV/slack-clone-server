import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { ChannelController } from './controllers/channel.controller';
import { ChannelService } from './services/channel.service';
import { ChannelRepository } from './repositories/channel.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Channel]), UsersModule],
  controllers: [ChannelController],
  providers: [
    {
      provide: 'IChannelRepository',
      useClass: ChannelRepository,
    },
    {
      provide: 'IChannelService',
      useClass: ChannelService,
    },
  ],
  exports: ['IChannelService', 'IChannelRepository'],
})
export class ChannelModule {}
