import { api } from '@/lib/api';
import type { Cirurgia } from '@/types';

export interface CirurgiaPayload {
  data: string;
  tipo: string;
  animalId: string;
  veterinarioId: string;
  descricao: string;
}

export async function listSurgeries(): Promise<Cirurgia[]> {
  const { data } = await api.get<Cirurgia[]>('/cirurgias');
  return data;
}

export async function createSurgery(payload: CirurgiaPayload): Promise<Cirurgia> {
  const { tipo: _omitTipo, ...rest } = payload;
  const body = {
    data: rest.data,
    descricao: rest.descricao,
    animalId: rest.animalId,
    veterinarioId: rest.veterinarioId,
  };
  const { data } = await api.post<Cirurgia>('/cirurgias', body);
  return data;
}

export async function updateSurgery(id: string, payload: Partial<CirurgiaPayload>): Promise<Cirurgia> {
  const { tipo: _omitTipo, ...rest } = payload;
  const body: any = {
    ...(rest.data ? { data: rest.data } : {}),
    ...(rest.descricao ? { descricao: rest.descricao } : {}),
    ...(rest.animalId !== undefined ? { animalId: rest.animalId } : {}),
    ...(rest.veterinarioId !== undefined ? { veterinarioId: rest.veterinarioId } : {}),
  };
  const { data } = await api.patch<Cirurgia>(`/cirurgias/${id}`, body);
  return data;
}

export async function deleteSurgery(id: string): Promise<void> {
  await api.delete(`/cirurgias/${id}`);
}
