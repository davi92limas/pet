import { IsString, IsOptional } from 'class-validator';

export class CreateAdocaoDto {
  @IsString()
  animalId: string;

  @IsString()
  @IsOptional()
  observacoes?: string;
}
