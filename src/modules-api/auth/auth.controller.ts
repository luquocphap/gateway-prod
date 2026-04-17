import { Body, Controller, Post, Res, Get, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import type { Request, Response } from "express";
import { Public } from "src/common/decorators/public.decorator";
import { User } from "src/common/decorators/user.decorator";
import { Role } from "src/common/decorators/role.decorator";

// class BodyDto {
//     email: string;
//     password: string;
// }

@Controller("auth")
export class AuthController {
    constructor(private authService : AuthService) {}

    @Post("login")
    @Public()
    @Role("ADMIN") 
    async login(
        @Body()
        body: LoginDto,
        @Res({ passthrough: true })
        res: Response
    ){
        const result = await this.authService.login(body);

        if (result?.isTotp){
            console.log(123);
            return { isTotp: true };
        }
        res.cookie("accessToken", result.accessToken);
        res.cookie("refreshToken", result.refreshToken);
        return true;
    }

    @Get("get-info")
    getInfo(@User() user) {
        if (user.totpSecret){
            user.isTotp = true
        }

        delete user.password;
        delete user.totpSecret;
        return user;
    }

    @Post('refresh-token')
    @Public()
    async refreshToken(@Req() req: Request, @Res() res: Response){
        const result = await this.authService.refreshToken(req);
        res.cookie("accessToken", result.accessToken);
        res.cookie("refreshToken", result.refreshToken);
        res.json({result});
    }
}