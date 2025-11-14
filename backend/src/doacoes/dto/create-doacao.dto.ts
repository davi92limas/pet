import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateDoacaoDto {
  @IsString()
  instituicaoId: string;

  @IsString()
  item: string;

  @IsInt()
  quantidade: number;

  @IsString()
  @IsOptional()
  descricao?: string;
}
