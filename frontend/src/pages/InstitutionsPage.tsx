import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// removed react-input-mask (findDOMNode incompatível com React 18)
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
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
  listInstitutions,
  createInstitution,
  updateInstitution,
  deleteInstitution,
} from "@/services/institutions";
import { listCities } from "@/services/cities";
import type { Instituicao } from "@/types";
import { toast } from "sonner";
import { Globe2, MapPin, MoreHorizontal, Plus } from "lucide-react";
import { getErrorMessage } from "@/utils/errors";

const institutionSchema = z.object({
  nome: z.string().min(3, "Informe o nome da instituição"),
  responsavel: z.string().min(3, "Informe o responsável"),
  telefone: z.string().min(14, "Telefone inválido"),
  email: z.string().email("E-mail inválido"),
  endereco: z.string().min(5, "Informe o endereço completo"),
  cidadeId: z.string().min(1),
  descricao: z.string().min(10, "Descreva a instituição"),
  necessidades: z.string().min(10, "Informe as principais necessidades"),
  site: z.string().url("Informe uma URL válida").optional().or(z.literal("")),
  imagemUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

type InstitutionFormSchema = z.infer<typeof institutionSchema>;

export default function InstitutionsPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Instituicao | null>(null);
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

  const { data: institutions = [], isLoading } = useQuery({
    queryKey: ["institutions"],
    queryFn: listInstitutions,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: listCities,
  });

  const form = useForm<InstitutionFormSchema>({
    resolver: zodResolver(institutionSchema),
    defaultValues: {
      nome: "",
      responsavel: "",
      telefone: "",
      email: "",
      endereco: "",
      cidadeId: "",
      descricao: "",
      necessidades: "",
      site: "",
      imagemUrl: "",
    },
  });

  const resetModal = () => {
    form.reset();
    setEditing(null);
    setOpen(false);
  };

  const createMutation = useMutation({
    mutationFn: createInstitution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
      toast.success("Instituição cadastrada com sucesso!");
      resetModal();
    },
    onError: (error) =>
      toast.error(
        getErrorMessage(error, "Não foi possível cadastrar a instituição")
      ),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<InstitutionFormSchema>;
    }) => updateInstitution(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
      toast.success("Instituição atualizada!");
      resetModal();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Erro ao atualizar a instituição")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInstitution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
      toast.success("Instituição removida");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Erro ao remover instituição"));
    },
  });

  const handleSubmit: SubmitHandler<InstitutionFormSchema> = (values) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const openModal = (institution?: Instituicao) => {
    if (institution) {
      form.reset({
        nome: institution.nome,
        responsavel: institution.responsavel,
        telefone: institution.telefone,
        email: institution.email,
        endereco: institution.endereco,
        cidadeId: institution.cidadeId,
        descricao: institution.descricao,
        necessidades: institution.necessidades,
        site: institution.site ?? "",
        imagemUrl: institution.imagemUrl ?? "",
      });
      setEditing(institution);
    } else {
      form.reset({
        nome: "",
        responsavel: "",
        telefone: "",
        email: "",
        endereco: "",
        cidadeId: cities[0]?.id ?? "",
        descricao: "",
        necessidades: "",
        site: "",
        imagemUrl: "",
      });
      setEditing(null);
    }
    setOpen(true);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">
            Instituições parceiras
          </h2>
          <p className="text-sm text-muted-foreground">
            Cadastre pontos de entrega e organizações que recebem as doações do
            HelpPet.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => openModal()} className="gap-2">
            <Plus className="h-4 w-4" /> Nova instituição
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow>
              <TableHead>Instituição</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Necessidades</TableHead>
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
                  Carregando instituições...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && institutions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 5 : 4}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Nenhuma instituição cadastrada no momento.
                </TableCell>
              </TableRow>
            )}

            {institutions.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      {item.nome}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.descricao}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium">{item.responsavel}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.telefone}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{item.endereco}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <span>{item.necessidades}</span>
                    {item.site && (
                      <a
                        href={item.site}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary"
                      >
                        <Globe2 className="h-3 w-3" /> site oficial
                      </a>
                    )}
                  </div>
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
                        <DropdownMenuItem onClick={() => openModal(item)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteMutation.mutate(item.id)}
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
              {editing ? "Editar instituição" : "Nova instituição"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="grid gap-4 md:grid-cols-2"
            >
              <FormField<InstitutionFormSchema>
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="ONG Patinhas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField<InstitutionFormSchema>
                control={form.control}
                name="responsavel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do responsável" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<InstitutionFormSchema>
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

              <FormField<InstitutionFormSchema>
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contato@instituicao.org"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<InstitutionFormSchema>
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
                      <SelectContent className="max-h-56">
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

              <FormField<InstitutionFormSchema>
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, número, bairro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<InstitutionFormSchema>
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Conte um pouco sobre a instituição"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<InstitutionFormSchema>
                control={form.control}
                name="necessidades"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Necessidades atuais</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Ração, medicamentos, itens de higiene..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<InstitutionFormSchema>
                control={form.control}
                name="site"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site oficial</FormLabel>
                    <FormControl>
                      <Input placeholder="https://" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<InstitutionFormSchema>
                control={form.control}
                name="imagemUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner (URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={resetModal}>
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
