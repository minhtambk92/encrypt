// src/user/user.controller.ts
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
    }

    @Get('search')
    findByEmail(@Query('email') email: string) {
        return this.userService.findByEmail(email);
    }

    @Get('searchByUsername')
    findByUsername(@Query('username') username: string) {
        return this.userService.findByUsername(username);
    }
}