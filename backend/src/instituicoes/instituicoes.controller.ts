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
import { InstituicoesService } from './instituicoes.service';
import { CreateInstituicaoDto } from './dto/create-instituicao.dto';
import { UpdateInstituicaoDto } from './dto/update-instituicao.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('instituicoes')
@UseGuards(JwtAuthGuard)
@ApiTags('Instituições')
@ApiBearerAuth('access-token')
export class InstituicoesController {
  constructor(private readonly instituicoesService: InstituicoesService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra uma nova instituição' })
  create(@Body() createInstituicaoDto: CreateInstituicaoDto) {
    return this.instituicoesService.create(createInstituicaoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as instituições' })
  findAll() {
    return this.instituicoesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma instituição pelo ID' })
  findOne(@Param('id') id: string) {
    return this.instituicoesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de uma instituição' })
  update(
    @Param('id') id: string,
    @Body() updateInstituicaoDto: UpdateInstituicaoDto,
  ) {
    return this.instituicoesService.update(id, updateInstituicaoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma instituição' })
  remove(@Param('id') id: string) {
    return this.instituicoesService.remove(id);
  }
}
