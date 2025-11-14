import { IsString, IsOptional } from 'class-validator';

export class CreateVeterinarioDto {
  @IsString()
  nome: string;

  @IsString()
  crmv: string;

  @IsString()
  cidadeId: string;

  @IsString()
  telefone: string;

  @IsString()
  @IsOptional()
  especialidade?: string;
}
