
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';
import { TokenService } from 'src/modules-system/token/token.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
@Injectable()
export class ProtectGuard implements CanActivate {

    constructor (
        private tokenService: TokenService, 
        private prisma: PrismaService,
        private reflector: Reflector
    ) {}
  async canActivate(context: ExecutionContext):  Promise<boolean> {
    try{
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
        ]);

        if (isPublic) {
        // 💡 See this condition
        return true;
        }

        const req = context.switchToHttp().getRequest();
        
        const { accessToken } = req.cookies;
        if (!accessToken) {
        throw new UnauthorizedException('Không có token');
        }

        // kiểm tra token
        const decode = this.tokenService.verifyAccessToken(accessToken);

        // kiểm tra người dùng có trong db hay không
        const userExits = await this.prisma.users.findUnique({
        where: {
            id: (decode as any).userId,
        },
        });

        if (!userExits) {
        throw new UnauthorizedException('Người dùng không tồn tại');
        }

        req.user = userExits;
        console.log('ProtectGuard', { cookies: req.cookies });
        return true;
    } catch (error) {
        console.log({error});
        switch (error.constructor){
            case TokenExpiredError:
                throw new ForbiddenException(error.message);
                break;
            default:
                throw new UnauthorizedException();
        }
    }
    
  }
}
