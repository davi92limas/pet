import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-white to-purple-50 p-4">
      <Card className="max-w-md border-none shadow-xl shadow-primary/20">
        <CardHeader className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <PawPrint className="h-6 w-6" />
          </div>
          <div className="space-y-1 text-left">
            <CardTitle className="text-2xl font-bold">Página não encontrada</CardTitle>
            <CardDescription>
              O caminho que você tentou acessar não existe. Vamos voltar para a área principal do HelpPet.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex justify-end">
          <Button asChild>
            <Link to="/app">Voltar ao painel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
