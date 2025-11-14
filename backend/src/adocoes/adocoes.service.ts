import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdocaoDto } from './dto/create-adocao.dto';

@Injectable()
export class AdocoesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createAdocaoDto: CreateAdocaoDto) {
    // Regra de negócio 5: Não cadastrar consulta se não tiver animal e veterinário cadastrado
    // Adaptada para adoção: verificar se animal existe
    const animal = await this.prisma.animal.findUnique({
      where: { id: createAdocaoDto.animalId },
    });

    if (!animal) {
      throw new NotFoundException('Animal não encontrado');
    }

    if (animal.status !== 'DISPONIVEL') {
      throw new BadRequestException('Animal não está disponível para adoção');
    }

    const adocao = await this.prisma.adocao.create({
      data: {
        userId,
        animalId: createAdocaoDto.animalId,
        observacoes: createAdocaoDto.observacoes,
        status: 'PENDENTE',
      },
      include: {
        animal: {
          include: {
            instituicao: true,
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

    return adocao;
  }

  async findAll() {
    return this.prisma.adocao.findMany({
      include: {
        animal: {
          include: {
            instituicao: true,
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

  async findByUser(userId: string) {
    return this.prisma.adocao.findMany({
      where: { userId },
      include: {
        animal: {
          include: {
            instituicao: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const adocao = await this.prisma.adocao.findUnique({
      where: { id },
      include: {
        animal: {
          include: {
            instituicao: true,
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

    if (!adocao) {
      throw new NotFoundException('Adoção não encontrada');
    }

    return adocao;
  }

  async updateStatus(
    id: string,
    status: 'APROVADA' | 'REJEITADA' | 'CONCLUIDA',
  ) {
    const adocao = await this.findOne(id);

    if (status === 'APROVADA' || status === 'CONCLUIDA') {
      await this.prisma.animal.update({
        where: { id: adocao.animalId },
        data: { status: 'ADOTADO' },
      });
    }

    return this.prisma.adocao.update({
      where: { id },
      data: { status },
    });
  }
}
