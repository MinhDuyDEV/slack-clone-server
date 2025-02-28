import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get port() {
    return this.configService.get<number>('PORT');
  }

  get corsConfig() {
    return {
      origin: this.configService.get('cors.origin'),
      credentials: this.configService.get('cors.credentials'),
    };
  }

  get databaseConfig() {
    return {
      type: this.configService.get('database.type'),
      host: this.configService.get('database.host'),
      port: this.configService.get('database.port'),
      username: this.configService.get('database.username'),
      password: this.configService.get('database.password'),
      database: this.configService.get('database.database'),
    };
  }

  get jwtConfig() {
    return {
      accessToken: this.configService.get('jwt.accessToken'),
      refreshToken: this.configService.get('jwt.refreshToken'),
    };
  }

  // get awsConfig() {
  //   return {
  //     s3: this.configService.get('aws.s3'),
  //     cloudfront: this.configService.get('aws.cloudfront'),
  //   };
  // }
}
