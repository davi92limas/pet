import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';

@Injectable()
export class AnimaisService {
  constructor(private prisma: PrismaService) {}

  async create(createAnimalDto: CreateAnimalDto) {
    if (createAnimalDto.instituicaoId) {
      const instituicao = await this.prisma.instituicao.findUnique({
        where: { id: createAnimalDto.instituicaoId },
      });

      if (!instituicao) {
        throw new NotFoundException('Instituição não encontrada');
      }
    }

    if (createAnimalDto.tutorId) {
      const tutor = await this.prisma.tutor.findUnique({
        where: { id: createAnimalDto.tutorId },
      });

      if (!tutor) {
        throw new NotFoundException('Tutor não encontrado');
      }
    }

    return this.prisma.animal.create({
      data: createAnimalDto,
    });
  }

  async findAll() {
    return this.prisma.animal.findMany({
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
            cidade: true,
          },
        },
        instituicao: true,
      },
    });
  }

  async findDisponiveis() {
    return this.prisma.animal.findMany({
      where: {
        status: 'DISPONIVEL',
      },
      include: {
        instituicao: true,
      },
    });
  }

  async findOne(id: string) {
    const animal = await this.prisma.animal.findUnique({
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
            cidade: true,
          },
        },
        instituicao: true,
        consultas: {
          include: {
            veterinario: true,
          },
        },
        cirurgias: {
          include: {
            veterinario: true,
          },
        },
      },
    });

    if (!animal) {
      throw new NotFoundException('Animal não encontrado');
    }

    return animal;
  }

  async update(id: string, updateAnimalDto: UpdateAnimalDto) {
    await this.findOne(id);

    if (updateAnimalDto.instituicaoId) {
      const instituicao = await this.prisma.instituicao.findUnique({
        where: { id: updateAnimalDto.instituicaoId },
      });

      if (!instituicao) {
        throw new NotFoundException('Instituição não encontrada');
      }
    }

    return this.prisma.animal.update({
      where: { id },
      data: updateAnimalDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Regra de negócio 1: Não deletar animal se tiver vinculado a consulta
    const consultas = await this.prisma.consulta.findMany({
      where: { animalId: id },
    });

    if (consultas.length > 0) {
      throw new BadRequestException(
        'Não é possível deletar animal que possui consultas vinculadas',
      );
    }

    // Regra de negócio 8: Não poder deletar animal caso vinculado a cirurgia
    const cirurgias = await this.prisma.cirurgia.findMany({
      where: { animalId: id },
    });

    if (cirurgias.length > 0) {
      throw new BadRequestException(
        'Não é possível deletar animal que possui cirurgias vinculadas',
      );
    }

    return this.prisma.animal.delete({
      where: { id },
    });
  }
}
