import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import {ApiPropertyOptional} from '@nestjs/swagger';

export class GetCommentsDto {
  @ApiPropertyOptional({
    description: 'Номер страницы.',
    type: Number,
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number;

  @ApiPropertyOptional({
    description: 'Поле сортировки комментариев.',
    enum: ['username', 'email', 'createdAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['username', 'email', 'createdAt'])
  sortBy: 'username' | 'email' | 'createdAt' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Направление сортировки.',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC' = 'DESC';
}
