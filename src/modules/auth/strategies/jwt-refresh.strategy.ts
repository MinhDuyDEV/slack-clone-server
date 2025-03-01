import { Request } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { refresh_token_public_key } from 'src/common/utils/keys.util';
import { ITokenPayload } from 'src/core/interfaces/entities/token-payload.interface';
import { IUserRepository } from 'src/core/interfaces/repositories/user.repository.interface';
import { IDeviceInfo } from 'src/core/interfaces/entities/device-info.interface';

interface RequestWithDeviceInfo extends Request {
  deviceInfo?: IDeviceInfo;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request?.cookies?.refresh_token;
          if (token) {
            return token;
          }

          return request.body?.refreshToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: refresh_token_public_key,
      algorithms: ['RS256'],
      passReqToCallback: true,
    });
  }

  async validate(req: RequestWithDeviceInfo, payload: ITokenPayload) {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Get refresh token from cookie or body
    const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Add deviceInfo to request for use in controller
    req.deviceInfo = {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };

    return user;
  }
}
