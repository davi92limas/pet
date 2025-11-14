import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';

@Injectable()
export class TutoresService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTutorDto: CreateTutorDto) {
    // Regra de negócio 4: Não cadastrar tutor sem cidade
    const cidade = await this.prisma.cidade.findUnique({
      where: { id: createTutorDto.cidadeId },
    });

    if (!cidade) {
      throw new NotFoundException('Cidade não encontrada');
    }

    const existing = await this.prisma.tutor.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new BadRequestException('Usuário já possui perfil de tutor');
    }

    return this.prisma.tutor.create({
      data: {
        userId,
        cidadeId: createTutorDto.cidadeId,
        telefone: createTutorDto.telefone,
        endereco: createTutorDto.endereco,
      },
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
    });
  }

  async findAll() {
    return this.prisma.tutor.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        cidade: true,
        _count: {
          select: {
            animais: true,
            consultas: true,
            denuncias: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const tutor = await this.prisma.tutor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        cidade: true,
        animais: true,
        consultas: {
          include: {
            animal: true,
            veterinario: true,
          },
        },
        denuncias: true,
      },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor não encontrado');
    }

    return tutor;
  }

  async findByUser(userId: string) {
    return this.prisma.tutor.findUnique({
      where: { userId },
      include: {
        cidade: true,
        animais: true,
      },
    });
  }

  async update(id: string, updateTutorDto: UpdateTutorDto) {
    await this.findOne(id);

    if (updateTutorDto.cidadeId) {
      const cidade = await this.prisma.cidade.findUnique({
        where: { id: updateTutorDto.cidadeId },
      });

      if (!cidade) {
        throw new NotFoundException('Cidade não encontrada');
      }
    }

    return this.prisma.tutor.update({
      where: { id },
      data: updateTutorDto,
      include: {
        cidade: true,
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

  async remove(id: string) {
    await this.findOne(id);

    // Regra de negócio 6: Não deixar deletar tutor se ele possuir denúncias
    const denuncias = await this.prisma.denuncia.findMany({
      where: { tutorId: id },
    });

    if (denuncias.length > 0) {
      throw new BadRequestException(
        'Não é possível deletar tutor que possui denúncias',
      );
    }

    return this.prisma.tutor.delete({
      where: { id },
    });
  }
}
