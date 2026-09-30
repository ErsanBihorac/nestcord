import { randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

export type GoogleProfile = {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
};

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfoResponse = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
};

@Injectable()
export class GoogleAuthService {
  constructor(private readonly configService: ConfigService) {}

  generateState(): string {
    return randomBytes(32).toString('hex');
  }

  getAuthorizationUrl(state: string): string {
    const clientId = this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID');
    const callbackUrl = this.configService.getOrThrow<string>(
      'GOOGLE_CALLBACK_URL',
    );

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCodeForAccessToken(code: string): Promise<string> {
    const clientId = this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.getOrThrow<string>(
      'GOOGLE_CLIENT_SECRET',
    );
    const callbackUrl = this.configService.getOrThrow<string>(
      'GOOGLE_CALLBACK_URL',
    );

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    const data = (await response.json()) as GoogleTokenResponse;

    if (!response.ok) {
      throw new Error(
        `Google token exchange failed (${response.status}): ${data.error ?? 'unknown_error'}${data.error_description ? ` - ${data.error_description}` : ''}`,
      );
    }

    if (!data.access_token) {
      throw new Error('Google token response missing access_token');
    }

    return data.access_token;
  }

  async fetchProfile(googleAccessToken: string): Promise<GoogleProfile> {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${googleAccessToken}` },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Google profile');
    }

    const data = (await response.json()) as GoogleUserInfoResponse;

    if (!data.email) {
      throw new Error('Google profile did not return an email address');
    }

    return {
      googleId: data.sub,
      email: data.email,
      name: data.name ?? data.email,
      avatarUrl: data.picture,
    };
  }
}
