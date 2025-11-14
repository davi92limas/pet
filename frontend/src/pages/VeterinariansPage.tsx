import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import {
  listVeterinarians,
  createVeterinarian,
  updateVeterinarian,
  deleteVeterinarian,
} from "@/services/veterinarians";
import { listCities } from "@/services/cities";
import type { Veterinario } from "@/types";
import { toast } from "sonner";
import { MoreHorizontal, Plus, Stethoscope } from "lucide-react";
import { getErrorMessage } from "@/utils/errors";

const vetSchema = z.object({
  nome: z.string().min(3, "Informe o nome"),
  crmv: z.string().min(4, "Informe o CRMV"),
  especialidade: z.string().min(3, "Informe a especialidade"),
  telefone: z.string().min(10, "Informe o telefone"),
  email: z.string().email("Informe um e-mail válido"),
  cidadeId: z.string().min(1),
});

type VetFormSchema = z.infer<typeof vetSchema>;

export default function VeterinariansPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Veterinario | null>(null);

  const { data: vets = [], isLoading } = useQuery({
    queryKey: ["veterinarians"],
    queryFn: listVeterinarians,
  });
  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: listCities,
  });
  const cityMap = new Map(
    cities.map((city) => [city.id, `${city.nome} - ${city.estado}`])
  );

  const form = useForm<VetFormSchema>({
    resolver: zodResolver(vetSchema),
    defaultValues: {
      nome: "",
      crmv: "",
      especialidade: "",
      telefone: "",
      email: "",
      cidadeId: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createVeterinarian,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["veterinarians"] });
      toast.success("Veterinário cadastrado!");
      closeModal();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Erro ao cadastrar veterinário")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VetFormSchema> }) =>
      updateVeterinarian(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["veterinarians"] });
      toast.success("Registro atualizado!");
      closeModal();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Erro ao atualizar veterinário")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVeterinarian,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["veterinarians"] });
      toast.success("Veterinário removido");
    },
    onError: (error) =>
      toast.error(
        getErrorMessage(error, "Não é possível remover este veterinário")
      ),
  });

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    form.reset();
  };

  const openModal = (vet?: Veterinario) => {
    if (vet) {
      setEditing(vet);
      form.reset({
        nome: vet.nome,
        crmv: vet.crmv,
        especialidade: vet.especialidade,
        telefone: vet.telefone,
        email: vet.email,
        cidadeId: vet.cidadeId,
      });
    } else {
      setEditing(null);
      form.reset({
        nome: "",
        crmv: "",
        especialidade: "",
        telefone: "",
        email: "",
        cidadeId: cities[0]?.id ?? "",
      });
    }
    setOpen(true);
  };

  const handleSubmit: SubmitHandler<VetFormSchema> = (values) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">
            Equipe veterinária credenciada
          </h2>
          <p className="text-sm text-muted-foreground">
            Cadastre os profissionais que atendem as consultas e cirurgias da
            clínica.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => openModal()} className="gap-2">
            <Plus className="h-4 w-4" /> Novo veterinário
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow>
              <TableHead>Profissional</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Cidade</TableHead>
              {isAdmin && (
                <TableHead className="w-[70px] text-right">Ações</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 5 : 4}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Carregando equipe...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && vets.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 5 : 4}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Nenhum profissional cadastrado.
                </TableCell>
              </TableRow>
            )}
            {vets.map((vet) => (
              <TableRow key={vet.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {vet.nome}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        CRMV {vet.crmv}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground leading-snug">
                  <p>{vet.email}</p>
                  <p>{vet.telefone}</p>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {vet.especialidade}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {cityMap.get(vet.cidadeId) ?? `Cidade #${vet.cidadeId}`}
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openModal(vet)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteMutation.mutate(vet.id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar veterinário" : "Novo veterinário"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="grid gap-4 md:grid-cols-2"
            >
              <FormField<VetFormSchema>
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do profissional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<VetFormSchema>
                control={form.control}
                name="crmv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CRMV</FormLabel>
                    <FormControl>
                      <Input placeholder="12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<VetFormSchema>
                control={form.control}
                name="especialidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especialidade</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Cirurgia, oftalmologia..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<VetFormSchema>
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 90000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<VetFormSchema>
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="profissional@helppet.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<VetFormSchema>
                control={form.control}
                name="cidadeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                      <Select
                      value={String(field.value ?? "")}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cities.map((city) => (
                            <SelectItem key={city.id} value={city.id}>
                            {city.nome} - {city.estado}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving
                    ? "Salvando..."
                    : editing
                    ? "Atualizar"
                    : "Cadastrar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
