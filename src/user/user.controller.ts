import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserService } from './user.service.js';
import { UserDto } from './dto/user.dto.js';

@Controller('user')
export class UserController {
  // injiziere userService um auf die methoden zuzugreifen
  // constructor(private userService: UserService) {}
  // // erstelle Post handler mit Body anforderungen von dem Schema/Dto
  // @Post()
  // createUser(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
  //   // weitergabe an die createUser methode aus dem Service
  //   return this.userService.createUser(createUserDto);
  // }
  // @Get()
  // getUsers(): Promise<UserDto[]> {
  //   return this.userService.getUsers();
  // }
  // :id muss im get mit doppelpunkt geschrieben werden
  // @Get(':id')
  // async getUserById(@Param('id') id: string): Promise<UserDto> {
  //   const user = await this.userService.getUserById(id);
  // }
  // @Delete(':id')
  // deleteUserById(@Param('id') id: string): Promise<UserDto> {
  //   return this.userService.deleteUserById(id);
  // }
}
