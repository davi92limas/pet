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
import { AnimaisService } from './animais.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('animais')
@UseGuards(JwtAuthGuard)
@ApiTags('Animais')
@ApiBearerAuth('access-token')
export class AnimaisController {
  constructor(private readonly animaisService: AnimaisService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo animal' })
  create(@Body() createAnimalDto: CreateAnimalDto) {
    return this.animaisService.create(createAnimalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os animais' })
  findAll() {
    return this.animaisService.findAll();
  }

  @Get('disponiveis')
  @ApiOperation({ summary: 'Lista animais disponíveis para adoção' })
  findDisponiveis() {
    return this.animaisService.findDisponiveis();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um animal pelo ID' })
  findOne(@Param('id') id: string) {
    return this.animaisService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de um animal' })
  update(@Param('id') id: string, @Body() updateAnimalDto: UpdateAnimalDto) {
    return this.animaisService.update(id, updateAnimalDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um animal' })
  remove(@Param('id') id: string) {
    return this.animaisService.remove(id);
  }
}
