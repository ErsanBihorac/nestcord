import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UserService } from '../user/user.service.js';
import type { JwtPayload } from './types/jwt-payload.type.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { AuthResult } from './types/auth-result.type.js';
import { SafeUser } from '../user/types/safe-user.type.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.getOrThrow<string>(
        'ACCESS_TOKEN_EXPIRES_IN',
      ) as JwtSignOptions['expiresIn'],
    });
  }

  private generateRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.getOrThrow<string>(
        'REFRESH_TOKEN_EXPIRES_IN',
      ) as JwtSignOptions['expiresIn'],
    });
  }

  private async issueTokens(payload: JwtPayload): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(dto: RegisterDto): Promise<AuthResult> {
    const email = this.normalizeEmail(dto.email);
    const existingUser = await this.userService.getUserByEmail(email);

    if (existingUser) {
      throw new ConflictException(`An account with this email already exists`);
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.userService.createWithPassword({
      name: dto.name,
      email,
      passwordHash,
    });

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const { accessToken, refreshToken } = await this.issueTokens(payload);

    const refreshTokenHash = await argon2.hash(refreshToken);
    await this.userService.updateRefreshTokenHash(user.id, refreshTokenHash);

    return {
      user: user,
      accessToken,
      refreshToken,
    };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const email = this.normalizeEmail(dto.email);
    const user = await this.userService.getUserByEmail(email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const { accessToken, refreshToken } = await this.issueTokens(payload);

    const refreshTokenHash = await argon2.hash(refreshToken);
    await this.userService.updateRefreshTokenHash(user.id, refreshTokenHash);

    return {
      user: this.userService.toSafeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResult> {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(
        dto.refreshToken,
        {
          secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userService.getUserById(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid or expires refresh token');
    }

    const isRefreshTokenValid = await argon2.verify(
      user.refreshTokenHash,
      dto.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const newPayload: JwtPayload = { sub: user.id, email: user.email };
    const { accessToken, refreshToken } = await this.issueTokens(newPayload);

    const refreshTokenHash = await argon2.hash(refreshToken);
    await this.userService.updateRefreshTokenHash(user.id, refreshTokenHash);

    return {
      user: this.userService.toSafeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string): Promise<{ success: true }> {
    await this.userService.clearRefreshTokenHash(userId);
    return {
      success: true,
    };
  }

  async getUserProfile(userId: string): Promise<SafeUser> {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return this.userService.toSafeUser(user);
  }
}
