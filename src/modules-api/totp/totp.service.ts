import { BadRequestException, Injectable } from '@nestjs/common';
import { TOTP } from "otplib";
import { NodeCryptoPlugin } from '@otplib/plugin-crypto-node';
import { ScureBase32Plugin } from 'otplib';
import type { Users } from '@prisma/client';
import * as qrcode from "qrcode";
import { saveTotpDto } from './dto/save-dto.dto';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';
import { disableDto } from './dto/disable.dto';

@Injectable()
export class TotpService {
    public totp: TOTP;
    constructor(private prisma: PrismaService){
        this.totp = new TOTP({
            crypto: new NodeCryptoPlugin(),
            base32: new ScureBase32Plugin()
        });
    }
    async generate(user: Users){
        if (user.totpSecret) throw new BadRequestException("User had a totpSecret");

        const secret = this.totp.generateSecret();

        const uri = this.totp.toURI({
            label: user.email || "",
            secret: secret,
            issuer: 'NODE_54'
        })

        const qrCode = await qrcode.toDataURL(uri);

        console.log({secret});
        return {secret, qrCode}
    }
    async save(user: Users, body: saveTotpDto){
        if (user.totpSecret) throw new BadRequestException("User had a toptsecret");

        const {valid} = await this.totp.verify(body.token, {secret: body.secret});
        if (!valid) throw new BadRequestException("Verify totp failed");

        await this.prisma.users.update({
            where: {
                id: user.id
            },
            data: {
                totpSecret: body.secret
            }
        })
        return true;
    }

    
    async disable(user: Users, body: disableDto){
        if (!user.totpSecret){
            throw new BadRequestException("User did not have totpSecret");
        }

        const {valid} = await this.totp.verify(body.token, {secret: user.totpSecret});
        if (!valid) throw new BadRequestException("token is invalid");

        await this.prisma.users.update({
            where: {
                id: user.id
            },
            data: {
                totpSecret: null
            }
        });

        return true;
    }
}
