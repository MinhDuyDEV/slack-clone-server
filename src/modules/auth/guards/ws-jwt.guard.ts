import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as cookie from 'cookie';
import { Inject } from '@nestjs/common';
import { IAuthService } from 'src/core/interfaces/services/auth.service.interface';
import { AuthenticatedSocket } from 'src/modules/events/authenticated-socket';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    @Inject('IAuthService')
    private readonly authService: IAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'ws') {
      return true;
    }
    const client: AuthenticatedSocket = context.switchToWs().getClient();

    try {
      await WsJwtGuard.validateToken(client, this.authService);
      return true;
    } catch (err) {
      Logger.error('Token validation failed', err);
      return false;
    }
  }

  static async validateToken(
    client: AuthenticatedSocket,
    authService: IAuthService,
  ) {
    const cookies = client.handshake.headers.cookie;
    const parsedCookies = cookie.parse(cookies);
    const accessToken = parsedCookies['access_token'];
    const payload: any = await authService.verifyAccessToken(accessToken);
    const user = await authService.findUser(payload.sub);
    client.user = user;
    return payload;
  }
}
