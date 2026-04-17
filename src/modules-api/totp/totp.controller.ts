import { Body, Controller, Post } from '@nestjs/common';
import { TotpService } from './totp.service';
import type { Users } from '@prisma/client';
import { User } from 'src/common/decorators/user.decorator';
import { saveTotpDto } from './dto/save-dto.dto';
import { disableDto } from './dto/disable.dto';

@Controller('totp')
export class TotpController {
  constructor(private readonly totpService: TotpService) {}

  // generate tạo ra secret => QR => Frontend
  @Post("generate")
  generate(@User() user: Users){
    return this.totpService.generate(user);
  }

  // Save secret
  @Post("save")
  save(@User() user: Users, @Body() body: saveTotpDto){
    return this.totpService.save(user, body);
  }

  // delete secret
  @Post("disable")
  disable(@User() user: Users, @Body() body: disableDto){
    return this.totpService.disable(user, body);
  }
}
