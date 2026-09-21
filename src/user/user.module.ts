import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  imports: [],
  controllers: [UserController], // Controller muss im controllers bereitgestellt werden
  providers: [UserService, PrismaService], // Service muss immer im providers bereitgestellt werden
})
export class UserModule {}
