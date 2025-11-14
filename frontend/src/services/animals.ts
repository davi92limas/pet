import { api } from '@/lib/api';
import type { Animal } from '@/types';

export interface AnimalPayload {
  nome: string;
  especie: string;
  raca: string;
  idade: number;
  descricao: string;
  fotoUrl?: string;
}

export async function listAnimals(): Promise<Animal[]> {
  const { data } = await api.get<Animal[]>('/animais');
  return data;
}

export async function createAnimal(payload: AnimalPayload): Promise<Animal> {
  const body = {
    nome: payload.nome,
    especie: payload.especie,
    raca: payload.raca,
    idade: payload.idade,
    descricao: payload.descricao,
    ...(payload.fotoUrl ? { foto: payload.fotoUrl } : {}),
  };
  const { data } = await api.post<Animal>('/animais', body);
  return data;
}

export async function updateAnimal(id: string, payload: Partial<AnimalPayload>): Promise<Animal> {
  const body: any = {
    ...(payload.nome ? { nome: payload.nome } : {}),
    ...(payload.especie ? { especie: payload.especie } : {}),
    ...(payload.raca ? { raca: payload.raca } : {}),
    ...(payload.idade !== undefined ? { idade: payload.idade } : {}),
    ...(payload.descricao ? { descricao: payload.descricao } : {}),
    ...(payload.fotoUrl ? { foto: payload.fotoUrl } : {}),
  };
  const { data } = await api.patch<Animal>(`/animais/${id}`, body);
  return data;
}

export async function deleteAnimal(id: string): Promise<void> {
  await api.delete(`/animais/${id}`);
}
