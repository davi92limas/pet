import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateCirurgiaDto {
  @IsDateString()
  data: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  animalId: string;

  @IsString()
  veterinarioId: string;
}
