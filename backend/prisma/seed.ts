/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'adm@gmail.com' },
    update: {},
    create: {
      email: 'adm@gmail.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });

  console.log('✅ Usuário admin criado:', admin.email);

  // Criar algumas cidades
  const cidade1 = await prisma.cidade.upsert({
    where: { id: 'cidade-1' },
    update: {},
    create: {
      id: 'cidade-1',
      nome: 'São Paulo',
      estado: 'SP',
    },
  });

  const cidade2 = await prisma.cidade.upsert({
    where: { id: 'cidade-2' },
    update: {},
    create: {
      id: 'cidade-2',
      nome: 'Rio de Janeiro',
      estado: 'RJ',
    },
  });

  console.log('✅ Cidades criadas');

  // Criar algumas instituições
  const instituicao1 = await prisma.instituicao.upsert({
    where: { cnpj: '12345678000190' },
    update: {},
    create: {
      nome: 'Clínica Amigo Fiel',
      cnpj: '12345678000190',
      endereco: 'Rua dos Animais, 123',
      telefone: '(11) 98765-4321',
      cidade: 'São Paulo',
      estado: 'SP',
      descricao: 'Clínica especializada em reabilitação de cães abandonados',
    },
  });

  const instituicao2 = await prisma.instituicao.upsert({
    where: { cnpj: '98765432000110' },
    update: {},
    create: {
      nome: 'Casa dos Peludos',
      cnpj: '98765432000110',
      endereco: 'Av. Pet, 456',
      telefone: '(21) 91234-5678',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      descricao: 'Abrigo e clínica veterinária para animais em situação de rua',
    },
  });

  console.log('✅ Instituições criadas');

  // Criar alguns animais
  await prisma.animal.create({
    data: {
      nome: 'Rex',
      especie: 'Cão',
      raca: 'Vira-lata',
      idade: 2,
      peso: 15.5,
      descricao: 'Cão muito dócil e brincalhão, castrado e vacinado',
      status: 'DISPONIVEL',
      instituicaoId: instituicao1.id,
    },
  });

  await prisma.animal.create({
    data: {
      nome: 'Luna',
      especie: 'Cão',
      raca: 'Golden Retriever',
      idade: 1,
      peso: 20.0,
      descricao: 'Fêmea muito carinhosa, ideal para família com crianças',
      status: 'DISPONIVEL',
      instituicaoId: instituicao1.id,
    },
  });

  await prisma.animal.create({
    data: {
      nome: 'Thor',
      especie: 'Cão',
      raca: 'Pastor Alemão',
      idade: 3,
      peso: 30.0,
      descricao: 'Cão grande e protetor, precisa de espaço',
      status: 'EM_TRATAMENTO',
      instituicaoId: instituicao2.id,
    },
  });

  console.log('✅ Animais criados');

  // Criar veterinários (idempotente por CRMV)
  await prisma.veterinario.upsert({
    where: { crmv: 'SP-12345' },
    update: {},
    create: {
      nome: 'Dr. João Silva',
      crmv: 'SP-12345',
      cidadeId: cidade1.id,
      telefone: '(11) 99876-5432',
      especialidade: 'Clínica Geral',
    },
  });

  await prisma.veterinario.upsert({
    where: { crmv: 'RJ-67890' },
    update: {},
    create: {
      nome: 'Dra. Maria Santos',
      crmv: 'RJ-67890',
      cidadeId: cidade2.id,
      telefone: '(21) 98765-4321',
      especialidade: 'Cirurgia',
    },
  });

  console.log('✅ Veterinários criados');

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
