import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCirurgiaDto } from './dto/create-cirurgia.dto';

@Injectable()
export class CirurgiasService {
  constructor(private prisma: PrismaService) {}

  async create(createCirurgiaDto: CreateCirurgiaDto) {
    const animal = await this.prisma.animal.findUnique({
      where: { id: createCirurgiaDto.animalId },
    });

    if (!animal) {
      throw new NotFoundException('Animal não encontrado');
    }

    const veterinario = await this.prisma.veterinario.findUnique({
      where: { id: createCirurgiaDto.veterinarioId },
    });

    if (!veterinario) {
      throw new NotFoundException('Veterinário não encontrado');
    }

    return this.prisma.cirurgia.create({
      data: {
        ...createCirurgiaDto,
        data: new Date(createCirurgiaDto.data),
      },
      include: {
        animal: true,
        veterinario: {
          include: {
            cidade: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.cirurgia.findMany({
      include: {
        animal: true,
        veterinario: {
          include: {
            cidade: true,
          },
        },
      },
      orderBy: {
        data: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const cirurgia = await this.prisma.cirurgia.findUnique({
      where: { id },
      include: {
        animal: true,
        veterinario: {
          include: {
            cidade: true,
          },
        },
      },
    });

    if (!cirurgia) {
      throw new NotFoundException('Cirurgia não encontrada');
    }

    return cirurgia;
  }
}
