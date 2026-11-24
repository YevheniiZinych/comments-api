import { Controller, Get, Post, Body, Query } from '@nestjs/common';

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
  create(@Body() dto: CreateCommentDto) {
    return this.commentsService.create(dto);
  }
}
