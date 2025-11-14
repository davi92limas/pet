import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ConsultasService } from './consultas.service';
import { CreateConsultaDto } from './dto/create-consulta.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('consultas')
@UseGuards(JwtAuthGuard)
@ApiTags('Consultas')
@ApiBearerAuth('access-token')
export class ConsultasController {
  constructor(private readonly consultasService: ConsultasService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova consulta veterinária' })
  create(@Body() createConsultaDto: CreateConsultaDto) {
    return this.consultasService.create(createConsultaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as consultas' })
  findAll() {
    return this.consultasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de uma consulta específica' })
  findOne(@Param('id') id: string) {
    return this.consultasService.findOne(id);
  }
}
