import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsultaDto } from './dto/create-consulta.dto';

@Injectable()
export class ConsultasService {
  constructor(private prisma: PrismaService) {}

  async create(createConsultaDto: CreateConsultaDto) {
    // Regra de negócio 5: Não cadastrar consulta se não tiver animal e veterinário cadastrado
    const animal = await this.prisma.animal.findUnique({
      where: { id: createConsultaDto.animalId },
    });

    if (!animal) {
      throw new NotFoundException('Animal não encontrado');
    }

    const veterinario = await this.prisma.veterinario.findUnique({
      where: { id: createConsultaDto.veterinarioId },
    });

    if (!veterinario) {
      throw new NotFoundException('Veterinário não encontrado');
    }

    if (createConsultaDto.tutorId) {
      const tutor = await this.prisma.tutor.findUnique({
        where: { id: createConsultaDto.tutorId },
      });

      if (!tutor) {
        throw new NotFoundException('Tutor não encontrado');
      }
    }

    return this.prisma.consulta.create({
      data: {
        ...createConsultaDto,
        data: new Date(createConsultaDto.data),
      },
      include: {
        animal: true,
        veterinario: {
          include: {
            cidade: true,
          },
        },
        tutor: {
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
      },
    });
  }

  async findAll() {
    return this.prisma.consulta.findMany({
      include: {
        animal: true,
        veterinario: {
          include: {
            cidade: true,
          },
        },
        tutor: {
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
      },
      orderBy: {
        data: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const consulta = await this.prisma.consulta.findUnique({
      where: { id },
      include: {
        animal: true,
        veterinario: {
          include: {
            cidade: true,
          },
        },
        tutor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            cidade: true,
          },
        },
      },
    });

    if (!consulta) {
      throw new NotFoundException('Consulta não encontrada');
    }

    return consulta;
  }
}
