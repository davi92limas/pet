import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoacaoDto } from './dto/create-doacao.dto';

@Injectable()
export class DoacoesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDoacaoDto: CreateDoacaoDto) {
    const instituicao = await this.prisma.instituicao.findUnique({
      where: { id: createDoacaoDto.instituicaoId },
    });

    if (!instituicao) {
      throw new NotFoundException('Instituição não encontrada');
    }

    return this.prisma.doacao.create({
      data: {
        userId,
        instituicaoId: createDoacaoDto.instituicaoId,
        item: createDoacaoDto.item,
        quantidade: createDoacaoDto.quantidade,
        descricao: createDoacaoDto.descricao,
        status: 'PENDENTE',
      },
      include: {
        instituicao: true,
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
    return this.prisma.doacao.findMany({
      include: {
        instituicao: true,
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
    return this.prisma.doacao.findMany({
      where: { userId },
      include: {
        instituicao: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const doacao = await this.prisma.doacao.findUnique({
      where: { id },
      include: {
        instituicao: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!doacao) {
      throw new NotFoundException('Doação não encontrada');
    }

    return doacao;
  }

  async updateStatus(
    id: string,
    status: 'CONFIRMADA' | 'ENTREGUE' | 'CANCELADA',
  ) {
    await this.findOne(id);

    return this.prisma.doacao.update({
      where: { id },
      data: { status },
    });
  }
}
