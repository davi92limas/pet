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
import { VeterinariosService } from './veterinarios.service';
import { CreateVeterinarioDto } from './dto/create-veterinario.dto';
import { UpdateVeterinarioDto } from './dto/update-veterinario.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('veterinarios')
@UseGuards(JwtAuthGuard)
@ApiTags('Veterinários')
@ApiBearerAuth('access-token')
export class VeterinariosController {
  constructor(private readonly veterinariosService: VeterinariosService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um novo veterinário' })
  create(@Body() createVeterinarioDto: CreateVeterinarioDto) {
    return this.veterinariosService.create(createVeterinarioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os veterinários' })
  findAll() {
    return this.veterinariosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de um veterinário específico' })
  findOne(@Param('id') id: string) {
    return this.veterinariosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza dados de um veterinário' })
  update(
    @Param('id') id: string,
    @Body() updateVeterinarioDto: UpdateVeterinarioDto,
  ) {
    return this.veterinariosService.update(id, updateVeterinarioDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um veterinário' })
  remove(@Param('id') id: string) {
    return this.veterinariosService.remove(id);
  }
}
