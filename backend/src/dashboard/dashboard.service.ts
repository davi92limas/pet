import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      totalAnimais,
      animaisDisponiveis,
      animaisAdotados,
      totalInstituicoes,
      totalAdocoes,
      adocoesPendentes,
      totalDoacoes,
      doacoesPendentes,
      totalTutores,
      totalVeterinarios,
      totalConsultas,
      totalDenuncias,
      denunciasPendentes,
    ] = await Promise.all([
      this.prisma.animal.count(),
      this.prisma.animal.count({ where: { status: 'DISPONIVEL' } }),
      this.prisma.animal.count({ where: { status: 'ADOTADO' } }),
      this.prisma.instituicao.count(),
      this.prisma.adocao.count(),
      this.prisma.adocao.count({ where: { status: 'PENDENTE' } }),
      this.prisma.doacao.count(),
      this.prisma.doacao.count({ where: { status: 'PENDENTE' } }),
      this.prisma.tutor.count(),
      this.prisma.veterinario.count(),
      this.prisma.consulta.count(),
      this.prisma.denuncia.count(),
      this.prisma.denuncia.count({ where: { status: 'PENDENTE' } }),
    ]);

    return {
      animais: {
        total: totalAnimais,
        disponiveis: animaisDisponiveis,
        adotados: animaisAdotados,
        emTratamento: totalAnimais - animaisDisponiveis - animaisAdotados,
      },
      instituicoes: {
        total: totalInstituicoes,
      },
      adocoes: {
        total: totalAdocoes,
        pendentes: adocoesPendentes,
        aprovadas: await this.prisma.adocao.count({
          where: { status: 'APROVADA' },
        }),
        concluidas: await this.prisma.adocao.count({
          where: { status: 'CONCLUIDA' },
        }),
      },
      doacoes: {
        total: totalDoacoes,
        pendentes: doacoesPendentes,
        confirmadas: await this.prisma.doacao.count({
          where: { status: 'CONFIRMADA' },
        }),
        entregues: await this.prisma.doacao.count({
          where: { status: 'ENTREGUE' },
        }),
      },
      tutores: {
        total: totalTutores,
      },
      veterinarios: {
        total: totalVeterinarios,
      },
      consultas: {
        total: totalConsultas,
      },
      denuncias: {
        total: totalDenuncias,
        pendentes: denunciasPendentes,
        resolvidas: await this.prisma.denuncia.count({
          where: { status: 'RESOLVIDA' },
        }),
      },
    };
  }
}
