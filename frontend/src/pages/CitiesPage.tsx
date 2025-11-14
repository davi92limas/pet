import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { listCities, createCity, updateCity, deleteCity } from '@/services/cities';
import type { Cidade } from '@/types';
import { toast } from 'sonner';
import { MapPin, MoreHorizontal, Plus } from 'lucide-react';
import { getErrorMessage } from '@/utils/errors';

const citySchema = z.object({
  nome: z.string().min(2, 'Informe o nome da cidade'),
  estado: z.string().min(2, 'Informe o estado'),
  pais: z.string().min(2, 'Informe o país'),
});

type CityFormSchema = z.infer<typeof citySchema>;

export default function CitiesPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cidade | null>(null);

  const { data: cities = [], isLoading } = useQuery({ queryKey: ['cities'], queryFn: listCities });

  const form = useForm<CityFormSchema>({
    resolver: zodResolver(citySchema),
    defaultValues: { nome: '', estado: '', pais: '' },
  });

  const createMutation = useMutation({
    mutationFn: createCity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      toast.success('Cidade cadastrada!');
      handleClose();
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Não foi possível cadastrar')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CityFormSchema> }) => updateCity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      toast.success('Cidade atualizada!');
      handleClose();
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Erro ao atualizar cidade')),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      toast.success('Cidade removida');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Não foi possível remover a cidade')),
  });

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    form.reset();
  };

  const handleSubmit = (values: CityFormSchema) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const openModal = (city?: Cidade) => {
    if (city) {
      setEditing(city);
      form.reset({ nome: city.nome, estado: city.estado, pais: city.pais });
    } else {
      setEditing(null);
      form.reset({ nome: '', estado: '', pais: 'Brasil' });
    }
    setOpen(true);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">Cidades atendidas</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie as cidades habilitadas para cadastro de tutores e veterinários.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => openModal()} className="gap-2">
            <Plus className="h-4 w-4" /> Nova cidade
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow>
              <TableHead>Cidade</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>País</TableHead>
              {isAdmin && <TableHead className="w-[70px] text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 4 : 3} className="py-10 text-center text-sm text-muted-foreground">
                  Carregando cidades...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && cities.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 4 : 3} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma cidade cadastrada até o momento.
                </TableCell>
              </TableRow>
            )}

            {cities.map((city) => (
              <TableRow key={city.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{city.nome}</p>
                      <span className="text-xs text-muted-foreground">Código #{city.id}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{city.estado}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{city.pais}</TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openModal(city)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteMutation.mutate(city.id)}
                        >
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar cidade' : 'Nova cidade'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input placeholder="Estado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <Input placeholder="País" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Salvando...' : editing ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
