import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode;
  freeDailyLimit: number;
  remainingFreeToday: number;
}

export function Layout({ children, freeDailyLimit, remainingFreeToday }: LayoutProps) {
  const navigate = useNavigate();
  const { user, isLoading } = useAuthStatus();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const initials = user?.user_metadata?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--muted))_0,_hsl(var(--background))_55%)]">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-sm font-semibold text-primary">
              RA
            </div>
            <div className="leading-tight text-left">
              <p className="text-sm font-semibold tracking-tight">RedacAI</p>
              <p className="text-xs text-muted-foreground">Correção inteligente para redações ENEM</p>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden text-xs font-medium text-muted-foreground md:inline-flex">
              {remainingFreeToday > 0
                ? `${remainingFreeToday} correções grátis hoje de ${freeDailyLimit}`
                : "Limite grátis de hoje usado"}
            </Badge>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1 text-xs shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-[0.7rem] font-semibold text-primary">
                      {initials || "RA"}
                    </div>
                    <span className="hidden text-xs font-medium text-foreground sm:inline">
                      {user.email}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs">
                    Logado como
                    <div className="truncate text-[0.7rem] font-normal text-muted-foreground">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs" disabled>
                    Minha conta (em breve)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs text-destructive" onClick={handleLogout}>
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs font-medium text-muted-foreground"
                  onClick={() => navigate("/auth")}
                  disabled={isLoading}
                >
                  Entrar
                </Button>
                <Button
                  size="sm"
                  variant="hero"
                  className="text-xs font-medium"
                  onClick={() => {
                    const section = document.getElementById("planos");
                    section?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  disabled={isLoading}
                >
                  Assinar Plataforma
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-12 pt-6 md:px-6 md:pt-10">{children}</main>
    </div>
  );
}
