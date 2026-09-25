import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UserService } from '../user/user.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AccessTokenGuard } from './guards/access-token.guard.js';
import { GoogleAuthService } from './google-auth.service.js';
import { GithubAuthService } from './github-auth.service.js';
import { MailService } from './mail.service.js';
import { WsJwtGuard } from './guards/ws-jwt.guard.js';

@Module({
  imports: [UserModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    PrismaService,
    AccessTokenGuard,
    GoogleAuthService,
    GithubAuthService,
    MailService,
    WsJwtGuard,
  ],
  exports: [WsJwtGuard],
})
export class AuthModule {}
