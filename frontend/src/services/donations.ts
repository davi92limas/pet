import { api } from '@/lib/api';
import type { Doacao } from '@/types';

export interface DoacaoPayload {
  instituicaoId: string;
  tipo: 'PRODUTO' | 'VALOR';
  valor?: number;
  itens?: string;
  mensagem?: string;
}

export async function listDonations(): Promise<Doacao[]> {
  const { data } = await api.get<Doacao[]>('/doacoes');
  return data;
}

export async function createDonation(payload: DoacaoPayload): Promise<Doacao> {
  // Backend exige: { instituicaoId, item, quantidade, descricao? }
  const isValor = payload.tipo === 'VALOR';
  const parsed = isValor && payload.valor ? Math.round(payload.valor) : 1;
  const item = isValor ? `Valor` : (payload.itens?.trim() || 'Itens');
  const quantidade = parsed && parsed > 0 ? parsed : 1;
  const descricao = payload.mensagem || (isValor && payload.valor ? `Doação em dinheiro: R$ ${payload.valor}` : undefined);
  const body = {
    instituicaoId: payload.instituicaoId,
    item,
    quantidade,
    ...(descricao ? { descricao } : {}),
  };
  const { data } = await api.post<Doacao>('/doacoes', body);
  return data;
}

export async function updateDonation(id: string, payload: Partial<DoacaoPayload>): Promise<Doacao> {
  // Apenas descrição pode ser atualizada com segurança aqui
  const body: any = {};
  if (payload.mensagem) body.descricao = payload.mensagem;
  const { data } = await api.patch<Doacao>(`/doacoes/${id}`, body);
  return data;
}

export async function deleteDonation(id: string): Promise<void> {
  await api.delete(`/doacoes/${id}`);
}
