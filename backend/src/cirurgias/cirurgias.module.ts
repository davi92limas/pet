import { Module } from '@nestjs/common';
import { CirurgiasService } from './cirurgias.service';
import { CirurgiasController } from './cirurgias.controller';

@Module({
  controllers: [CirurgiasController],
  providers: [CirurgiasService],
  exports: [CirurgiasService],
})
export class CirurgiasModule {}
