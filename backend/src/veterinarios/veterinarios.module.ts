import { Module } from '@nestjs/common';
import { VeterinariosService } from './veterinarios.service';
import { VeterinariosController } from './veterinarios.controller';

@Module({
  controllers: [VeterinariosController],
  providers: [VeterinariosService],
  exports: [VeterinariosService],
})
export class VeterinariosModule {}
