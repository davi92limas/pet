import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { DenunciasService } from './denuncias.service';
import { CreateDenunciaDto } from './dto/create-denuncia.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('denuncias')
@UseGuards(JwtAuthGuard)
@ApiTags('Denúncias')
@ApiBearerAuth('access-token')
export class DenunciasController {
  constructor(private readonly denunciasService: DenunciasService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma denúncia contra um tutor' })
  create(
    @CurrentUser() user: any,
    @Body() createDenunciaDto: CreateDenunciaDto,
  ) {
    return this.denunciasService.create(user.userId, createDenunciaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as denúncias' })
  findAll() {
    return this.denunciasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de uma denúncia específica' })
  findOne(@Param('id') id: string) {
    return this.denunciasService.findOne(id);
  }

  @Patch(':id/analisar')
  @ApiOperation({ summary: 'Marca denúncia como em análise' })
  analisar(@Param('id') id: string) {
    return this.denunciasService.updateStatus(id, 'ANALISANDO');
  }

  @Patch(':id/resolver')
  @ApiOperation({ summary: 'Marca denúncia como resolvida' })
  resolver(@Param('id') id: string) {
    return this.denunciasService.updateStatus(id, 'RESOLVIDA');
  }

  @Patch(':id/descartar')
  @ApiOperation({ summary: 'Descarta uma denúncia' })
  descartar(@Param('id') id: string) {
    return this.denunciasService.updateStatus(id, 'DESCARTADA');
  }
}
