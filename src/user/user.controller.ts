import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserService } from './user.service.js';

@Controller('user')
export class UserController {
  // injiziere userService um auf die methoden zuzugreifen
  constructor(private userService: UserService) {}

  // erstelle Post handler mit Body anforderungen von dem Schema/Dto
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    // weitergabe an die createUser methode aus dem Service
    return this.userService.createUser(createUserDto);
  }
}
