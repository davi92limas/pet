import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CidadesService } from './cidades.service';
import { CreateCidadeDto } from './dto/create-cidade.dto';
import { UpdateCidadeDto } from './dto/update-cidade.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('cidades')
@UseGuards(JwtAuthGuard)
@ApiTags('Cidades')
@ApiBearerAuth('access-token')
export class CidadesController {
  constructor(private readonly cidadesService: CidadesService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova cidade' })
  create(@Body() createCidadeDto: CreateCidadeDto) {
    return this.cidadesService.create(createCidadeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as cidades cadastradas' })
  findAll() {
    return this.cidadesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de uma cidade específica' })
  findOne(@Param('id') id: string) {
    return this.cidadesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza dados de uma cidade' })
  update(@Param('id') id: string, @Body() updateCidadeDto: UpdateCidadeDto) {
    return this.cidadesService.update(id, updateCidadeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma cidade' })
  remove(@Param('id') id: string) {
    return this.cidadesService.remove(id);
  }
}
