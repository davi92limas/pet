import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listDonations } from '@/services/donations';
import { listInstitutions } from '@/services/institutions';
import { listTutors } from '@/services/tutors';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/utils/number';
import { Gift, HandHeart } from 'lucide-react';
import { format } from 'date-fns';

export default function MyDonationsPage() {
  const { data: donations = [], isLoading } = useQuery({ queryKey: ['donations'], queryFn: listDonations });
  const { data: institutions = [] } = useQuery({ queryKey: ['institutions'], queryFn: listInstitutions });
  const { data: tutors = [] } = useQuery({ queryKey: ['tutors'], queryFn: listTutors });

  const institutionsMap = useMemo(() => new Map(institutions.map((item) => [item.id, item])), [institutions]);
  const tutorsMap = useMemo(() => new Map(tutors.map((item) => [item.id, item])), [tutors]);

  const donationList = useMemo(
    () =>
      donations.map((donation) => ({
        ...donation,
        instituicao: institutionsMap.get(donation.instituicaoId),
        tutor: tutorsMap.get(donation.tutorId),
      })),
    [donations, institutionsMap, tutorsMap],
  );

  const highlight = useMemo(() => {
    if (donationList.length === 0) return null;
    return [...donationList].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
  }, [donationList]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground">Histórico de doações</h2>
        <p className="text-sm text-muted-foreground">
          Obrigado por apoiar nossa rede de cuidados. Acompanhe tudo o que você já destinou às instituições.
        </p>
      </div>

      {highlight && (
        <Card className="border-primary/40 bg-gradient-to-br from-primary/10 via-background to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <HandHeart className="h-5 w-5" /> Última doação registrada
            </CardTitle>
            <CardDescription>
              {highlight.tipo === 'VALOR'
                ? `Valor destinado: ${formatCurrency(highlight.valor ?? 0)} para ${institutionsMap.get(highlight.instituicaoId)?.nome ?? 'instituição'}.`
                : `Itens enviados: ${highlight.itens ?? ''}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Data:</strong> {format(new Date(highlight.createdAt), 'dd/MM/yyyy HH:mm')}
            </p>
            {highlight.mensagem && (
              <p>
                <strong>Mensagem:</strong> {highlight.mensagem}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Resumo completo</CardTitle>
          <CardDescription>Veja a forma, instituição e detalhes de cada contribuição.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <p className="text-sm text-muted-foreground">Carregando doações...</p>}

          {!isLoading && donationList.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-muted-foreground">
              <Gift className="h-10 w-10 text-primary" />
              <p>Suas doações aparecerão aqui assim que forem registradas.</p>
            </div>
          )}

          {!isLoading && donationList.length > 0 && (
            <div className="space-y-4">
              {donationList.map((donation) => (
                <div key={donation.id} className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {institutionsMap.get(donation.instituicaoId)?.nome ?? `Instituição #${donation.instituicaoId}`}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Responsável: {tutorsMap.get(donation.tutorId)?.nome ?? `Tutor #${donation.tutorId}`}
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {donation.tipo === 'VALOR' ? 'Doação financeira' : 'Doação de itens'}
                    </Badge>
                  </div>

                  <Separator className="my-3" />

                  <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                    <p>
                      <strong>Data:</strong> {format(new Date(donation.createdAt), 'dd/MM/yyyy HH:mm')}
                    </p>
                    {donation.tipo === 'VALOR' ? (
                      <p>
                        <strong>Valor:</strong> {formatCurrency(donation.valor ?? 0)}
                      </p>
                    ) : (
                      <p>
                        <strong>Itens:</strong> {donation.itens ?? '—'}
                      </p>
                    )}
                    {donation.mensagem && (
                      <p>
                        <strong>Mensagem:</strong> {donation.mensagem}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
