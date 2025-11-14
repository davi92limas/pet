import { IsString } from 'class-validator';

export class CreateTutorDto {
  @IsString()
  cidadeId: string;

  @IsString()
  telefone: string;

  @IsString()
  endereco: string;
}
