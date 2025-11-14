import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AdocoesService } from './adocoes.service';
import { CreateAdocaoDto } from './dto/create-adocao.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('adocoes')
@UseGuards(JwtAuthGuard)
@ApiTags('Adoções')
@ApiBearerAuth('access-token')
export class AdocoesController {
  constructor(private readonly adocoesService: AdocoesService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma solicitação de adoção' })
  create(@CurrentUser() user: any, @Body() createAdocaoDto: CreateAdocaoDto) {
    return this.adocoesService.create(user.userId, createAdocaoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as adoções (admin)' })
  findAll() {
    return this.adocoesService.findAll();
  }

  @Get('minhas')
  @ApiOperation({
    summary: 'Lista solicitações de adoção do usuário autenticado',
  })
  findByUser(@CurrentUser() user: any) {
    return this.adocoesService.findByUser(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de uma adoção específica' })
  findOne(@Param('id') id: string) {
    return this.adocoesService.findOne(id);
  }

  @Patch(':id/aprovar')
  @ApiOperation({ summary: 'Aprova uma adoção' })
  aprovar(@Param('id') id: string) {
    return this.adocoesService.updateStatus(id, 'APROVADA');
  }

  @Patch(':id/rejeitar')
  @ApiOperation({ summary: 'Rejeita uma adoção' })
  rejeitar(@Param('id') id: string) {
    return this.adocoesService.updateStatus(id, 'REJEITADA');
  }

  @Patch(':id/concluir')
  @ApiOperation({ summary: 'Conclui uma adoção' })
  concluir(@Param('id') id: string) {
    return this.adocoesService.updateStatus(id, 'CONCLUIDA');
  }
}
