
import {
  Controller,
  Get,
} from '@nestjs/common';

import { CaptchaService } from './captcha.service.js';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('CAPTCHA')
@Controller('captcha')
export class CaptchaController {

  constructor(
    private readonly captchaService: CaptchaService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Сгенерировать CAPTCHA',
    description:
      'Создаёт CAPTCHA с шестью символами. Изображение возвращается в формате Base64.',
  })
  @ApiResponse({
    status: 200,
    description: 'CAPTCHA успешно сгенерирована.',
    schema: {
      type: 'object',
      properties: {
        captchaId: {
          type: 'string',
          format: 'uuid',
        },
        image: {
          type: 'string',
          example: 'data:image/svg+xml;base64,...',
        },
      },
    },
  })
  generate() {
    return this.captchaService.generate();
  }
}

