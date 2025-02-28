import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  accessToken: {
    secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    expiresIn: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN, 10),
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_TOKEN_SECRET,
    expiresIn: parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN, 10),
  },
}));
