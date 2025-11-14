import { useState } from "react";
import type { ComponentProps } from "react";
import {
  useForm,
  Controller,
  useWatch,
  type SubmitHandler,
} from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// removed react-input-mask (findDOMNode incompatível com React 18)
import { listInstitutions } from "@/services/institutions";
import { listCities } from "@/services/cities";
import { upsertMyTutor } from "@/services/tutors";
import { createDonation } from "@/services/donations";
import type { Instituicao } from "@/types";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errors";
import { Building2, Gift, HandHeart, Heart } from "lucide-react";

const donationSchema = z.object({
  nome: z.string().min(3, "Informe seu nome"),
  cpf: z.string().min(14, "CPF inválido"),
  telefone: z.string().min(14, "Telefone inválido"),
  email: z.string().email("E-mail inválido"),
  endereco: z.string().min(5, "Informe o endereço completo"),
  cidadeId: z.string().min(1),
  tipo: z.enum(["PRODUTO", "VALOR"]),
  valor: z.string().optional().or(z.literal("")),
  itens: z.string().optional().or(z.literal("")),
  mensagem: z.string().optional().or(z.literal("")),
});

type DonationFormSchema = z.infer<typeof donationSchema>;

export default function DonationFlowPage() {
  const queryClient = useQueryClient();
  const [selectedInstitution, setSelectedInstitution] =
    useState<Instituicao | null>(null);
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

  const { data: institutions = [], isLoading } = useQuery({
    queryKey: ["institutions"],
    queryFn: listInstitutions,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: listCities,
  });

  const form = useForm<DonationFormSchema>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      telefone: "",
      email: "",
      endereco: "",
      cidadeId: "",
      tipo: "PRODUTO",
      valor: "",
      itens: "",
      mensagem: "",
    },
  });
  const donationType = useWatch({ control: form.control, name: "tipo" });

  const tutorMutation = useMutation({ mutationFn: upsertMyTutor });
  const donationMutation = useMutation({
    mutationFn: createDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
      toast.success(
        "Doação registrada! A instituição receberá uma notificação e retornará em breve."
      );
      form.reset();
      setOpen(false);
      setSelectedInstitution(null);
    },
  });

  const handleDonate = (institution: Instituicao) => {
    setSelectedInstitution(institution);
    form.reset({
      nome: "",
      cpf: "",
      telefone: "",
      email: "",
      endereco: "",
      cidadeId: cities[0]?.id ?? "",
      tipo: "PRODUTO",
      valor: "",
      itens: "",
      mensagem: "",
    });
    setOpen(true);
  };

  const onSubmit: SubmitHandler<DonationFormSchema> = async (values) => {
    try {
      if (!selectedInstitution) return;
      // Cria/atualiza perfil de tutor mínimo exigido pelo backend
      await tutorMutation.mutateAsync({
        telefone: values.telefone,
        endereco: values.endereco,
        cidadeId: values.cidadeId,
      });

      // Criar doação (serviço converte para o formato do backend)
      const parsedValue =
        values.tipo === "VALOR" && values.valor
          ? Number(values.valor.replace(/[^0-9,.]/g, "").replace(",", "."))
          : undefined;
      await donationMutation.mutateAsync({
        instituicaoId: selectedInstitution.id,
        tipo: values.tipo,
        valor: parsedValue && !Number.isNaN(parsedValue) ? parsedValue : undefined,
        itens: values.tipo === "PRODUTO" ? values.itens : undefined,
        mensagem: values.mensagem,
      });
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Não foi possível registrar a doação")
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground">
          Faça a diferença com sua doação
        </h2>
        <p className="text-sm text-muted-foreground">
          Escolha uma instituição e registre sua doação em poucos passos.
          Aceitamos itens, ração, medicamentos e valores.
        </p>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">
          Carregando instituições parceiras...
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {institutions.map((institution) => (
          <Card key={institution.id} className="border-border/60 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />{" "}
                {institution.nome}
              </CardTitle>
              <CardDescription>{institution.descricao}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>Responsável:</strong> {institution.responsavel}
              </p>
              <p>
                <strong>Contato:</strong> {institution.telefone} •{" "}
                {institution.email}
              </p>
              <p>
                <strong>Endereço:</strong> {institution.endereco}
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary">Necessidade atual</Badge>
                <Badge variant="outline" className="text-wrap">
                  {institution.necessidades}
                </Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Sheet
                open={open && selectedInstitution?.id === institution.id}
                onOpenChange={setOpen}
              >
                <SheetTrigger asChild>
                  <Button
                    className="w-full"
                    onClick={() => handleDonate(institution)}
                  >
                    Quero doar
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto sm:max-w-xl">
                  <SheetHeader className="pb-4 text-left">
                    <SheetTitle>Registrar doação</SheetTitle>
                    <SheetDescription>
                      Obrigado por ajudar {selectedInstitution?.nome}. Conte-nos
                      como podemos direcionar sua doação.
                    </SheetDescription>
                  </SheetHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <FormField<DonationFormSchema>
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Seu nome</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <FormField<DonationFormSchema>
                          control={form.control}
                          name="cpf"
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
                        <FormField<DonationFormSchema>
                          control={form.control}
                          name="telefone"
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

                      <FormField<DonationFormSchema>
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="voce@email.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField<DonationFormSchema>
                        control={form.control}
                        name="endereco"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Endereço de retirada (se aplicável)
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Rua, número, complemento"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField<DonationFormSchema>
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

                      <FormField<DonationFormSchema>
                        control={form.control}
                        name="tipo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de doação</FormLabel>
                            <ToggleGroup
                              type="single"
                              value={String(field.value ?? "")}
                              onValueChange={(value) =>
                                value && field.onChange(value)
                              }
                            >
                              <ToggleGroupItem
                                value="PRODUTO"
                                className="gap-2"
                              >
                                <Gift className="h-4 w-4" /> Produtos
                              </ToggleGroupItem>
                              <ToggleGroupItem value="VALOR" className="gap-2">
                                <HandHeart className="h-4 w-4" /> Valor
                                financeiro
                              </ToggleGroupItem>
                            </ToggleGroup>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {donationType === "VALOR" ? (
                        <FormField<DonationFormSchema>
                          control={form.control}
                          name="valor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Valor estimado (R$)</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: 150,00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <FormField<DonationFormSchema>
                          control={form.control}
                          name="itens"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Itens que pretende doar</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={3}
                                  placeholder="Ração, caminhas, medicamentos..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField<DonationFormSchema>
                        control={form.control}
                        name="mensagem"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mensagem para a instituição</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={3}
                                placeholder="Informações adicionais ou combinados"
                                {...field}
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
                          tutorMutation.isPending || donationMutation.isPending
                        }
                      >
                        <Heart className="h-4 w-4" />
                        {tutorMutation.isPending || donationMutation.isPending
                          ? "Enviando..."
                          : "Confirmar doação"}
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
