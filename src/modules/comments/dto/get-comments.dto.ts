import { Type } from 'class-transformer';

import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class GetCommentsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @IsIn(['username', 'email', 'createdAt'])
  sortBy: 'username' | 'email' | 'createdAt' = 'createdAt';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC' = 'DESC';
}
