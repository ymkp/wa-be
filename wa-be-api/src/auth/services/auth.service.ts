import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { EmailService } from 'src/shared/email';
import { compare, hash } from 'bcrypt';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import { UserOutput } from '../../user/dtos/user-output.dto';
import { UserService } from '../../user/services/user.service';
import { RegisterInput } from '../dtos/auth-register-input.dto';
import { RegisterOutput } from '../dtos/auth-register-output.dto';
import {
  AuthTokenOutput,
  UserAccessTokenClaims,
} from '../dtos/auth-token-output.dto';
import { SSOService } from 'src/user/services/sso.service';

import { JwtSigningService } from 'src/shared/signing/jwt-signing.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly signService: JwtSigningService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly ssoService: SSOService,
  ) {}

  async testEMAIL(email: string): Promise<void> {
    await this.sendPasswordEmail(email, 'wew');
  }

  async grantSuperAdminToUser(
    ctx: RequestContext,
    ids: number[],
  ): Promise<void> {
    await this.userService.grantSuperAdminToUser(ctx, ids);
  }

  async revokeSuperAdminFromUser(
    ctx: RequestContext,
    ids: number[],
  ): Promise<void> {
    await this.userService.revokeSuperAdminFromUser(ctx, ids);
  }

  async validateUser(
    ctx: RequestContext,
    username: string,
    password: string,
  ): Promise<UserAccessTokenClaims> {
    const user = await this.userService.validateUsernamePassword(
      username,
      password,
    );

    // Prevent disabled users from logging in.
    if (user.isAccountDisabled) {
      throw new UnauthorizedException('This user account has been disabled');
    }

    return user;
  }

  login(ctx: RequestContext): AuthTokenOutput {
    return this.getAuthToken(ctx.user);
  }

  async logout(ctx: RequestContext): Promise<void> {
    // TODO : implement logout
  }

  async register(
    ctx: RequestContext,
    input: RegisterInput,
  ): Promise<RegisterOutput> {
    console.log(ctx.user);
    if (!ctx.user.isSuperAdmin) throw new UnauthorizedException();
    input.isAccountDisabled = false;
    if (!input.password) {
      input.password = await this.createRandomPassword(input.email);
    }
    const registeredUser = await this.userService.createUser(ctx, input);
    await this.sendSetPasswordEmail(input.email);

    return plainToInstance(RegisterOutput, registeredUser, {
      excludeExtraneousValues: true,
    });
  }

  async refreshToken(ctx: RequestContext): Promise<AuthTokenOutput> {
    const user = await this.userService.findById(ctx, ctx.user.id);
    if (!user) {
      throw new UnauthorizedException('Invalid user id');
    }

    return this.getAuthToken(user);
  }

  getAuthToken(user: UserAccessTokenClaims): AuthTokenOutput {
    const subject = { sub: user.id, isSuperAdmin: user.isSuperAdmin };
    const payload = {
      sub: user.id,
      isSuperAdmin: user.isSuperAdmin,
    };
    const authToken = {
      refreshToken: this.signService.signPayload(subject, {
        expiresIn: this.configService.get('jwt.refreshTokenExpiresInSec'),
      }),
      accessToken: this.signService.signPayload(
        { ...payload, ...subject },
        {
          expiresIn: this.configService.get('jwt.accessTokenExpiresInSec'),
        },
      ),
    };
    return plainToInstance(AuthTokenOutput, authToken, {
      excludeExtraneousValues: true,
    });
  }

  public async generateSSOToken(
    identificationNo: string,
  ): Promise<{ data: string; url: string }> {
    const user = await this.userService.findByIdentificationNumber(
      identificationNo,
    );
    const expiresIn =
      this.configService.get('jwt.refreshTokenExpiresInSec') / 10;
    const subject = { sub: user.username };
    let ssoToken = this.signService.signPayload(subject, {
      expiresIn,
    });
    const tokenToSave = await hash(ssoToken, 10);
    await this.ssoService.saveSSOToken(tokenToSave, user.id, expiresIn);
    return {
      data: ssoToken,
      url: this.configService.get('ssoLoginURL') + ssoToken,
    };
  }

  public async useSSOToken(
    ctx: RequestContext,
    ssoToken: string,
  ): Promise<AuthTokenOutput> {
    const user = await this.userService.findByUsername(
      ctx,
      ctx.user.id.toString(),
    );
    await this.ssoService.useSSOToken(user.id, ssoToken);
    return this.getAuthToken(user);
  }

  private async sendPasswordEmail(
    email: string,
    password: string,
  ): Promise<void> {
    await this.emailService.sendMailWithText({
      to: email,
      subject: 'Akun E-BERKAS terbuat',
      cta: password,
      link: '',
      subtitle: 'Password anda di bawah ini',
      title: 'Akun E-BERKAS terbuat',
    });
  }

  private async sendSetPasswordEmail(email: string): Promise<void> {
    try {
      const payload = { email };
      const token = this.signService.signPayload(payload, {
        expiresIn: this.configService.get('jwt.refreshTokenExpiresInSec'),
      });
      const forgotPasswordURL = this.configService.get(
        'email.forgotPasswordURL',
      );
      const url = `${forgotPasswordURL}/${token}`;
      await this.emailService.sendMailCTA({
        to: email,
        subject: 'Set Password',
        cta: url,
        link: url,
        subtitle: 'Set Password Anda dengan menekan tombol di bawah',
        title: 'Set Password Anda',
      });
    } catch (err) {
      console.log('EMAIL FAILED ! : ', err);
    }
  }

  private async sendForgetPasswordEmail(email: string): Promise<void> {
    try {
      const user = await this.userService.getUserByEmail(email);
      const payload = { email };
      const token = this.signService.signPayload(payload, {
        expiresIn: this.configService.get('jwt.refreshTokenExpiresInSec'),
      });
      const forgotPasswordURL = this.configService.get(
        'email.forgotPasswordURL',
      );
      const url = `${forgotPasswordURL}/${token}`;
      await this.emailService.sendMailCTA({
        to: email,
        subject: 'Lupa Password',
        cta: url,
        link: url,
        subtitle: 'Ubah Password Anda dengan menekan tombol di bawah',
        title: 'Ubah Password Anda',
      });
    } catch (err) {
      console.log('failed to send email : ', err);
    }
  }

  async requestForgetPassword(email: string): Promise<void> {
    await this.sendForgetPasswordEmail(email);
  }

  public async checkAndProcessWAPublicToken(id: number) {
    return true;
  }

  private async createRandomPassword(email: string): Promise<string> {
    // TODO : create random string 10 password
    // TODO : create email service, and send the password to email
    return Array(10)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
  }

  public async decodeConfirmationToken(token: string) {
    try {
      const payload = await this.signService.verifyToken(token, {});
      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }
      throw new BadRequestException('Bad confirmation token');
    }
  }

  public async changeForgottenPassword(email: string, password: string) {
    const user = await this.userService.getUserByEmail(email);
    await this.userService.editPassword(
      {
        ip: '',
        requestID: '',
        url: '',
        user: {
          id: user.id,
          username: '',
          other: '',
        },
      },
      { password },
    );
  }
}
