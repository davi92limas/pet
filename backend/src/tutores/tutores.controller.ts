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
import { TutoresService } from './tutores.service';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('tutores')
@UseGuards(JwtAuthGuard)
@ApiTags('Tutores')
@ApiBearerAuth('access-token')
export class TutoresController {
  constructor(private readonly tutoresService: TutoresService) {}

  @Post()
  @ApiOperation({
    summary: 'Cria o perfil de tutor para o usuário autenticado',
  })
  create(@CurrentUser() user: any, @Body() createTutorDto: CreateTutorDto) {
    return this.tutoresService.create(user.userId, createTutorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os tutores' })
  findAll() {
    return this.tutoresService.findAll();
  }

  @Get('meu-perfil')
  @ApiOperation({
    summary: 'Recupera o perfil de tutor do usuário autenticado',
  })
  findByUser(@CurrentUser() user: any) {
    return this.tutoresService.findByUser(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de um tutor específico' })
  findOne(@Param('id') id: string) {
    return this.tutoresService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza dados de um tutor' })
  update(@Param('id') id: string, @Body() updateTutorDto: UpdateTutorDto) {
    return this.tutoresService.update(id, updateTutorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um tutor' })
  remove(@Param('id') id: string) {
    return this.tutoresService.remove(id);
  }
}
