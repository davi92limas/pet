import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  PawPrint,
  LayoutDashboard,
  Building2,
  HandHeart,
  HeartHandshake,
  Stethoscope,
  Syringe,
  MapPin,
  Users2,
  ClipboardList,
  Menu,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  roles?: Array<"ADMIN" | "USER">;
}

const baseNavigation: NavItem[] = [
  { label: "Animais", to: "/app/animais", icon: PawPrint },
  { label: "Fluxo de Adoção", to: "/app/adocao", icon: HandHeart },
  { label: "Minhas Adoções", to: "/app/minhas-adocoes", icon: HeartHandshake },
  { label: "Instituições", to: "/app/instituicoes", icon: Building2 },
  { label: "Doações", to: "/app/doacao", icon: ClipboardList },
  { label: "Minhas Doações", to: "/app/minhas-doacoes", icon: ClipboardList },
];

const adminNavigation: NavItem[] = [
  {
    label: "Dashboard",
    to: "/app/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN"],
  },
  {
    label: "Consultas",
    to: "/app/consultas",
    icon: Stethoscope,
    roles: ["ADMIN"],
  },
  { label: "Cirurgias", to: "/app/cirurgias", icon: Syringe, roles: ["ADMIN"] },
  { label: "Cidades", to: "/app/cidades", icon: MapPin, roles: ["ADMIN"] },
  {
    label: "Veterinários",
    to: "/app/veterinarios",
    icon: Stethoscope,
    roles: ["ADMIN"],
  },
  { label: "Tutores", to: "/app/tutores", icon: Users2, roles: ["ADMIN"] },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const navItems = [...adminNavigation, ...baseNavigation].filter((item) => {
    if (!item.roles) return true;
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center gap-3 px-4 pt-6">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <PawPrint className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-semibold">HelpPet</h1>
          <p className="text-xs text-muted-foreground">
            Clínica de reabilitação
          </p>
        </div>
      </div>

      <div className="px-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="text-xs">Alternar tema</span>
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive: match }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
                  match || isActive
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 pb-6">
        <Separator className="mb-4" />
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-primary/30">
            <AvatarImage
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name ?? "Usuário"
              )}&background=7C3AED&color=fff`}
              alt={user?.name}
            />
            <AvatarFallback>
              {user?.name?.slice(0, 2).toUpperCase() ?? "US"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium leading-tight">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
            <p className="text-[11px] text-primary font-semibold">
              {user?.role === "ADMIN" ? "Administrador" : "Colaborador"}
            </p>
          </div>
        </div>
        <Button
          className="mt-4 w-full gap-2"
          variant="outline"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden w-72 border-r lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button
            className="absolute right-4 top-4 z-40 lg:hidden"
            variant="outline"
            size="icon"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="flex-1">
        <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Bem-vindo(a)
              </p>
              <h2 className="text-lg font-semibold text-foreground">
                {user?.name?.split(" ")[0] ?? "Visitante"}
              </h2>
            </div>
            <div className="hidden items-center gap-3 lg:flex">
              <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
                Tema: {theme === "dark" ? "Escuro" : "Claro"}
              </span>
              <Separator orientation="vertical" className="h-6" />
              <Avatar className="h-10 w-10 border border-primary/30">
                <AvatarImage
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.name ?? "Usuário"
                  )}&background=7C3AED&color=fff`}
                />
                <AvatarFallback>
                  {user?.name?.slice(0, 2).toUpperCase() ?? "US"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <div className="min-h-[calc(100vh-4rem)] bg-muted/40 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
