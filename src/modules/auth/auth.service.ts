import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { NodemailerService } from '../nodemailer/nodemailer.service';
import { CreateUserDto } from '../users/users.dto';
import { LoginUserDto, LoginUserDtoGoogle, RecoveryPassDto } from './auth.dto';
import { Role } from 'src/models/roles.enum';
import { User } from 'src/entities/user.entity';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly nodemailerService: NodemailerService,
  ) {}

  async validateUser(details: LoginUserDtoGoogle) {
    console.log('AuthService');
    console.log(details);
    const user = await this.usersService.findByEmail(details.email);
    console.log(user);

    if (user) return user;

    return await this.usersService.createWhitGoogle({
      email: details.email,
      name: details.displayName,
      image: details.image,
      password: details.password,
    });
  }

  async signin(credentials: LoginUserDto) {
    const { email, password } = credentials;

    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Credenciales inválidas');

    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) throw new BadRequestException('Credenciales inválidas');

    const userPayload = {
      sub: user.id,
      id: user.id,
      email: user.email,
      roles: user.role,
    };

    const token = this.jwtService.sign(userPayload);
    return { user, token };
  }

  async signup(user: CreateUserDto) {
    const dbUser = await this.usersService.findByEmail(user.email);
    if (dbUser) throw new BadRequestException('El email se encuentra en uso');

    const adminId = await this.usersService.findByRole(Role.ADMIN);

    const hashedPass = await bcrypt.hash(user.password, 10);
    if (!hashedPass)
      throw new BadRequestException('Password could not be hashed');

    return this.usersService.create({
      ...user,
      password: hashedPass,
      sellerId: adminId[0].id,
    });
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Verifique su dirección de email');

    const payload = {
      id: user.id,
    };
    const token = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    await this.usersService.update(user.id as UUID, {
      recoveryToken: token,
    });

    const link = `${process.env.NODEMAILER_FRONT_URL}/recovery-password?token=${token}`;

    this.nodemailerService.forgotPassEmail(email, user.name, link);
  }

  async recoveryPass(data: RecoveryPassDto) {
    const { token, password } = data;

    try {
      const secret = process.env.JWT_SECRET;
      const payload = this.jwtService.verify(token, { secret });

      const user = await this.usersService.findOne(payload.id);

      if (user.recoveryToken !== token)
        throw new BadRequestException('Token inválido');

      const hashPass = await bcrypt.hash(password, 10);

      const updUser = await this.usersService.update(payload.id, {
        password: hashPass,
        recoveryToken: null,
      });

      return updUser;
    } catch (error) {
      throw new BadRequestException('Token inválido');
    }
  }
}
