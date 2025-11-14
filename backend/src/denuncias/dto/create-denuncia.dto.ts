import { IsString, IsOptional } from 'class-validator';

export class CreateDenunciaDto {
  @IsString()
  tutorId: string;

  @IsString()
  motivo: string;

  @IsString()
  @IsOptional()
  descricao?: string;
}
