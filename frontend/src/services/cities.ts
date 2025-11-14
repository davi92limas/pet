import { api } from '@/lib/api';
import type { Cidade } from '@/types';

export interface CidadePayload {
  nome: string;
  estado: string;
  pais: string;
}

export async function listCities(): Promise<Cidade[]> {
  const { data } = await api.get<Cidade[]>('/cidades');
  return data;
}

export async function createCity(payload: CidadePayload): Promise<Cidade> {
  const body = { nome: payload.nome, estado: payload.estado };
  const { data } = await api.post<Cidade>('/cidades', body);
  return data;
}

export async function updateCity(id: string | number, payload: Partial<CidadePayload>): Promise<Cidade> {
  const body: Partial<CidadePayload> = {
    ...(payload?.nome ? { nome: payload.nome } : {}),
    ...(payload?.estado ? { estado: payload.estado } : {}),
  };
  const { data } = await api.patch<Cidade>(`/cidades/${String(id)}`, body);
  return data;
}

export async function deleteCity(id: string | number): Promise<void> {
  await api.delete(`/cidades/${String(id)}`);
}

export async function getCity(id: string): Promise<Cidade> {
  const { data } = await api.get<Cidade>(`/cidades/${id}`);
  return data;
}
