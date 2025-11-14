import { IsString, IsOptional, IsInt, IsNumber, IsEnum } from 'class-validator';
import { AnimalStatus } from '@prisma/client';

export class CreateAnimalDto {
  @IsString()
  nome: string;

  @IsString()
  especie: string;

  @IsString()
  @IsOptional()
  raca?: string;

  @IsInt()
  @IsOptional()
  idade?: number;

  @IsNumber()
  @IsOptional()
  peso?: number;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsEnum(AnimalStatus)
  @IsOptional()
  status?: AnimalStatus;

  @IsString()
  @IsOptional()
  foto?: string;

  @IsString()
  @IsOptional()
  tutorId?: string;

  @IsString()
  @IsOptional()
  instituicaoId?: string;
}
