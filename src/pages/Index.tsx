import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";

const FREE_DAILY_LIMIT = 2;

const Index = () => {
  const [essay, setEssay] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [usageToday, setUsageToday] = useState(0);

  // Controle simples em localStorage para modo gratuito
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const stored = window.localStorage.getItem("redacai-usage");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { date: string; count: number };
        if (parsed.date === today) {
          setUsageToday(parsed.count);
        }
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const remaining = useMemo(() => Math.max(FREE_DAILY_LIMIT - usageToday, 0), [usageToday]);

  const handleEvaluate = () => {
    if (!essay.trim()) {
      toast({
        title: "Redação vazia",
        description: "Cole ou escreva sua redação antes de pedir a correção.",
        variant: "destructive",
      });
      return;
    }

    if (remaining <= 0) {
      toast({
        title: "Limite diário atingido",
        description: "Você já usou suas 2 correções gratuitas de hoje. Conheça os planos para continuar praticando.",
        variant: "destructive",
      });
      return;
    }

    setIsEvaluating(true);
    setFeedback(null);
    setScore(null);

    // Simulação de avaliação por IA (fictícia neste MVP)
    setTimeout(() => {
      const simulatedScore = 860;
      const simulatedFeedback = `Sua redação demonstra boa compreensão da proposta e articula argumentos de forma consistente.

Pontos fortes:
• Tese clara logo na introdução, alinhada ao tema proposto.
• Uso adequado de conectivos, garantindo coesão entre os parágrafos.
• Proposta de intervenção detalhada, com agente, ação, meio, efeito e modo.

O que pode melhorar:
• Aumentar a variedade vocabular para evitar repetições excessivas de termos-chave.
• Revisar alguns períodos muito longos, dividindo-os em frases mais curtas para facilitar a leitura.
• Explorar mais um repertório sociocultural legitimado (dados, citações ou fatos históricos) para fortalecer os argumentos.

Em um cenário real de ENEM, esta redação teria boa chance de alcançar acima de 800 pontos, com margem para se aproximar da nota máxima com ajustes finos em repertório e clareza sintática.`;

      const today = new Date().toISOString().slice(0, 10);
      const nextCount = usageToday + 1;
      window.localStorage.setItem("redacai-usage", JSON.stringify({ date: today, count: nextCount }));
      setUsageToday(nextCount);

      setScore(simulatedScore);
      setFeedback(simulatedFeedback);
      setIsEvaluating(false);
    }, 900);
  };

  const progressValue = useMemo(() => {
    if (!score) return 0;
    return Math.min(Math.max((score / 1000) * 100, 0), 100);
  }, [score]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--muted))_0,_hsl(var(--background))_55%)]">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-sm font-semibold text-primary">
              RA
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">RedacAI</p>
              <p className="text-xs text-muted-foreground">Correção inteligente para redações ENEM</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden text-xs font-medium text-muted-foreground md:inline-flex">
              {remaining > 0 ? `${remaining} correções grátis hoje` : "Limite grátis de hoje usado"}
            </Badge>
            <Button size="sm" variant="ghost" className="text-xs font-medium text-muted-foreground">
              Entrar
            </Button>
            <Button size="sm" variant="hero" className="text-xs font-medium">
              Ver planos
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-12 pt-6 md:px-6 md:pt-10">
        <section className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Corrija suas redações no estilo ENEM com feedback de IA em segundos
              </h1>
              <p className="text-sm text-muted-foreground md:text-base">
                Cole sua redação, clique em <span className="font-semibold">Corrigir</span> e receba uma avaliação detalhada com pontos
                fortes, ajustes recomendados e uma nota simulada.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Modo gratuito: {FREE_DAILY_LIMIT} correções/dia sem cadastro
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-[minmax(0,_3fr)_minmax(0,_2.1fr)]">
          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
              <div>
                <CardTitle className="text-sm font-medium">Sua redação</CardTitle>
                <CardDescription className="text-xs">
                  Escreva ou cole o texto completo. Foque no formato ENEM, mas o RedacAI é flexível para outros estilos.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[0.68rem] font-medium">
                Beta inicial
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder="Comece sua introdução apresentando o tema, desenvolva dois parágrafos argumentativos e finalize com uma proposta de intervenção completa..."
                className="min-h-[260px] resize-none border-input bg-background text-sm leading-relaxed focus-visible:ring-1 focus-visible:ring-ring"
              />
              <div className="flex flex-col justify-between gap-3 border-t border-dashed border-border/70 pt-3 text-xs text-muted-foreground md:flex-row md:items-center">
                <div className="flex flex-wrap items-center gap-2">
                  <span>
                    Correções hoje: <span className="font-semibold text-foreground">{usageToday}</span> / {FREE_DAILY_LIMIT}
                  </span>
                  <span className="hidden text-muted-foreground md:inline">•</span>
                  <span>
                    Restam <span className="font-semibold text-foreground">{remaining}</span> correções gratuitas hoje.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="lg"
                    variant="hero"
                    className="w-full md:w-auto"
                    onClick={handleEvaluate}
                    disabled={isEvaluating}
                  >
                    {isEvaluating ? "Analisando redação..." : "Corrigir redação"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <section aria-label="Resultado da correção" className="space-y-3">
            <Card className="h-full border-dashed bg-secondary/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avaliação da IA (exemplo fictício)</CardTitle>
                <CardDescription className="text-xs">
                  Em breve, esta análise será gerada em tempo real por IA conectada ao seu fluxo no n8n.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Tabs defaultValue="visao-geral" className="space-y-3">
                  <TabsList className="grid w-full grid-cols-2 bg-secondary/80">
                    <TabsTrigger value="visao-geral" className="text-xs">
                      Visão geral
                    </TabsTrigger>
                    <TabsTrigger value="detalhado" className="text-xs">
                      Competências ENEM
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="visao-geral" className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-muted-foreground">Nota simulada</span>
                        <span className="font-semibold text-foreground">{score ?? "–"} / 1000</span>
                      </div>
                      <Progress value={progressValue} className="h-1.5" />
                    </div>
                    <div className="rounded-md bg-card p-3 text-xs leading-relaxed text-muted-foreground shadow-sm">
                      {feedback ? (
                        feedback.split("\n").map((paragraph, idx) => (
                          <p key={idx} className={idx > 0 ? "mt-2" : ""}>
                            {paragraph}
                          </p>
                        ))
                      ) : (
                        <p>
                          Aqui você verá uma análise completa da sua redação, com comentários sobre tese, argumentação, coesão, repertório
                          e proposta de intervenção.
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="detalhado" className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
                      {[1, 2, 3, 4, 5].map((comp) => (
                        <div key={comp} className="space-y-1 rounded-md bg-card p-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Competência {comp}</span>
                            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[0.7rem] font-medium text-primary-soft-foreground">
                              {score ? `${Math.round((score / 5 / 200) * 200)}/200` : "–/200"}
                            </span>
                          </div>
                          <p className="text-[0.72rem] text-muted-foreground">
                            Comentário orientativo sobre como esta competência se manifesta na redação e o que pode ser aprimorado.
                          </p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </section>
        </section>

        <section id="planos" className="mt-2 space-y-3 border-t border-dashed border-border/70 pt-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold tracking-tight">Planos para levar suas redações a outro nível</h2>
              <p className="text-xs text-muted-foreground max-w-2xl">
                Comece grátis com até {FREE_DAILY_LIMIT} correções diárias. Quando estiver pronto para intensificar os estudos, migre para um plano
                com limite mensal ampliado e histórico de redações.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Card className="border border-border/80 bg-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Gratuito</CardTitle>
                <CardDescription className="text-xs">Ideal para testar o RedacAI e praticar ocasionalmente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <p className="text-2xl font-semibold">R$ 0</p>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li>• {FREE_DAILY_LIMIT} correções por dia</li>
                  <li>• Foco em redações estilo ENEM</li>
                  <li>• Feedback instantâneo fictício (nesta versão)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative border border-primary/40 bg-gradient-to-tr from-primary-soft/60 to-background shadow-[var(--shadow-soft)]">
              <div className="absolute right-3 top-3 rounded-full bg-primary px-2 py-0.5 text-[0.65rem] font-semibold text-primary-foreground">
                Em breve
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Plano Intensivo</CardTitle>
                <CardDescription className="text-xs">Para quem faz redações toda semana.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <p className="text-2xl font-semibold">R$ 29/mês</p>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li>• 40 a 60 correções por mês</li>
                  <li>• Histórico de redações corrigidas</li>
                  <li>• Feedback detalhado por competência</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-border/80 bg-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Plano Turbo</CardTitle>
                <CardDescription className="text-xs">Para cursinhos, professores e alunos avançados.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <p className="text-2xl font-semibold">R$ 59/mês</p>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li>• 120+ correções por mês</li>
                  <li>• Espaço para múltiplos perfis de aluno</li>
                  <li>• Priorização nas filas de correção</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <footer className="border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <div className="flex flex-col justify-between gap-2 pb-4 md:flex-row md:items-center">
            <p>RedacAI – focado em texto, inspirado na prova de redação do ENEM.</p>
            <p className="text-[0.7rem]">
              Futuramente integrado a fluxos de IA via n8n • Este é um protótipo visual, sem correções reais ainda.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
