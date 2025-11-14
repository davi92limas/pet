import { useState } from "react";
import type { ComponentProps } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// removed react-input-mask (findDOMNode incompatível com React 18)
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import {
  listTutors,
  upsertMyTutor,
  updateTutor,
  deleteTutor,
} from "@/services/tutors";
import { listCities } from "@/services/cities";
import type { Tutor } from "@/types";
import { toast } from "sonner";
import { MoreHorizontal, Plus, UserRound } from "lucide-react";
import { getErrorMessage } from "@/utils/errors";

const tutorSchema = z.object({
  nome: z.string().min(3, "Informe o nome"),
  cpf: z.string().min(14, "CPF inválido"),
  telefone: z.string().min(14, "Telefone inválido"),
  email: z.string().email("E-mail inválido"),
  endereco: z.string().min(5, "Informe o endereço"),
  cidadeId: z.string().min(1),
  possuiAnimais: z.boolean(),
});

type TutorFormSchema = z.infer<typeof tutorSchema>;

export default function TutorsPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tutor | null>(null);

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    const part1 = digits.slice(0, 3);
    const part2 = digits.slice(3, 6);
    const part3 = digits.slice(6, 9);
    const part4 = digits.slice(9, 11);
    if (digits.length > 9) return `${part1}.${part2}.${part3}-${part4}`;
    if (digits.length > 6) return `${part1}.${part2}.${part3}`;
    if (digits.length > 3) return `${part1}.${part2}`;
    return part1;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    const ddd = digits.slice(0, 2);
    const mid = digits.length > 10 ? digits.slice(2, 7) : digits.slice(2, 6);
    const end = digits.length > 10 ? digits.slice(7, 11) : digits.slice(6, 10);
    if (digits.length > 6) return `(${ddd}) ${mid}-${end}`;
    if (digits.length > 2) return `(${ddd}) ${mid}`;
    if (digits.length > 0) return `(${ddd}`;
    return "";
  };

  const { data: tutors = [], isLoading } = useQuery({
    queryKey: ["tutors"],
    queryFn: listTutors,
  });
  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: listCities,
  });
  const cityMap = new Map(
    cities.map((city) => [city.id, `${city.nome} - ${city.estado}`])
  );

  const form = useForm<TutorFormSchema>({
    resolver: zodResolver(tutorSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      telefone: "",
      email: "",
      endereco: "",
      cidadeId: "",
      possuiAnimais: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: upsertMyTutor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
      toast.success("Tutor cadastrado!");
      closeModal();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Erro ao cadastrar tutor")),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TutorFormSchema>;
    }) => updateTutor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
      toast.success("Tutor atualizado!");
      closeModal();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Erro ao atualizar tutor")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTutor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
      toast.success("Tutor removido");
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Não é possível remover este tutor")),
  });

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    form.reset();
  };

  const handleSubmit: SubmitHandler<TutorFormSchema> = (values) => {
    const payload = {
      telefone: values.telefone,
      endereco: values.endereco,
      cidadeId: values.cidadeId,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openModal = (tutor?: Tutor) => {
    if (tutor) {
      setEditing(tutor);
      form.reset({
        nome: tutor.nome,
        cpf: tutor.cpf,
        telefone: tutor.telefone,
        email: tutor.email,
        endereco: tutor.endereco,
        cidadeId: tutor.cidadeId,
        possuiAnimais: tutor.possuiAnimais,
      });
    } else {
      setEditing(null);
      form.reset({
        nome: "",
        cpf: "",
        telefone: "",
        email: "",
        endereco: "",
        cidadeId: cities[0]?.id ?? "",
        possuiAnimais: false,
      });
    }
    setOpen(true);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">
            Rede de tutores
          </h2>
          <p className="text-sm text-muted-foreground">
            Cadastre potenciais adotantes e acompanhe o histórico de adoções e
            denúncias.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => openModal()} className="gap-2">
            <Plus className="h-4 w-4" /> Novo tutor
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow>
              <TableHead>Tutor</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Possui animais?</TableHead>
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
                  Carregando tutores...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && tutors.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 5 : 4}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Nenhum tutor cadastrado.
                </TableCell>
              </TableRow>
            )}
            {tutors.map((tutor) => (
              <TableRow key={tutor.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UserRound className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {tutor.nome}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        CPF {tutor.cpf}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground leading-snug">
                  <p>{tutor.email}</p>
                  <p>{tutor.telefone}</p>
                  <p>{tutor.endereco}</p>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {cityMap.get(tutor.cidadeId) ?? `Cidade #${tutor.cidadeId}`}
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium text-muted-foreground">
                    {tutor.possuiAnimais
                      ? "Sim, possui outros animais"
                      : "Não possui"}
                  </span>
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
                        <DropdownMenuItem onClick={() => openModal(tutor)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteMutation.mutate(tutor.id)}
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
            <DialogTitle>{editing ? "Editar tutor" : "Novo tutor"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="grid gap-4 md:grid-cols-2"
            >
              <FormField<TutorFormSchema>
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome do tutor"
                        {...field}
                        value={String(field.value ?? "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<TutorFormSchema>
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        value={field.value}
                        onChange={(e) => field.onChange(formatCPF(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<TutorFormSchema>
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(00) 90000-0000"
                        value={field.value}
                        onChange={(e) => field.onChange(formatPhone(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<TutorFormSchema>
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        {...field}
                        value={String(field.value ?? "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<TutorFormSchema>
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Endereço completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rua, número, bairro"
                        {...field}
                        value={String(field.value ?? "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<TutorFormSchema>
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

              <FormField<TutorFormSchema>
                control={form.control}
                name="possuiAnimais"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4 md:col-span-2">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium">
                        Possui outros animais?
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Essa informação nos ajuda a planejar as visitas de
                        adaptação.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
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
