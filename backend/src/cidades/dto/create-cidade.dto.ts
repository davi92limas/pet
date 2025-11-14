import { IsString } from 'class-validator';

export class CreateCidadeDto {
  @IsString()
  nome: string;

  @IsString()
  estado: string;
}
