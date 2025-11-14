import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listAdoptions } from '@/services/adoptions';
import { listAnimals } from '@/services/animals';
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
import { format } from 'date-fns';
import { HeartHandshake, PawPrint } from 'lucide-react';

export default function MyAdoptionsPage() {
  const { data: adoptions = [], isLoading } = useQuery({ queryKey: ['adoptions'], queryFn: listAdoptions });
  const { data: animals = [] } = useQuery({ queryKey: ['animals'], queryFn: listAnimals });
  const { data: tutors = [] } = useQuery({ queryKey: ['tutors'], queryFn: listTutors });

  const storedHighlight = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('@helppet:last_adoption');
    if (!stored) return null;
    try {
      return JSON.parse(stored) as { id: string; animalId: string; tutorId: string };
    } catch (error) {
      console.error('Erro ao ler última adoção', error);
      return null;
    }
  }, []);

  const animalsMap = useMemo(() => new Map(animals.map((animal) => [animal.id, animal])), [animals]);
  const tutorsMap = useMemo(() => new Map(tutors.map((tutor) => [tutor.id, tutor])), [tutors]);

  const adoptionList = useMemo(() => {
    return adoptions.map((adoption) => ({
      ...adoption,
      animal: animalsMap.get(adoption.animalId),
      tutor: tutorsMap.get(adoption.tutorId),
    }));
  }, [adoptions, animalsMap, tutorsMap]);

  const highlightedAdoption = storedHighlight
    ? adoptionList.find((adoption) => adoption.id === storedHighlight.id) ?? null
    : null;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground">Acompanhamento das suas adoções</h2>
        <p className="text-sm text-muted-foreground">
          Veja o status dos pedidos enviados e prepare-se para receber o novo integrante da família.
        </p>
      </div>

      {highlightedAdoption && (
        <Card className="border-primary/40 bg-gradient-to-br from-primary/10 via-background to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <HeartHandshake className="h-5 w-5" /> Pedido em destaque
            </CardTitle>
            <CardDescription>
              Estamos organizando os últimos detalhes para que {highlightedAdoption.animal?.nome ?? 'o seu pet'}
              chegue com todo carinho até você.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Animal:</strong> {highlightedAdoption.animal?.nome}{' '}
              <Badge variant="secondary" className="ml-2 capitalize">
                {highlightedAdoption.status.toLowerCase()}
              </Badge>
            </p>
            <p>
              <strong>Data do pedido:</strong> {format(new Date(highlightedAdoption.createdAt), 'dd/MM/yyyy')}
            </p>
            {highlightedAdoption.observacoes && <p>{highlightedAdoption.observacoes}</p>}
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Histórico de adoções</CardTitle>
          <CardDescription>Você pode acompanhar cada etapa e status diretamente por aqui.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <p className="text-sm text-muted-foreground">Carregando informações...</p>}

          {!isLoading && adoptionList.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-muted-foreground">
              <PawPrint className="h-10 w-10 text-primary" />
              <p>Ainda não há solicitações de adoção. Explore a vitrine e encontre o pet ideal!</p>
            </div>
          )}

          {!isLoading && adoptionList.length > 0 && (
            <div className="space-y-4">
              {adoptionList.map((adoption) => (
                <div
                  key={adoption.id}
                  className="rounded-lg border border-border/60 bg-card/60 p-4 shadow-sm transition hover:border-primary/50"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {adoption.animal?.nome ?? `Animal #${adoption.animalId}`}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Responsável: {adoption.tutor?.nome ?? `Tutor #${adoption.tutorId}`}
                      </p>
                    </div>
                    <Badge
                      variant={adoption.status === 'APROVADA' ? 'secondary' : adoption.status === 'REJEITADA' ? 'destructive' : 'outline'}
                      className="capitalize"
                    >
                      {adoption.status.toLowerCase()}
                    </Badge>
                  </div>

                  <Separator className="my-3" />

                  <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                    <p>
                      <strong>Solicitado em:</strong> {format(new Date(adoption.createdAt), 'dd/MM/yyyy HH:mm')}
                    </p>
                    {adoption.observacoes && (
                      <p>
                        <strong>Observações:</strong> {adoption.observacoes}
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
