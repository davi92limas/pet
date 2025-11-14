import { useState } from "react";
import type { ComponentProps } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// removed react-input-mask (findDOMNode incompatível com React 18)
import { listAnimals } from "@/services/animals";
import { listCities } from "@/services/cities";
import { upsertMyTutor, listTutors } from "@/services/tutors";
import { createAdoption } from "@/services/adoptions";
import type { Animal } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PawPrint, Sparkle, HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errors";

const adoptionSchema = z.object({
  tutorNome: z.string().min(3, "Informe o nome"),
  tutorCpf: z.string().min(14, "CPF inválido"),
  tutorEmail: z.string().email("E-mail inválido"),
  tutorTelefone: z.string().min(14, "Telefone inválido"),
  endereco: z.string().min(5, "Informe o endereço completo"),
  cidadeId: z.string().min(1, "Selecione uma cidade"),
  possuiAnimais: z.boolean(),
  mensagem: z.string().min(10, "Conte um pouco sobre você"),
});

type AdoptionFormSchema = z.infer<typeof adoptionSchema>;

export default function AdoptionFlowPage() {
  const queryClient = useQueryClient();
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [open, setOpen] = useState(false);
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

  const { data: animals = [], isLoading } = useQuery({
    queryKey: ["animals"],
    queryFn: listAnimals,
  });

  const availableAnimals = animals.filter(
    (animal) => animal.status === "DISPONIVEL"
  );

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: listCities,
  });
  const { data: tutors = [] } = useQuery({
    queryKey: ["tutors"],
    queryFn: listTutors,
  });

  const form = useForm<AdoptionFormSchema>({
    resolver: zodResolver(adoptionSchema),
    defaultValues: {
      tutorNome: "",
      tutorCpf: "",
      tutorEmail: "",
      tutorTelefone: "",
      endereco: "",
      cidadeId: "",
      possuiAnimais: false,
      mensagem: "",
    },
  });

  const tutorMutation = useMutation({
    mutationFn: upsertMyTutor,
  });

  const adoptionMutation = useMutation({
    mutationFn: createAdoption,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      toast.success(
        "Adoção registrada! Nossa equipe entrará em contato para agendar a entrega."
      );
      if (data) {
        localStorage.setItem(
          "@helppet:last_adoption",
          JSON.stringify({
            id: data.id,
            animalId: data.animalId,
            tutorId: data.tutorId,
          })
        );
      }
      setOpen(false);
      setSelectedAnimal(null);
      form.reset();
    },
  });

  const handleAdopt = (animal: Animal) => {
    if (!cities.length) {
      toast.error(
        "Não foi possível carregar as cidades. Tente novamente em instantes."
      );
      return;
    }
    setSelectedAnimal(animal);
    form.reset({
      tutorNome: "",
      tutorCpf: "",
      tutorEmail: "",
      tutorTelefone: "",
      endereco: "",
      cidadeId: cities[0]?.id ?? "",
      possuiAnimais: false,
      mensagem: "",
    });
    setOpen(true);
  };

  const onSubmit: SubmitHandler<AdoptionFormSchema> = async (values) => {
    try {
      if (!selectedAnimal) return;
      const existingTutor = tutors.find((tutor) => {
        const cpfMatch = tutor.cpf === values.tutorCpf;
        const emailMatch =
          tutor?.email && values?.tutorEmail
            ? tutor.email.toLowerCase() === values.tutorEmail.toLowerCase()
            : false;
        return cpfMatch || emailMatch;
      });

      // Cria/atualiza perfil de tutor mínimo exigido pelo backend
      if (!existingTutor) {
        await tutorMutation.mutateAsync({
          telefone: values.tutorTelefone,
          endereco: values.endereco,
          cidadeId: values.cidadeId,
        });
        await queryClient.invalidateQueries({ queryKey: ["tutors"] });
      }

      const adoption = await adoptionMutation.mutateAsync({
        animalId: selectedAnimal.id,
        observacoes: values.mensagem,
      });
      if (adoption) {
        localStorage.setItem(
          "@helppet:last_adoption",
          JSON.stringify({
            id: adoption.id,
            animalId: selectedAnimal.id,
            userId: (adoption as any).userId ?? null,
          })
        );
      }
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Não foi possível registrar a adoção")
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground">
          Encontre seu novo melhor amigo
        </h2>
        <p className="text-sm text-muted-foreground">
          Escolha um animal e preencha o formulário rápido para iniciar o
          processo de adoção responsável.
        </p>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">
          Carregando animais disponíveis...
        </p>
      )}

      {!isLoading && availableAnimals.length === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Sparkle className="h-4 w-4 text-primary" /> Todos os animais
              foram adotados!
            </CardTitle>
            <CardDescription>
              Continue acompanhando nosso painel, em breve novos resgates
              ficarão disponíveis para adoção.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {availableAnimals.map((animal) => (
          <Card
            key={animal.id}
            className="relative overflow-hidden border-border/60 shadow-sm"
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <PawPrint className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {animal.nome}
                  </CardTitle>
                  <CardDescription>
                    {animal.especie} • {animal.raca} • {animal.idade} ano(s)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {animal.descricao}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">
                  Porte: {animal.porte ? animal.porte.toLowerCase() : "indefinido"}
                </Badge>
                <Badge variant="secondary">
                  Temperamento: {animal.temperamento ?? "indefinido"}
                </Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Sheet
                open={open && selectedAnimal?.id === animal.id}
                onOpenChange={(status) => {
                  setOpen(status);
                  if (!status) {
                    setSelectedAnimal(null);
                    form.reset();
                  }
                }}
              >
                <SheetTrigger asChild>
                  <Button
                    className="w-full"
                    onClick={() => handleAdopt(animal)}
                  >
                    Quero adotar
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto sm:max-w-xl">
                  <SheetHeader className="pb-4">
                    <SheetTitle className="text-left">
                      Formulário de adoção responsável
                    </SheetTitle>
                    <SheetDescription className="text-left">
                      Conte-nos sobre você para que possamos preparar a melhor
                      adaptação para {selectedAnimal?.nome}.
                    </SheetDescription>
                  </SheetHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <FormField<AdoptionFormSchema>
                        control={form.control}
                        name="tutorNome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome completo</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Seu nome"
                                {...field}
                                value={String(field.value ?? "")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <FormField<AdoptionFormSchema>
                          control={form.control}
                          name="tutorCpf"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CPF</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="000.000.000-00"
                                  value={String(field.value ?? "")}
                                  onChange={(e) =>
                                    field.onChange(formatCPF(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField<AdoptionFormSchema>
                          control={form.control}
                          name="tutorTelefone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="(00) 90000-0000"
                                  value={String(field.value ?? "")}
                                  onChange={(e) =>
                                    field.onChange(formatPhone(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField<AdoptionFormSchema>
                        control={form.control}
                        name="tutorEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="voce@email.com"
                                {...field}
                                value={String(field.value ?? "")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField<AdoptionFormSchema>
                        control={form.control}
                        name="endereco"
                        render={({ field }) => (
                          <FormItem>
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

                      <FormField<AdoptionFormSchema>
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
                                  <SelectItem
                                    key={city.id}
                                value={city.id}
                                  >
                                    {city.nome} - {city.estado}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField<AdoptionFormSchema>
                        control={form.control}
                        name="possuiAnimais"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">
                                Você já possui outros animais?
                              </FormLabel>
                              <p className="text-xs text-muted-foreground">
                                Isso nos ajuda a planejar a adaptação e as
                                visitas domiciliares.
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

                      <FormField<AdoptionFormSchema>
                        control={form.control}
                        name="mensagem"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mensagem para a equipe</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={4}
                                placeholder="Conte-nos sobre sua rotina e o lar do novo amigo."
                                {...field}
                                value={String(field.value ?? "")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full gap-2"
                        disabled={
                          tutorMutation.isPending || adoptionMutation.isPending
                        }
                      >
                        <HeartHandshake className="h-4 w-4" />
                        {tutorMutation.isPending || adoptionMutation.isPending
                          ? "Enviando..."
                          : "Enviar pedido de adoção"}
                      </Button>
                    </form>
                  </Form>
                </SheetContent>
              </Sheet>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
