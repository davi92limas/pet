import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCidadeDto } from './dto/create-cidade.dto';
import { UpdateCidadeDto } from './dto/update-cidade.dto';

@Injectable()
export class CidadesService {
  constructor(private prisma: PrismaService) {}

  async create(createCidadeDto: CreateCidadeDto) {
    return this.prisma.cidade.create({
      data: createCidadeDto,
    });
  }

  async findAll() {
    return this.prisma.cidade.findMany({
      include: {
        _count: {
          select: {
            tutores: true,
            veterinarios: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const cidade = await this.prisma.cidade.findUnique({
      where: { id },
      include: {
        tutores: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        veterinarios: true,
      },
    });

    if (!cidade) {
      throw new NotFoundException('Cidade não encontrada');
    }

    return cidade;
  }

  async update(id: string, updateCidadeDto: UpdateCidadeDto) {
    await this.findOne(id);

    // Regra de negócio 7: Não pode editar uma cidade vinculada ao tutor e veterinário
    const tutores = await this.prisma.tutor.findMany({
      where: { cidadeId: id },
    });

    const veterinarios = await this.prisma.veterinario.findMany({
      where: { cidadeId: id },
    });

    if (tutores.length > 0 || veterinarios.length > 0) {
      throw new BadRequestException(
        'Não é possível editar cidade que possui tutores ou veterinários vinculados',
      );
    }

    return this.prisma.cidade.update({
      where: { id },
      data: updateCidadeDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Regra de negócio 3: Não deletar cidade se estiver vinculado a tutor ou veterinário
    const tutores = await this.prisma.tutor.findMany({
      where: { cidadeId: id },
    });

    const veterinarios = await this.prisma.veterinario.findMany({
      where: { cidadeId: id },
    });

    if (tutores.length > 0 || veterinarios.length > 0) {
      throw new BadRequestException(
        'Não é possível deletar cidade que possui tutores ou veterinários vinculados',
      );
    }

    return this.prisma.cidade.delete({
      where: { id },
    });
  }
}
