import { useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  listAnimals,
  createAnimal,
  updateAnimal,
  deleteAnimal,
} from "@/services/animals";
import type { Animal } from "@/types";
import { toast } from "sonner";
import { MoreHorizontal, PawPrint, Plus } from "lucide-react";
import { getErrorMessage } from "@/utils/errors";

const animalSchema = z.object({
  nome: z.string().min(3, "Informe o nome do animal"),
  especie: z.string().min(3, "Informe a espécie"),
  raca: z.string().min(2, "Informe a raça"),
  idade: z.number().min(0).max(20),
  sexo: z.enum(["MACHO", "FEMEA"]),
  porte: z.enum(["PEQUENO", "MEDIO", "GRANDE"]),
  temperamento: z.string().min(3, "Descreva o temperamento"),
  descricao: z.string().min(10, "Descreva as características principais"),
  fotoUrl: z
    .string()
    .url("Informe uma URL válida")
    .optional()
    .or(z.literal("")),
});

type AnimalFormSchema = z.infer<typeof animalSchema>;

export default function AnimalsPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);

  const { data: animals = [], isLoading } = useQuery({
    queryKey: ["animals"],
    queryFn: listAnimals,
  });

  const form = useForm<AnimalFormSchema>({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      nome: "",
      especie: "",
      raca: "",
      idade: 0,
      sexo: "FEMEA",
      porte: "MEDIO",
      temperamento: "",
      descricao: "",
      fotoUrl: "",
    } satisfies AnimalFormSchema,
  });

  const resetModal = () => {
    form.reset();
    setEditingAnimal(null);
    setOpen(false);
  };

  const createMutation = useMutation({
    mutationFn: createAnimal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      toast.success("Animal cadastrado com sucesso!");
      resetModal();
    },
    onError: () => toast.error("Não foi possível cadastrar o animal"),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<AnimalFormSchema>;
    }) => updateAnimal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      toast.success("Informações atualizadas!");
      resetModal();
    },
    onError: () => toast.error("Erro ao atualizar o animal"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAnimal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      toast.success("Animal removido.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Erro ao remover animal"));
    },
  });

  const handleSubmit: SubmitHandler<AnimalFormSchema> = (values) => {
    if (editingAnimal) {
      updateMutation.mutate({ id: editingAnimal.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const openCreateModal = () => {
    form.reset({
      nome: "",
      especie: "",
      raca: "",
      idade: 0,
      sexo: "FEMEA",
      porte: "MEDIO",
      temperamento: "",
      descricao: "",
      fotoUrl: "",
    });
    setEditingAnimal(null);
    setOpen(true);
  };

  const openEditModal = (animal: Animal) => {
    form.reset({
      nome: animal.nome,
      especie: animal.especie,
      raca: animal.raca,
      idade: animal.idade,
      sexo: animal.sexo,
      porte: animal.porte,
      temperamento: animal.temperamento,
      descricao: animal.descricao,
      fotoUrl: animal.fotoUrl ?? "",
    });
    setEditingAnimal(animal);
    setOpen(true);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const formattedData = useMemo(() => {
    return animals.map((animal) => ({
      ...animal,
      idadeFormatada: `${animal.idade} ano${animal.idade !== 1 ? "s" : ""}`,
      porteLabel:
        animal.porte === "PEQUENO"
          ? "Pequeno"
          : animal.porte === "MEDIO"
          ? "Médio"
          : "Grande",
    }));
  }, [animals]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">
            Catálogo de animais
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os animais em reabilitação e acompanhe os status de adoção.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="h-4 w-4" /> Novo animal
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow>
              <TableHead className="w-[180px]">Identificação</TableHead>
              <TableHead>Espécie/Raça</TableHead>
              <TableHead>Porte</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Temperamento</TableHead>
              {isAdmin && (
                <TableHead className="w-[80px] text-right">Ações</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 6 : 5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Carregando animais...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && animals.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 6 : 5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Nenhum animal cadastrado até o momento.
                </TableCell>
              </TableRow>
            )}

            {formattedData.map((animal) => (
              <TableRow key={animal.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <PawPrint className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">
                        {animal.nome}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {animal.idadeFormatada}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {animal.especie}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {animal.raca}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {animal.porteLabel.toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      animal.status === "DISPONIVEL" ? "outline" : "secondary"
                    }
                  >
                    {animal.status === "DISPONIVEL" ? "Disponível" : "Adotado"}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-sm text-sm text-muted-foreground">
                  {animal.temperamento}
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
                        <DropdownMenuItem onClick={() => openEditModal(animal)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteMutation.mutate(animal.id)}
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
              {editingAnimal ? "Editar animal" : "Cadastrar novo animal"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="grid gap-4 md:grid-cols-2"
            >
              <FormField<AnimalFormSchema>
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do animal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<AnimalFormSchema>
                control={form.control}
                name="especie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Espécie</FormLabel>
                    <FormControl>
                      <Input placeholder="Cachorro, Gato..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<AnimalFormSchema>
                control={form.control}
                name="raca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raça</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="SRD, Vira-lata, Poodle..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<AnimalFormSchema>
                control={form.control}
                name="idade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idade (anos)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        value={field.value ?? 0}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? 0 : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<AnimalFormSchema>
                control={form.control}
                name="sexo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={String(field.value ?? "")}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MACHO">Macho</SelectItem>
                        <SelectItem value="FEMEA">Fêmea</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<AnimalFormSchema>
                control={form.control}
                name="porte"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Porte</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={String(field.value ?? "")}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PEQUENO">Pequeno</SelectItem>
                        <SelectItem value="MEDIO">Médio</SelectItem>
                        <SelectItem value="GRANDE">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<AnimalFormSchema>
                control={form.control}
                name="temperamento"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Temperamento</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: dócil, brincalhão, calmo"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<AnimalFormSchema>
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Histórico, cuidados especiais..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<AnimalFormSchema>
                control={form.control}
                name="fotoUrl"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Foto (URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
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
                    : editingAnimal
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
