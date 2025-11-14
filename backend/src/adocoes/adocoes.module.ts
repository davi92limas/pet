import { Module } from '@nestjs/common';
import { AdocoesService } from './adocoes.service';
import { AdocoesController } from './adocoes.controller';

@Module({
  controllers: [AdocoesController],
  providers: [AdocoesService],
  exports: [AdocoesService],
})
export class AdocoesModule {}
