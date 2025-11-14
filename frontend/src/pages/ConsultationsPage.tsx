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
  listConsultations,
  createConsultation,
  updateConsultation,
  deleteConsultation,
} from "@/services/consultations";
import { listAnimals } from "@/services/animals";
import { listVeterinarians } from "@/services/veterinarians";
import type { Consulta } from "@/types";
import { toast } from "sonner";
import { CalendarDays, MoreHorizontal, Plus } from "lucide-react";
import { format } from "date-fns";
import { getErrorMessage } from "@/utils/errors";

const consultationSchema = z.object({
  data: z.string(),
  animalId: z.string().min(1),
  veterinarioId: z.string().min(1),
  descricao: z.string().min(5, "Descreva o motivo da consulta"),
  observacoes: z.string().optional().or(z.literal("")),
});

type ConsultationFormSchema = z.infer<typeof consultationSchema>;

export default function ConsultationsPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Consulta | null>(null);

  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ["consultations"],
    queryFn: listConsultations,
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

  const form = useForm<ConsultationFormSchema>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      data: new Date().toISOString().slice(0, 16),
      animalId: "",
      veterinarioId: "",
      descricao: "",
      observacoes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createConsultation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      toast.success("Consulta registrada!");
      closeModal();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Erro ao registrar consulta")),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ConsultationFormSchema>;
    }) => updateConsultation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      toast.success("Consulta atualizada!");
      closeModal();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Erro ao atualizar consulta")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteConsultation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      toast.success("Consulta removida");
    },
    onError: (error) =>
      toast.error(
        getErrorMessage(error, "Não foi possível remover a consulta")
      ),
  });

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    form.reset();
  };

  const openModal = (consulta?: Consulta) => {
    if (consulta) {
      setEditing(consulta);
      form.reset({
        data: consulta.data.slice(0, 16),
        animalId: consulta.animalId,
        veterinarioId: consulta.veterinarioId,
        descricao: consulta.descricao,
        observacoes: consulta.observacoes ?? "",
      });
    } else {
      setEditing(null);
      form.reset({
        data: new Date().toISOString().slice(0, 16),
        animalId: animals[0]?.id ?? "",
        veterinarioId: vets[0]?.id ?? "",
        descricao: "",
        observacoes: "",
      });
    }
    setOpen(true);
  };

  const handleSubmit: SubmitHandler<ConsultationFormSchema> = (values) => {
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
            Agenda de consultas
          </h2>
          <p className="text-sm text-muted-foreground">
            Visualize e organize os atendimentos clínicos de cada animal.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => openModal()} className="gap-2">
            <Plus className="h-4 w-4" /> Nova consulta
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
              <TableHead>Descrição</TableHead>
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
                  Carregando consultas...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && consultations.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 5 : 4}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Nenhuma consulta agendada.
                </TableCell>
              </TableRow>
            )}
            {consultations.map((consulta) => (
              <TableRow key={consulta.id}>
                <TableCell className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span>
                      {format(new Date(consulta.data), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {animalsMap.get(consulta.animalId) ??
                    `Animal #${consulta.animalId}`}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {vetsMap.get(consulta.veterinarioId) ??
                    `Veterinário #${consulta.veterinarioId}`}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground leading-snug">
                  <p className="font-medium text-foreground">
                    {consulta.descricao}
                  </p>
                  {consulta.observacoes && <span>{consulta.observacoes}</span>}
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
                        <DropdownMenuItem onClick={() => openModal(consulta)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteMutation.mutate(consulta.id)}
                        >
                          Cancelar
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
              {editing ? "Editar consulta" : "Nova consulta"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="grid gap-4 md:grid-cols-2"
            >
              <FormField<ConsultationFormSchema>
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

              <FormField<ConsultationFormSchema>
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

              <FormField<ConsultationFormSchema>
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

              <FormField<ConsultationFormSchema>
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Motivo da consulta, sintomas..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<ConsultationFormSchema>
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Tratamentos, recomendações adicionais..."
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
