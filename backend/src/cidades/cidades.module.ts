import { Module } from '@nestjs/common';
import { CidadesService } from './cidades.service';
import { CidadesController } from './cidades.controller';

@Module({
  controllers: [CidadesController],
  providers: [CidadesService],
  exports: [CidadesService],
})
export class CidadesModule {}
