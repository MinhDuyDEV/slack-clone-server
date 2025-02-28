import { Request, Response, NextFunction } from 'express';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    this.logger.log(`${method} ${originalUrl}`);

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.logger.log(
        `${method} ${originalUrl} ${res.statusCode} - ${duration}ms`,
      );
    });

    next();
  }
}
