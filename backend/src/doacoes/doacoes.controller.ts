import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { DoacoesService } from './doacoes.service';
import { CreateDoacaoDto } from './dto/create-doacao.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('doacoes')
@UseGuards(JwtAuthGuard)
@ApiTags('Doações')
@ApiBearerAuth('access-token')
export class DoacoesController {
  constructor(private readonly doacoesService: DoacoesService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma doação para uma instituição' })
  create(@CurrentUser() user: any, @Body() createDoacaoDto: CreateDoacaoDto) {
    return this.doacoesService.create(user.userId, createDoacaoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as doações (admin)' })
  findAll() {
    return this.doacoesService.findAll();
  }

  @Get('minhas')
  @ApiOperation({ summary: 'Lista doações do usuário autenticado' })
  findByUser(@CurrentUser() user: any) {
    return this.doacoesService.findByUser(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de uma doação específica' })
  findOne(@Param('id') id: string) {
    return this.doacoesService.findOne(id);
  }

  @Patch(':id/confirmar')
  @ApiOperation({ summary: 'Confirma uma doação' })
  confirmar(@Param('id') id: string) {
    return this.doacoesService.updateStatus(id, 'CONFIRMADA');
  }

  @Patch(':id/entregue')
  @ApiOperation({ summary: 'Marca doação como entregue' })
  entregue(@Param('id') id: string) {
    return this.doacoesService.updateStatus(id, 'ENTREGUE');
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancela uma doação' })
  cancelar(@Param('id') id: string) {
    return this.doacoesService.updateStatus(id, 'CANCELADA');
  }
}
