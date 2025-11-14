import { useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import {
  listSurgeries,
  createSurgery,
  updateSurgery,
  deleteSurgery,
} from "@/services/surgeries";
import { listAnimals } from "@/services/animals";
import { listVeterinarians } from "@/services/veterinarians";
import type { Cirurgia } from "@/types";
import { toast } from "sonner";
import { CalendarCog, MoreHorizontal, Plus } from "lucide-react";
import { format } from "date-fns";
import { getErrorMessage } from "@/utils/errors";

const surgerySchema = z.object({
  data: z.string(),
  tipo: z.string().min(3, "Informe o tipo da cirurgia"),
  animalId: z.string().min(1),
  veterinarioId: z.string().min(1),
  descricao: z.string().min(5, "Descreva a cirurgia"),
});

type SurgeryFormSchema = z.infer<typeof surgerySchema>;

export default function SurgeriesPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cirurgia | null>(null);

  const { data: surgeries = [], isLoading } = useQuery({
    queryKey: ["surgeries"],
    queryFn: listSurgeries,
  });
  const { data: animals = [] } = useQuery({
    queryKey: ["animals"],
    queryFn: listAnimals,
  });
  const { data: vets = [] } = useQuery({
    queryKey: ["veterinarians"],
    queryFn: listVeterinarians,
  });

  const animalsMap = useMemo(
    () => new Map(animals.map((animal) => [animal.id, animal.nome])),
    [animals]
  );
  const vetsMap = useMemo(
    () => new Map(vets.map((vet) => [vet.id, vet.nome])),
    [vets]
  );

  const form = useForm<SurgeryFormSchema>({
    resolver: zodResolver(surgerySchema),
    defaultValues: {
      data: new Date().toISOString().slice(0, 16),
      tipo: "",
      animalId: "",
      veterinarioId: "",
      descricao: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createSurgery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surgeries"] });
      toast.success("Cirurgia registrada!");
      closeModal();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Erro ao registrar cirurgia")),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<SurgeryFormSchema>;
    }) => updateSurgery(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surgeries"] });
      toast.success("Cirurgia atualizada!");
      closeModal();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Erro ao atualizar cirurgia")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSurgery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surgeries"] });
      toast.success("Cirurgia removida");
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Não é possível remover a cirurgia")),
  });

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    form.reset();
  };

  const openModal = (surgery?: Cirurgia) => {
    if (surgery) {
      setEditing(surgery);
      form.reset({
        data: surgery.data.slice(0, 16),
        tipo: surgery.tipo,
        animalId: surgery.animalId,
        veterinarioId: surgery.veterinarioId,
        descricao: surgery.descricao,
      });
    } else {
      setEditing(null);
      form.reset({
        data: new Date().toISOString().slice(0, 16),
        tipo: "",
        animalId: animals[0]?.id ?? "",
        veterinarioId: vets[0]?.id ?? "",
        descricao: "",
      });
    }
    setOpen(true);
  };

  const handleSubmit: SubmitHandler<SurgeryFormSchema> = (values) => {
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
            Centro cirúrgico
          </h2>
          <p className="text-sm text-muted-foreground">
            Controle os procedimentos cirúrgicos realizados nos animais
            resgatados.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => openModal()} className="gap-2">
            <Plus className="h-4 w-4" /> Nova cirurgia
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Animal</TableHead>
              <TableHead>Veterinário</TableHead>
              <TableHead>Tipo / Detalhes</TableHead>
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
                  Carregando cirurgias...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && surgeries.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 5 : 4}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Nenhum procedimento registrado.
                </TableCell>
              </TableRow>
            )}
            {surgeries.map((surgery) => (
              <TableRow key={surgery.id}>
                <TableCell className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarCog className="h-4 w-4 text-primary" />
                    <span>
                      {format(new Date(surgery.data), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {animalsMap.get(surgery.animalId) ??
                    `Animal #${surgery.animalId}`}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {vetsMap.get(surgery.veterinarioId) ??
                    `Veterinário #${surgery.veterinarioId}`}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground leading-snug">
                  <p className="font-semibold text-foreground">
                    {surgery.tipo}
                  </p>
                  <span>{surgery.descricao}</span>
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
                        <DropdownMenuItem onClick={() => openModal(surgery)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteMutation.mutate(surgery.id)}
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar cirurgia" : "Nova cirurgia"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="grid gap-4 md:grid-cols-2"
            >
              <FormField<SurgeryFormSchema>
                control={form.control}
                name="data"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data e hora</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<SurgeryFormSchema>
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo do procedimento</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Ortopedia, esterilização..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<SurgeryFormSchema>
                control={form.control}
                name="animalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Animal</FormLabel>
                    <Select
                      value={String(field.value ?? "")}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-56">
                        {animals.map((animal) => (
                          <SelectItem
                            key={animal.id}
                            value={animal.id}
                          >
                            {animal.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<SurgeryFormSchema>
                control={form.control}
                name="veterinarioId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Veterinário</FormLabel>
                    <Select
                      value={String(field.value ?? "")}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-56">
                        {vets.map((vet) => (
                          <SelectItem key={vet.id} value={vet.id}>
                            {vet.nome} ({vet.especialidade})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<SurgeryFormSchema>
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Detalhes do procedimento</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Descrição completa, medicamentos, cuidados"
                        {...field}
                      />
                    </FormControl>
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
