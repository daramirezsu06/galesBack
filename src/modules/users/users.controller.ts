import {
  Controller,
  Get,
  Body,
  Param,
  Put,
  ParseUUIDPipe,
  UseGuards,
  Req,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateAdminUserDto, UpdateUserDto } from './users.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UUID } from 'crypto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Role } from 'src/models/roles.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserAuthGuard } from 'src/guards/userAuth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  getProfile(@Req() request) {
    const userId = request.user.id;
    return this.usersService.findOne(userId);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: UUID) {
    return this.usersService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Post()
  create(@Req() request, @Body() data: CreateAdminUserDto) {
    const user = request.user;
    return this.usersService.createAdmin(user.id, data);
  }

  @UseGuards(UserAuthGuard)
  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: UUID, @Body() changes: UpdateUserDto) {
    return this.usersService.update(id, changes);
  }

  // @Delete(':id')
  // remove(@Param('id', ParseUUIDPipe) id: UUID) {
  //   return this.usersService.remove(id);
  // }
}
