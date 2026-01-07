import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";

const FREE_DAILY_LIMIT = 2;

const Index = () => {
  const navigate = useNavigate();
  const [essay, setEssay] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [usageToday, setUsageToday] = useState(0);
  const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false);
  const plansSectionId = "planos";

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

  const handleGrantTestCredit = () => {
    const today = new Date().toISOString().slice(0, 10);
    const nextCount = Math.max(FREE_DAILY_LIMIT - 1, 0);
    window.localStorage.setItem("redacai-usage", JSON.stringify({ date: today, count: nextCount }));
    setUsageToday(nextCount);
    setIsLimitDialogOpen(false);
    toast({
      title: "Crédito liberado para teste",
      description: "Liberamos mais 1 correção gratuita para hoje.",
    });
  };

  const requireAuthThen = async (onAuthenticated: () => void) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      navigate("/auth");
      return;
    }
    onAuthenticated();
  };

  const handleEvaluate = async () => {
    if (!essay.trim()) {
      toast({
        title: "Redação vazia",
        description: "Cole ou escreva sua redação antes de pedir a correção.",
        variant: "destructive",
      });
      return;
    }

    if (remaining <= 0) {
      setIsLimitDialogOpen(true);
      return;
    }

    setIsEvaluating(true);
    setFeedback(null);
    setScore(null);

    try {
      const response = await fetch("https://vehesel.app.n8n.cloud/webhook-test/f1561a92-e4da-4a41-b98d-e6e9a315a5a3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          redacao: essay,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao processar a redação");
      }

      const data = await response.json();

      // n8n retorna um array com objetos que possuem o campo `output`
      const firstItem = Array.isArray(data) ? data[0] : data;
      const output = firstItem?.output ?? firstItem ?? {};

      const evaluationScore = Number(output["nota_geraç"]) || 0;
      const pontosFortes = output.pontos_fortes as string | undefined;
      const pontosMelhorar = output.pontos_a_melhorar as string | undefined;
      const comentariosFinais = output.comentarios_finais as string | undefined;

      const composedFeedback = [
        pontosFortes && `Pontos fortes:\n${pontosFortes}`,
        pontosMelhorar && `Pontos a melhorar:\n${pontosMelhorar}`,
        comentariosFinais && `Comentários finais:\n${comentariosFinais}`,
      ]
        .filter(Boolean)
        .join("\n\n");

      setScore(evaluationScore || null);
      setFeedback(composedFeedback || "Avaliação processada com sucesso.");

      const today = new Date().toISOString().slice(0, 10);
      const nextCount = usageToday + 1;
      window.localStorage.setItem("redacai-usage", JSON.stringify({ date: today, count: nextCount }));
      setUsageToday(nextCount);

      toast({
        title: "Avaliação concluída!",
        description: `Nota: ${evaluationScore}`,
      });
    } catch (error) {
      console.error("Erro ao avaliar redação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua redação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const progressValue = useMemo(() => {
    if (!score) return 0;
    return Math.min(Math.max((score / 1000) * 100, 0), 100);
  }, [score]);

  return (
    <Layout freeDailyLimit={FREE_DAILY_LIMIT} remainingFreeToday={remaining}>
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
            <span className="font-semibold">Créditos gratuitos: {remaining}</span>
            <span className="text-[0.7rem] text-secondary-foreground/80">de {FREE_DAILY_LIMIT} disponíveis hoje</span>
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
                  Créditos grátis usados hoje: <span className="font-semibold text-foreground">{usageToday}</span> / {FREE_DAILY_LIMIT}
                </span>
                <span className="hidden text-muted-foreground md:inline">•</span>
                <span>
                  Restam <span className="font-semibold text-foreground">{remaining}</span> créditos gratuitos hoje.
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

        <section aria-label="Resultado da correção" aria-busy={isEvaluating} className="space-y-3">
          <Card className="h-full border-dashed bg-secondary/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avaliação da IA em tempo real</CardTitle>
              <CardDescription className="text-xs">
                Análise gerada automaticamente a partir da sua redação.
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
            <h2 className="text-sm font-semibold tracking-tight">Escolha seu plano de créditos</h2>
            <p className="max-w-2xl text-xs text-muted-foreground">
              Comece grátis com {FREE_DAILY_LIMIT} créditos diários. Quando quiser intensificar os estudos, escolha um plano de créditos
              que acompanhe o seu ritmo.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Card className="border border-primary/60 bg-card/90 shadow-[var(--shadow-soft)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Gratuito</CardTitle>
              <CardDescription className="text-xs">Ideal para começar a praticar sem compromisso.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-2xl font-semibold">R$ 0</p>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>• {FREE_DAILY_LIMIT} créditos gratuitos por dia</li>
                <li>• Sem cadastro obrigatório</li>
                <li>• Foco em redações estilo ENEM</li>
              </ul>
              <Button size="sm" variant="outline" className="mt-1 w-full text-xs font-medium">
                Usar versão gratuita
              </Button>
            </CardContent>
          </Card>

          <Card className="relative border border-border/80 bg-card/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">30 créditos</CardTitle>
              <CardDescription className="text-xs">Para um mês de prática consistente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-2xl font-semibold">R$ 29,90/mês</p>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>• 30 créditos de correção por mês</li>
                <li>• Ideal para 1 redação por dia útil</li>
                <li>• Acesso prioritário às novas funcionalidades</li>
              </ul>
              <Button
                size="sm"
                variant="hero"
                className="mt-1 w-full text-xs font-medium"
                onClick={() => requireAuthThen(handleGrantTestCredit)}
              >
                Escolher plano 30 créditos (teste)
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-border/80 bg-card/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">100 créditos</CardTitle>
              <CardDescription className="text-xs">Para maratonar redações e simulados.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-2xl font-semibold">R$ 49,90/mês</p>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>• 100 créditos de correção por mês</li>
                <li>• Ideal para alunos e cursinhos intensivos</li>
                <li>• Recursos avançados de acompanhamento (em breve)</li>
              </ul>
              <Button
                size="sm"
                variant="outline"
                className="mt-1 w-full text-xs font-medium"
                onClick={() => requireAuthThen(handleGrantTestCredit)}
              >
                Escolher plano 100 créditos (teste)
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Dialog open={isLimitDialogOpen} onOpenChange={setIsLimitDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Você atingiu o limite de hoje</DialogTitle>
            <DialogDescription>
              Para continuar usando o RedacAI gratuitamente, você pode liberar um crédito extra de teste ou assinar um plano mensal de
              créditos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="w-full text-xs sm:w-auto"
              onClick={() => requireAuthThen(handleGrantTestCredit)}
            >
              Liberar 1 crédito de teste
            </Button>
            <Button
              type="button"
              variant="hero"
              className="w-full text-xs sm:w-auto"
              onClick={() => {
                const section = document.getElementById(plansSectionId);
                section?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Ver planos mensais
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Index;
