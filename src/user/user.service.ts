import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserDto } from './dto/user.dto.js';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {} //inject PrismaService

  async createUser(createUserDto: CreateUserDto): Promise<UserDto> {
    // füge User zur Prisma Datenbank hinzu und gebe das ergebnis zurück an den Controller
    const createdUser = await this.prismaService.user.create({
      data: createUserDto,
    });

    console.log('new user was created: ', createdUser);

    return createdUser;
  }
}
