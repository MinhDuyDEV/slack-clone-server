import { Socket } from 'socket.io';
import { User } from '../users/entities/user.entity';

export interface AuthenticatedSocket extends Socket {
  user: User;
}
