import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/services/user.service';

// FIXME : fix this like eberkas!
@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();
    return await this.userService.checkIsSuperAdmin(user.id);
  }
}
