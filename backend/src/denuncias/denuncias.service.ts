import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDenunciaDto } from './dto/create-denuncia.dto';

@Injectable()
export class DenunciasService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDenunciaDto: CreateDenunciaDto) {
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: createDenunciaDto.tutorId },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor não encontrado');
    }

    return this.prisma.denuncia.create({
      data: {
        userId,
        tutorId: createDenunciaDto.tutorId,
        motivo: createDenunciaDto.motivo,
        descricao: createDenunciaDto.descricao,
        status: 'PENDENTE',
      },
      include: {
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.denuncia.findMany({
      include: {
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const denuncia = await this.prisma.denuncia.findUnique({
      where: { id },
      include: {
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!denuncia) {
      throw new NotFoundException('Denúncia não encontrada');
    }

    return denuncia;
  }

  async updateStatus(
    id: string,
    status: 'ANALISANDO' | 'RESOLVIDA' | 'DESCARTADA',
  ) {
    await this.findOne(id);

    return this.prisma.denuncia.update({
      where: { id },
      data: { status },
    });
  }
}
