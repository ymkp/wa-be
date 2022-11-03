import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { RegisterInput } from 'src/auth/dtos/auth-register-input.dto';
import { AuthTokenOutput } from 'src/auth/dtos/auth-token-output.dto';
import { JwtSigningService } from 'src/shared/signing/jwt-signing.service';
import { In } from 'typeorm';

import { RequestContext } from '../../shared/request-context/request-context.dto';
import {
  UserCreateBody,
  UserEditBody,
  UserEditPasswordBody,
  UserFilterInput,
} from '../dtos/user-input.dto';

import { UserOutput, UserOutputMini } from '../dtos/user-output.dto';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly signService: JwtSigningService,
  ) {}

  async countUser(): Promise<number> {
    return await this.repository.count();
  }
  async createUser(
    ctx: RequestContext,
    input: RegisterInput,
  ): Promise<UserOutput> {
    await this.checkUserFromInput(input);

    const user = plainToInstance(User, input);

    user.password = await hash(input.password, 10);
    await this.repository.save(user);

    return plainToInstance(UserOutput, user, {
      excludeExtraneousValues: true,
    });
  }

  private async checkUserFromInput(input: RegisterInput): Promise<void> {
    const userFromEmail = await this.repository.findOne({
      where: { email: input.email },
    });
    if (userFromEmail) throw new BadRequestException('Email sudah dipakai');
    const userFromNIK = await this.repository.findOne({
      where: { identificationNo: input.identificationNo },
    });
    if (userFromNIK) throw new BadRequestException('NRP/NIK sudah dipakai');
    const userFromUsername = await this.repository.findOne({
      where: { username: input.username },
    });
    if (userFromUsername)
      throw new BadRequestException('Username sudah dipakai');
  }

  async getUserByEmail(email: string): Promise<User> {
    return await this.repository.findOneOrFail({ where: { email } });
  }

  async validateUsernamePassword(
    username: string,
    pass: string,
  ): Promise<UserOutput> {
    const user = await this.repository.find({
      where: [
        { username },
        { email: username },
        { identificationNo: username },
      ],
    });
    if (user.length === 0) throw new UnauthorizedException();
    let match = false;
    let userFound: User;
    for (let i = 0; i < user.length && !match; i++) {
      match = await compare(pass, user[i].password);
      if (match) userFound = user[i];
    }
    if (!match || !userFound) throw new UnauthorizedException();
    return plainToInstance(UserOutput, userFound, {
      excludeExtraneousValues: true,
    });
  }

  async getUsers(
    ctx: RequestContext,
    limit: number,
  ): Promise<{ users: UserOutput[]; count: number }> {
    const [users, count] = await this.repository.findAndCount({
      where: {},
      take: limit,
    });

    const usersOutput = plainToInstance(UserOutput, users, {
      excludeExtraneousValues: true,
    });

    return { users: usersOutput, count };
  }

  async getByContext(ctx: RequestContext): Promise<UserOutput> {
    const user = await this.getUserById(ctx, ctx.user.id);
    return user;
  }

  async findById(ctx: RequestContext, id: number): Promise<UserOutput> {
    const user = await this.repository.findOne({ where: { id } });
    return plainToInstance(UserOutput, user, {
      excludeExtraneousValues: true,
    });
  }

  async getUserById(ctx: RequestContext, id: number): Promise<UserOutput> {
    const user = await this.repository.findOneOrFail({
      where: { id },
      relations: ['divisi', 'bagian'],
    });
    return plainToInstance(UserOutput, user);
  }

  async findByUsername(
    ctx: RequestContext,
    username: string,
  ): Promise<UserOutput> {
    const user = await this.repository.findOne({ where: { username } });
    return plainToInstance(UserOutput, user, {
      excludeExtraneousValues: true,
    });
  }

  async findByIdentificationNumber(
    identificationNo: string,
  ): Promise<UserOutput> {
    const user = await this.repository.findOne({ where: { identificationNo } });
    if (!user) throw new UnauthorizedException();
    return plainToInstance(UserOutput, user, {
      excludeExtraneousValues: true,
    });
  }

  async updateUser(
    ctx: RequestContext,
    input: UserEditBody,
  ): Promise<UserOutput> {
    const loggedInUser = await this.repository.getById(ctx.user.id);
    if (loggedInUser.isSuperAdmin || loggedInUser.id === input.id) {
      const user = await this.repository.getById(input.id);
      // merges the input (2nd line) to the found user (1st line)
      const updatedUser: User = {
        ...user,
        ...plainToInstance(User, input),
      };
      await this.repository.save(updatedUser);

      return plainToInstance(UserOutput, updatedUser);
    } else {
      throw new UnauthorizedException();
    }
  }

  async editPassword(
    ctx: RequestContext,
    input: UserEditPasswordBody,
  ): Promise<void> {
    const user = await this.repository.getById(ctx.user.id);
    input.password = await hash(input.password, 10);
    user.password = input.password;
    await this.repository.save(user);
  }

  public async grantSuperAdminToUser(
    ctx: RequestContext,
    ids: number[],
  ): Promise<void> {
    const user = await this.getByContext(ctx);
    if (user.isSuperAdmin) {
      const users = await this.repository.find({ where: { id: In(ids) } });
      if (users.length > 0) {
        users.forEach((u) => {
          u.isSuperAdmin = true;
        });
        await this.repository.save(users);
      } else {
        throw new BadRequestException();
      }
    } else {
      throw new UnauthorizedException();
    }
  }

  public async revokeSuperAdminFromUser(
    ctx: RequestContext,
    ids: number[],
  ): Promise<void> {
    const user = await this.getByContext(ctx);
    if (user.isSuperAdmin) {
      const users = await this.repository.find({ where: { id: In(ids) } });
      if (users.length > 0) {
        users.forEach((u) => {
          u.isSuperAdmin = false;
        });
        await this.repository.save(users);
      } else {
        throw new BadRequestException();
      }
    } else {
      throw new UnauthorizedException();
    }
  }

  public async checkIsSuperAdmin(id: number): Promise<boolean> {
    return await this.repository.checkIsSuperAdmin(id);
  }

  public async generateWATokenForUser(id: number): Promise<AuthTokenOutput> {
    const user = await this.repository.findOneOrFail({
      where: { id },
      select: {
        id: true,
        identificationNo: true,
        isSuperAdmin: true,
        permittedClients: { id: true },
      },
      relations: {
        permittedClients: true,
      },
    });
    const clientIds = user.permittedClients.map((c) => c.id);
    return this.generateTokenWorker({
      id: user.id,
      identificationNo: user.identificationNo,
      clientIds,
      isSuperAdmin: user.isSuperAdmin,
    });
  }

  private generateTokenWorker(input: {
    id: number;
    identificationNo: string;
    clientIds: number[];
    isSuperAdmin: boolean;
  }): AuthTokenOutput {
    const subject = { sub: input.id };
    const payload = {
      username: input.identificationNo,
      sub: input.id,
      other: input.clientIds,
      type: 'wa-user',
      terumbuKarang: input.isSuperAdmin,
    };

    console.log(payload);
    const authToken = {
      refreshToken: '',
      accessToken: this.signService.signPayload({ ...payload, ...subject }),
    };
    return authToken;
  }
}
