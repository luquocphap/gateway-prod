import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { PrismaService } from "src/modules-system/prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { TokenService } from "src/modules-system/token/token.service";
import { Request } from "express";
import { TotpService } from "../totp/totp.service";

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private tokenService : TokenService, private totpService: TotpService) {}

    async login(body: LoginDto) {
        // nhận dữ liệu
    const { email, password, token } = body;

    // kiểm tra email xem tồn tại chưa
    // nếu chưa tồn tại => từ chối, kêu người dùng đăng ký
    // nếu mà tồn tại => đi xử lý tiếp
    const userExist = await this.prisma.users.findUnique({
      where: {
        email: email,
      },
      omit: {
        password: false,
      },
    });

    if (!userExist) {
      // throw new BadRequestException("Account Invalid.");
      throw new BadRequestException('Người chưa tồn tại, vui lòng đăng ký');
    }

    if (userExist.totpSecret){
      if (token){
        const {valid} = await this.totpService.totp.verify(token, {secret: userExist.totpSecret});
        if (!valid) throw new BadRequestException("Token is Invalid")
      } else {
        return { isTotp: true }
      }
    }

    const isPassword = bcrypt.compareSync(password, userExist.password); // true

    if (!isPassword) {
      // throw new BadRequestException("Account Invalid..");
      throw new BadRequestException('Mật khẩu khống chính xác');
    }

    const accessToken = this.tokenService.createAccessToken(userExist.id);
    const refreshToken = this.tokenService.createRefreshToken(userExist.id);

    // console.log({ email, password, userExist, isPassword });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async refreshToken(req: Request){
    const { accessToken, refreshToken } = req.cookies;
        if (!accessToken) {
            throw new UnauthorizedException("No Access Token")
        }
    
        if (!refreshToken){
            throw new UnauthorizedException("No Refresh Token")
        }
    
        
        const decodeAccessToken: any = this.tokenService.verifyAccessToken(accessToken, { ignoreExpiration: true });
        const decodeRefreshToken: any = this.tokenService.verifyRefreshToken(refreshToken);

    
        if (decodeAccessToken.userId !== decodeRefreshToken.userId){
            throw new UnauthorizedException("Invalid Token")
        }
    
    
        const userExists = await this.prisma.users.findUnique({
            where: {
                id: decodeAccessToken.userId
            }
        });

        if (!userExists) throw new UnauthorizedException("User does not exist")

        const newAccessToken = this.tokenService.createAccessToken(userExists.id);
        const newRefreshToken = this.tokenService.createRefreshToken(userExists.id);
    
    
        console.log({ accessToken, refreshToken, decodeAccessToken, decodeRefreshToken })
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        }
  }
}