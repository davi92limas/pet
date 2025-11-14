import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AnimaisModule } from './animais/animais.module';
import { InstituicoesModule } from './instituicoes/instituicoes.module';
import { AdocoesModule } from './adocoes/adocoes.module';
import { DoacoesModule } from './doacoes/doacoes.module';
import { CidadesModule } from './cidades/cidades.module';
import { VeterinariosModule } from './veterinarios/veterinarios.module';
import { TutoresModule } from './tutores/tutores.module';
import { ConsultasModule } from './consultas/consultas.module';
import { CirurgiasModule } from './cirurgias/cirurgias.module';
import { DenunciasModule } from './denuncias/denuncias.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AnimaisModule,
    InstituicoesModule,
    AdocoesModule,
    DoacoesModule,
    CidadesModule,
    VeterinariosModule,
    TutoresModule,
    ConsultasModule,
    CirurgiasModule,
    DenunciasModule,
    DashboardModule,
  ],
})
export class AppModule {}
