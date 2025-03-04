import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import jwtConfig from './config/configurations/jwt.config';
import appConfig from './config/configurations/app.config';
import corsConfig from './config/configurations/cors.config';
import databaseConfig from './config/configurations/database.config';
import awsConfig from './config/configurations/aws.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AppConfigService } from './config/config.service';
import { ChannelsModule } from './modules/channels/channels.module';
import { SectionsModule } from './modules/sections/sections.module';
import { MessagesModule } from './modules/messages/messages.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { validationSchema } from './config/validation/env.validation';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { EventsModule } from './modules/events/events.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig, jwtConfig, appConfig, corsConfig, awsConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('database.synchronize'),
        autoLoadEntities: true,
        logging: configService.get<boolean>('database.logging'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    WorkspacesModule,
    ChannelsModule,
    SectionsModule,
    MessagesModule,
    EventsModule,
  ],
  providers: [
    AppConfigService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AppConfigService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
