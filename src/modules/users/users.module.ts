import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './repositories/users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UsersRepository,
    },
    {
      provide: 'IUserService',
      useClass: UsersService,
    },
  ],
  exports: ['IUserService', 'IUserRepository'],
})
export class UsersModule {}
