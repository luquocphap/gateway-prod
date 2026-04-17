
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';
import { TokenService } from 'src/modules-system/token/token.service';
import { ROLE_KEY } from '../decorators/role.decorator';
@Injectable()
export class RoleGuard implements CanActivate {

    constructor (
        private tokenService: TokenService, 
        private prisma: PrismaService,
        private reflector: Reflector
    ) {}
  async canActivate(context: ExecutionContext):  Promise<boolean> {
    const role = this.reflector.getAllAndOverride<boolean>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log("RoleGuard", { role })
    return true;
  }
}
