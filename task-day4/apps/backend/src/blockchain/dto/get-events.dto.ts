import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min, IsDefined, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class GetEventsDto {
  @ApiProperty({ example: 50489500 })
  @Type(() => Number)
  @IsDefined()
  @IsInt()
  @Min(0)
  fromBlock: number;

  @ApiProperty({ example: 50489600 })
  @Type(() => Number)
  @IsDefined()
  @IsInt()
  @Min(0)
  toBlock: number;

  @ApiPropertyOptional({ example: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ example: 10 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Return raw logs and decoded fields',
  })
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  raw?: boolean;
}
