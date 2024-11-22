import { Controller, HttpCode, Req } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { Request } from 'express';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('csrf')
export class CsrfController {
  // csrf token
  @HttpCode(200)
  @Public()
  @Get('token')
  async csrfToken(@Req() req: Request) {
    const csrfToken = req.csrfToken();
    return { csrfToken };
  }
}
