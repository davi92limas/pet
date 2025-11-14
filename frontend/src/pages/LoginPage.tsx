import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email({ message: 'Informe um e-mail válido' }),
  password: z.string().min(6, { message: 'No mínimo 6 caracteres' }),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'adm@gmail.com', password: '123456' },
  });
  const { login, loading } = useAuth();

  const handleSubmit = async (values: LoginSchema) => {
    await login(values);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-100 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md border-none shadow-2xl shadow-primary/20">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <PawPrint className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight">Bem-vindo(a) ao HelpPet</CardTitle>
            <CardDescription className="text-muted-foreground">
              Acesse o painel para gerenciar adoções, doações e a rotina da clínica.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seuemail@helppet.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 text-center text-sm text-muted-foreground">
          <p>
            Novo por aqui?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Criar conta
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            Utilize o acesso rápido: <strong>adm@gmail.com</strong> / <strong>123456</strong>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
