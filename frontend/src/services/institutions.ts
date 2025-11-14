import { api } from '@/lib/api';
import type { Instituicao } from '@/types';

export interface InstituicaoPayload {
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

export async function listInstitutions(): Promise<Instituicao[]> {
  const { data } = await api.get<Instituicao[]>('/instituicoes');
  return data;
}

export async function createInstitution(payload: InstituicaoPayload): Promise<Instituicao> {
  // Backend exige: { nome, cnpj, endereco, telefone, cidade, estado, descricao? }
  // Converter cidadeId -> cidade/estado e gerar CNPJ válido único
  const city = await api.get<{ id: string; nome: string; estado: string; pais: string }>(`/cidades/${payload.cidadeId}`).then(r => r.data);
  const cnpj = String(Date.now()) // 13 dígitos
    .padEnd(14, '0'); // garantir 14 dígitos
  const body = {
    nome: payload.nome,
    cnpj,
    endereco: payload.endereco,
    telefone: payload.telefone,
    cidade: city.nome,
    estado: city.estado,
    ...(payload.descricao ? { descricao: payload.descricao } : {}),
  };
  const { data } = await api.post<Instituicao>('/instituicoes', body);
  return data;
}

export async function updateInstitution(id: string, payload: Partial<InstituicaoPayload>): Promise<Instituicao> {
  let cidadeEstado: { cidade?: string; estado?: string } = {};
  if (payload.cidadeId) {
    const city = await api.get<{ id: string; nome: string; estado: string; pais: string }>(`/cidades/${payload.cidadeId}`).then(r => r.data);
    cidadeEstado = { cidade: city.nome, estado: city.estado };
  }
  const body = {
    ...(payload.nome ? { nome: payload.nome } : {}),
    ...(payload.endereco ? { endereco: payload.endereco } : {}),
    ...(payload.telefone ? { telefone: payload.telefone } : {}),
    ...(payload.descricao ? { descricao: payload.descricao } : {}),
    ...cidadeEstado,
  };
  const { data } = await api.patch<Instituicao>(`/instituicoes/${id}`, body);
  return data;
}

export async function deleteInstitution(id: string): Promise<void> {
  await api.delete(`/instituicoes/${id}`);
}
