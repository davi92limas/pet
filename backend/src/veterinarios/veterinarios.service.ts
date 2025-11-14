import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVeterinarioDto } from './dto/create-veterinario.dto';
import { UpdateVeterinarioDto } from './dto/update-veterinario.dto';

@Injectable()
export class VeterinariosService {
  constructor(private prisma: PrismaService) {}

  async create(createVeterinarioDto: CreateVeterinarioDto) {
    // Regra de negócio 4: Não cadastrar veterinário sem cidade
    const cidade = await this.prisma.cidade.findUnique({
      where: { id: createVeterinarioDto.cidadeId },
    });

    if (!cidade) {
      throw new NotFoundException('Cidade não encontrada');
    }

    const existing = await this.prisma.veterinario.findUnique({
      where: { crmv: createVeterinarioDto.crmv },
    });

    if (existing) {
      throw new BadRequestException('CRMV já cadastrado');
    }

    return this.prisma.veterinario.create({
      data: createVeterinarioDto,
      include: {
        cidade: true,
      },
    });
  }

  async findAll() {
    return this.prisma.veterinario.findMany({
      include: {
        cidade: true,
        _count: {
          select: {
            consultas: true,
            cirurgias: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const veterinario = await this.prisma.veterinario.findUnique({
      where: { id },
      include: {
        cidade: true,
        consultas: {
          include: {
            animal: true,
          },
        },
        cirurgias: {
          include: {
            animal: true,
          },
        },
      },
    });

    if (!veterinario) {
      throw new NotFoundException('Veterinário não encontrado');
    }

    return veterinario;
  }

  async update(id: string, updateVeterinarioDto: UpdateVeterinarioDto) {
    await this.findOne(id);

    if (updateVeterinarioDto.cidadeId) {
      const cidade = await this.prisma.cidade.findUnique({
        where: { id: updateVeterinarioDto.cidadeId },
      });

      if (!cidade) {
        throw new NotFoundException('Cidade não encontrada');
      }
    }

    if (updateVeterinarioDto.crmv) {
      const existing = await this.prisma.veterinario.findFirst({
        where: {
          crmv: updateVeterinarioDto.crmv,
          NOT: { id },
        },
      });

      if (existing) {
        throw new BadRequestException('CRMV já cadastrado');
      }
    }

    return this.prisma.veterinario.update({
      where: { id },
      data: updateVeterinarioDto,
      include: {
        cidade: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Regra de negócio 2: Não deletar veterinário se tiver vinculado a consulta
    const consultas = await this.prisma.consulta.findMany({
      where: { veterinarioId: id },
    });

    if (consultas.length > 0) {
      throw new BadRequestException(
        'Não é possível deletar veterinário que possui consultas vinculadas',
      );
    }

    return this.prisma.veterinario.delete({
      where: { id },
    });
  }
}
