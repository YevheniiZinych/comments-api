import { Controller, Get, Post, Body, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CommentsService } from './comments.service.js';

import { CreateCommentDto } from './dto/create-comment.dto.js';
import { GetCommentsDto } from './dto/get-comments.dto.js';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // Получение списка комментариев
  @Get()
  findAll(@Query() query: GetCommentsDto) {
    return this.commentsService.findAll(query);
  }

  // Создание комментария
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(@Body() dto: CreateCommentDto, @UploadedFile() file?: Express.Multer.File) {
    return this.commentsService.create(dto, file);
  }
}
