import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CirurgiasService } from './cirurgias.service';
import { CreateCirurgiaDto } from './dto/create-cirurgia.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('cirurgias')
@UseGuards(JwtAuthGuard)
@ApiTags('Cirurgias')
@ApiBearerAuth('access-token')
export class CirurgiasController {
  constructor(private readonly cirurgiasService: CirurgiasService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra uma nova cirurgia' })
  create(@Body() createCirurgiaDto: CreateCirurgiaDto) {
    return this.cirurgiasService.create(createCirurgiaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as cirurgias' })
  findAll() {
    return this.cirurgiasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de uma cirurgia específica' })
  findOne(@Param('id') id: string) {
    return this.cirurgiasService.findOne(id);
  }
}
