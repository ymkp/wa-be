import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/services/user.service';

@Injectable()
export class ModeratorGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();
    const userAccount = await this.userService.getUserById(null, user.id);
    if (userAccount.divisiModeratorId || userAccount.isSuperAdmin) {
      return true;
    }

    throw new UnauthorizedException(
      `Only user with moderator access have access to this route`,
    );
  }
}
