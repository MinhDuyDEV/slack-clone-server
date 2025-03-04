import { Injectable } from '@nestjs/common';
import { AuthenticatedSocket } from './authenticated-socket';

export interface IGatewaySessionManager {
  getUserSocket(userId: string): AuthenticatedSocket | undefined;
  setUserSocket(userId: string, socket: AuthenticatedSocket): void;
  removeUserSocket(userId: string): void;
  getSockets(): Map<string, AuthenticatedSocket>;
}

@Injectable()
export class GatewaySessionManager implements IGatewaySessionManager {
  private sessions: Map<string, AuthenticatedSocket> = new Map();

  getUserSocket(userId: string): AuthenticatedSocket | undefined {
    return this.sessions.get(userId);
  }

  setUserSocket(userId: string, socket: AuthenticatedSocket): void {
    this.sessions.set(userId, socket);
  }

  removeUserSocket(userId: string): void {
    this.sessions.delete(userId);
  }

  getSockets(): Map<string, AuthenticatedSocket> {
    return this.sessions;
  }
}
