import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor() {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();

    if (user.isSuperAdmin) {
      return true;
    }

    throw new UnauthorizedException(
      `Only user with moderator access have access to this route`,
    );
  }
}
