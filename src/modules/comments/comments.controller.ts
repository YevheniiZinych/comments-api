import { Controller, Get, Post, Body, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CommentsService } from './comments.service.js';

import { CreateCommentDto } from './dto/create-comment.dto.js';
import { GetCommentsDto } from './dto/get-comments.dto.js';

import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // Получение списка комментариев
  @Get()
  @ApiOperation({
    summary: 'Получить список комментариев',
    description:
      'Возвращает корневые комментарии с вложенными ответами. Поддерживает пагинацию и сортировку.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Номер страницы.',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['username', 'email', 'createdAt'],
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['ASC', 'DESC'],
  })
  @ApiResponse({
    status: 200,
    description: 'Список комментариев успешно получен.',
  })
  findAll(@Query() query: GetCommentsDto) {
    return this.commentsService.findAll(query);
  }

  // Создание комментария
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Создать комментарий или ответ',
    description:
      'Создаёт комментарий или вложенный ответ. CAPTCHA обязательна. Файл необязателен.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'username',
        'email',
        'text',
        'captchaId',
        'captchaText',
      ],
      properties: {
        username: { type: 'string', example: 'John123' },
        email: { type: 'string', example: 'john@example.com' },
        homepage: {
          type: 'string',
          example: 'https://example.com',
        },
        text: {
          type: 'string',
          example: 'Hello! <strong>Nice website!</strong>',
        },
        parentId: {
          type: 'string',
          format: 'uuid',
          nullable: true,
        },
        captchaId: {
          type: 'string',
          format: 'uuid',
        },
        captchaText: {
          type: 'string',
          example: 'ABC123',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Необязательное вложение JPG, PNG, GIF или TXT.',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Комментарий успешно создан.',
  })
  @ApiResponse({
    status: 400,
    description: 'Ошибка валидации, CAPTCHA или HTML-разметки.',
  })
  @ApiResponse({
    status: 404,
    description: 'Родительский комментарий не найден.',
  })
  create(@Body() dto: CreateCommentDto, @UploadedFile() file?: Express.Multer.File) {
    return this.commentsService.create(dto, file);
  }
}
