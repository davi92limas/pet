export type Role = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Animal {
  id: string;
  nome: string;
  especie: string;
  raca: string;
  idade: number;
  sexo: 'MACHO' | 'FEMEA';
  porte: 'PEQUENO' | 'MEDIO' | 'GRANDE';
  temperamento: string;
  descricao: string;
  fotoUrl?: string;
  status: 'DISPONIVEL' | 'ADOTADO';
  createdAt: string;
}

export interface Instituicao {
  id: string;
  nome: string;
  responsavel: string;
  telefone: string;
  email: string;
  endereco: string;
  cidadeId: string;
  descricao: string;
  necessidades: string;
  site?: string;
  imagemUrl?: string;
}

export interface Tutor {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
  cidadeId: string;
  possuiAnimais: boolean;
}

export interface Veterinario {
  id: string;
  nome: string;
  crmv: string;
  especialidade: string;
  telefone: string;
  email: string;
  cidadeId: string;
}

export interface Cidade {
  id: string;
  nome: string;
  estado: string;
  pais: string;
}

export interface Consulta {
  id: string;
  data: string;
  animalId: string;
  veterinarioId: string;
  descricao: string;
  observacoes?: string;
}

export interface Cirurgia {
  id: string;
  data: string;
  tipo: string;
  animalId: string;
  veterinarioId: string;
  descricao: string;
}

export interface Adocao {
  id: string;
  animalId: string;
  tutorId: string;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA';
  observacoes?: string;
  createdAt: string;
}

export interface Doacao {
  id: string;
  instituicaoId: string;
  tutorId: string;
  tipo: 'PRODUTO' | 'VALOR';
  valor?: number;
  itens?: string;
  mensagem?: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalAnimais: number;
  totalAdocoes: number;
  totalInstituicoes: number;
  totalDoacoes: number;
  animaisPorPorte: Record<string, number>;
  adocoesUltimosMeses: Array<{ mes: string; total: number }>;
  doacoesUltimosMeses: Array<{ mes: string; total: number }>;
}
