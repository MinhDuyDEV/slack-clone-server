export interface ITokenPayload {
  sub: string;
  email: string;
  type: 'access' | 'refresh';
}
