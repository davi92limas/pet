import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateConsultaDto {
  @IsDateString()
  data: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  animalId: string;

  @IsString()
  veterinarioId: string;

  @IsString()
  @IsOptional()
  tutorId?: string;
}
