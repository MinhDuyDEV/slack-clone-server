import { Socket } from 'socket.io';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { AuthService } from '../auth/auth.service';
import { AuthenticatedSocket } from './authenticated-socket';
export type SocketIOMiddleware = {
  (client: Socket, next: (err?: any) => void): void;
};

export const SocketAuthMiddleware = (
  authService: AuthService,
): SocketIOMiddleware => {
  return async (client: AuthenticatedSocket, next) => {
    try {
      await WsJwtGuard.validateToken(client, authService);
      next();
    } catch (err) {
      next(err);
    }
  };
};
