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
import { MailService } from './mail.service.js';
import { randomBytes, createHash } from 'node:crypto';
import type { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import type { ResetPasswordDto } from './dto/reset-password.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
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

  async loginWithOAuthProfile(profile: {
    email: string;
    name: string;
    avatarUrl?: string;
    googleId?: string;
    githubId?: string;
  }): Promise<AuthResult> {
    const email = this.normalizeEmail(profile.email);

    let user = profile.googleId
      ? await this.userService.findByGoogleId(profile.googleId)
      : undefined;

    if (!user && profile.githubId) {
      user = await this.userService.findByGithubId(profile.githubId);
    }

    if (!user) {
      let unsafeUser = await this.userService.getUserByEmail(email);
      if (unsafeUser) user = this.userService.toSafeUser(unsafeUser);
    }

    if (!user) {
      user = await this.userService.createOAuthUser({
        name: profile.name,
        email,
        avatarUrl: profile.avatarUrl,
        googleId: profile.googleId,
        githubId: profile.githubId,
      });
    } else {
      if (profile.googleId && !user.googleId) {
        await this.userService.linkGoogleId(user.id, profile.googleId);
      }
      if (profile.githubId && !user.githubId) {
        await this.userService.linkGithubId(user.id, profile.githubId);
      }
    }

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

  private hashResetToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ success: true }> {
    const email = this.normalizeEmail(dto.email);
    const user = await this.userService.getUserByEmail(email);
    if (user) {
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = this.hashResetToken(rawToken);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await this.userService.setResetPasswordToken(
        user.id,
        tokenHash,
        expiresAt,
      );

      const resetBaseUrl =
        this.configService.getOrThrow<string>('PASSWORD_RESET_URL');

      const resetUrl = `${resetBaseUrl}?token=${rawToken}`;

      await this.mailService.sendPasswordResetEmail(user.email, resetUrl);
    }

    return {
      success: true,
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ success: true }> {
    const tokenHash = this.hashResetToken(dto.token);

    const user = await this.userService.findByPasswordResetTokenHash(tokenHash);

    if (
      !user ||
      !user.passwordResetTokenExpiresAt ||
      user.passwordResetTokenExpiresAt.getTime() < Date.now()
    ) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const passwordHash = await argon2.hash(dto.newPassword);
    await this.userService.resetPassword(user.id, passwordHash);
    return { success: true };
  }
}
