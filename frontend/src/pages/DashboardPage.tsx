import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { StatCard } from '@/components/dashboard/StatCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { fetchDashboardMetrics } from '@/services/dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { FullscreenLoader } from '@/components/ui/fullscreen-loader';
import { HandHeart, PawPrint, Building2, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const chartColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardMetrics,
  });

  if (!isAdmin) {
    return <Navigate to="/app/animais" replace />;
  }

  if (isLoading || !data) {
    return <FullscreenLoader message="Carregando indicadores" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Painel de Impacto</h2>
        <p className="text-sm text-muted-foreground">
          Acompanhe as ações de reabilitação, adoção e doação do HelpPet em tempo real.
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">Atualização automática</Badge>
          <Badge variant="outline">Dados consolidados</Badge>
          <Badge variant="secondary">Indicadores estratégicos</Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Animais sob cuidado"
          value={data.totalAnimais}
          subtitle="Resgatados e acompanhados pela equipe"
          icon={<PawPrint className="h-5 w-5 text-primary" />}
          trend={{ value: '+12% vs. mês anterior', positive: true }}
        />
        <StatCard
          title="Adoções concluídas"
          value={data.totalAdocoes}
          subtitle="Famílias impactadas"
          icon={<HandHeart className="h-5 w-5 text-primary" />}
          trend={{ value: '+8 adoções esta semana', positive: true }}
        />
        <StatCard
          title="Instituições ativas"
          value={data.totalInstituicoes}
          subtitle="Parceiros recebendo doações"
          icon={<Building2 className="h-5 w-5 text-primary" />}
          trend={{ value: '2 novas neste mês', positive: true }}
        />
        <StatCard
          title="Doações registradas"
          value={data.totalDoacoes}
          subtitle="Itens e valores direcionados"
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          trend={{ value: '+18% em relação ao mês anterior', positive: true }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Adoções nos últimos meses"
          description="Comparativo mensal de adoções aprovadas"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.adocoesUltimosMeses}>
              <defs>
                <linearGradient id="colorAdocoes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', borderRadius: 12 }} />
              <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="url(#colorAdocoes)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Captação de doações"
          description="Distribuição de itens e valores doados"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.doacoesUltimosMeses}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', borderRadius: 12 }} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Perfil dos animais"
          description="Distribuição por porte"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', borderRadius: 12 }} />
              <Pie
                data={(data.animaisPorPorte ? Object.entries(data.animaisPorPorte) : []).map(([porte, total]) => ({
                  name: porte,
                  value: total,
                }))}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                stroke="transparent"
              >
                {(data.animaisPorPorte ? Object.keys(data.animaisPorPorte) : []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Linha do tempo de atividades" description="Cirurgias e consultas registradas">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.adocoesUltimosMeses}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', borderRadius: 12 }} />
              <Line type="monotone" dataKey="total" stroke="hsl(var(--accent))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
