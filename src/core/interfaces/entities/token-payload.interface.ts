import { UserRole } from 'src/core/enums';

export interface ITokenPayload {
  sub: string;
  email: string;
  roles: UserRole[];
  type: 'access' | 'refresh';
}
