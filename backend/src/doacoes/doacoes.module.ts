import { Module } from '@nestjs/common';
import { DoacoesService } from './doacoes.service';
import { DoacoesController } from './doacoes.controller';

@Module({
  controllers: [DoacoesController],
  providers: [DoacoesService],
  exports: [DoacoesService],
})
export class DoacoesModule {}
