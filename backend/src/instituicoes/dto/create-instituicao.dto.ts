import { IsString, IsOptional } from 'class-validator';

export class CreateInstituicaoDto {
  @IsString()
  nome: string;

  @IsString()
  cnpj: string;

  @IsString()
  endereco: string;

  @IsString()
  telefone: string;

  @IsString()
  cidade: string;

  @IsString()
  estado: string;

  @IsString()
  @IsOptional()
  descricao?: string;
}
