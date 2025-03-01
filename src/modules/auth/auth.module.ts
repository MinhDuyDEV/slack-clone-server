import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import {
  access_token_private_key,
  access_token_public_key,
} from 'src/common/utils/keys.util';
import { AuthService } from './auth.service';
import { RolesGuard } from './guards/roles.guard';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { RefreshToken } from './entities/refresh-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenRepository } from './repositories/refresh-token.repositoty';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        privateKey: access_token_private_key,
        publicKey: access_token_public_key,
        signOptions: {
          algorithm: 'RS256',
          expiresIn: configService.get('jwt.accessToken.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: 'IRefreshTokenRepository',
      useClass: RefreshTokenRepository,
    },
    {
      provide: 'IAuthService',
      useClass: AuthService,
    },
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    RolesGuard,
  ],
})
export class AuthModule {}
