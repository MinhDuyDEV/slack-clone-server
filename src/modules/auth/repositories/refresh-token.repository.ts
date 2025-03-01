import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IRefreshTokenRepository } from 'src/core/interfaces/repositories/refresh-token.repository.interface';
import { RefreshToken } from '../entities/refresh-token.entity';
import { BaseRepository } from 'src/core/repositories/base.repository';

@Injectable()
export class RefreshTokensRepository
  extends BaseRepository<RefreshToken>
  implements IRefreshTokenRepository
{
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {
    super(refreshTokenRepository);
  }

  async findValidToken(
    userId: string,
    token: string,
  ): Promise<RefreshToken | null> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: {
        token,
      },
    });
    if (
      !refreshToken ||
      refreshToken.revokedAt !== null ||
      refreshToken.expiresAt < new Date()
    ) {
      return null;
    }
    return refreshToken;
  }

  async revokeToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { token },
      { revokedAt: new Date() },
    );
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, revokedAt: null },
      { revokedAt: new Date() },
    );
  }
}
