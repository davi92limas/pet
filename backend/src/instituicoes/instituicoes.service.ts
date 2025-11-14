import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstituicaoDto } from './dto/create-instituicao.dto';
import { UpdateInstituicaoDto } from './dto/update-instituicao.dto';

@Injectable()
export class InstituicoesService {
  constructor(private prisma: PrismaService) {}

  async create(createInstituicaoDto: CreateInstituicaoDto) {
    const existing = await this.prisma.instituicao.findUnique({
      where: { cnpj: createInstituicaoDto.cnpj },
    });

    if (existing) {
      throw new BadRequestException('CNPJ já cadastrado');
    }

    return this.prisma.instituicao.create({
      data: createInstituicaoDto,
    });
  }

  async findAll() {
    return this.prisma.instituicao.findMany({
      include: {
        animais: true,
        _count: {
          select: {
            animais: true,
            doacoes: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const instituicao = await this.prisma.instituicao.findUnique({
      where: { id },
      include: {
        animais: true,
        doacoes: {
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

    if (!instituicao) {
      throw new NotFoundException('Instituição não encontrada');
    }

    return instituicao;
  }

  async update(id: string, updateInstituicaoDto: UpdateInstituicaoDto) {
    await this.findOne(id);

    if (updateInstituicaoDto.cnpj) {
      const existing = await this.prisma.instituicao.findFirst({
        where: {
          cnpj: updateInstituicaoDto.cnpj,
          NOT: { id },
        },
      });

      if (existing) {
        throw new BadRequestException('CNPJ já cadastrado');
      }
    }

    return this.prisma.instituicao.update({
      where: { id },
      data: updateInstituicaoDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const animais = await this.prisma.animal.findMany({
      where: { instituicaoId: id },
    });

    if (animais.length > 0) {
      throw new BadRequestException(
        'Não é possível deletar instituição que possui animais vinculados',
      );
    }

    return this.prisma.instituicao.delete({
      where: { id },
    });
  }
}
