import { useQuery, useMutation } from "@tanstack/react-query";
import { Check, CreditCard, HardDrive, Activity } from "lucide-react";
import { billingApi } from "../api/service";
import { Card, Button, Progress, Spinner, StatCard } from "../components/ui";
import { formatPercent, getErrorMessage, cn } from "../utils";
import { useAuthStore } from "../store/zustand";
import toast from "react-hot-toast";
import Header from "../components/layout/Header";

const PLANS = [
  {
    key: "FREE",
    name: "Free",
    price: "R$ 0",
    color: "#7a9bb5",
    features: [
      "1 database",
      "500 MB storage",
      "10k req/mês",
      "Community support",
    ],
  },
  {
    key: "STARTER",
    name: "Starter",
    price: "R$ 49/mês",
    color: "#1e90ff",
    features: [
      "5 databases",
      "10 GB storage",
      "500k req/mês",
      "Backup diário 7d",
      "5 webhooks",
    ],
  },
  {
    key: "PRO",
    name: "Pro",
    price: "R$ 199/mês",
    color: "#a78bfa",
    features: [
      "25 databases",
      "100 GB storage",
      "10M req/mês",
      "Backup semanal 30d",
      "50 webhooks",
      "Modelos ilimitados",
    ],
  },
  {
    key: "ENTERPRISE",
    name: "Enterprise",
    price: "Sob consulta",
    color: "#f5c518",
    features: [
      "∞ databases",
      "∞ storage",
      "∞ requests",
      "PITR 7 dias",
      "∞ webhooks",
      "Suporte dedicado",
    ],
  },
];

const BillingPage = () => {
  const { tenant, updateTenant } = useAuthStore();
  const { data: usage, isLoading } = useQuery({
    queryKey: ["usage"],
    queryFn: billingApi.usage,
  });

  const changePlan = useMutation({
    mutationFn: billingApi.changePlan,
    onSuccess: (res) => {
      updateTenant({ plan: res.plan as any });
      toast.success(`Plano alterado para ${res.plan}`);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size={24} />
      </div>
    );

  const req = usage?.usage.requests;
  const stor = usage?.usage.storage;
  const dbs = usage?.usage.databases;

  return (
    <div className="animate-fade-in">
      <Header title="Billing" subtitle="Gerencie seu plano e acompanhe o uso" />

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard
          label="Requests este mês"
          value={
            req
              ? Intl.NumberFormat("pt-BR", { notation: "compact" }).format(
                  req.used,
                )
              : "–"
          }
          sub={`de ${req ? Intl.NumberFormat("pt-BR", { notation: "compact" }).format(req.limit) : "–"}`}
          color="#1e90ff"
          icon={<Activity size={20} />}
        />
        <StatCard
          label="Storage usado"
          value={stor ? `${stor.usedMb.toFixed(0)} MB` : "–"}
          sub={`de ${stor?.limitMb === Infinity ? "∞" : `${stor?.limitMb} MB`}`}
          color="#00e5a0"
          icon={<HardDrive size={20} />}
        />
        <StatCard
          label="Databases ativos"
          value={dbs?.used ?? "–"}
          sub={`de ${dbs?.limit === Infinity ? "∞" : (dbs?.limit ?? "–")}`}
          color="#a78bfa"
          icon={<CreditCard size={20} />}
        />
      </div>

      {usage && (
        <Card className="mb-6">
          <p className="font-display font-semibold text-primary text-sm mb-4">
            Uso atual — <span className="text-secondary">{usage.period}</span>
          </p>
          <div className="flex flex-col gap-3">
            <Progress
              value={formatPercent(
                usage.usage.requests.used,
                usage.usage.requests.limit,
              )}
              label="Requests"
            />
            <Progress
              value={formatPercent(
                usage.usage.storage.usedMb,
                usage.usage.storage.limitMb,
              )}
              label="Storage"
            />
            <Progress
              value={formatPercent(
                usage.usage.databases.used,
                usage.usage.databases.limit,
              )}
              label="Databases"
            />
          </div>
          {usage.overage.total > 0 && (
            <div className="mt-4 px-3 py-2.5 rounded-md bg-yellow-glow border border-yellow-glow">
              <p className="text-brand-yellow text-xs font-mono font-medium">
                Overage estimado: R$ {usage.overage.total.toFixed(2)}
              </p>
              {usage.overage.items.map((item, i) => (
                <p key={i} className="text-secondary text-xs font-mono mt-1">
                  · {item.resource}: R$ {item.cost.toFixed(2)}
                </p>
              ))}
            </div>
          )}
        </Card>
      )}

      <p className="font-display font-bold text-primary mb-4">
        Planos disponíveis
      </p>
      <div className="grid grid-cols-4 gap-3">
        {PLANS.map((plan) => {
          const isCurrent = tenant?.plan === plan.key;
          return (
            <div
              key={plan.key}
              className={cn(
                "flex flex-col p-5 rounded-xl border transition-all",
                isCurrent ? "border-current" : "border-border bg-surface",
              )}
              style={
                isCurrent
                  ? { background: `${plan.color}10`, borderColor: plan.color }
                  : {}
              }
            >
              <div className="mb-4">
                <p
                  className="font-display font-bold text-base"
                  style={{ color: plan.color }}
                >
                  {plan.name}
                </p>
                <p className="text-secondary text-xs font-mono mt-1">
                  {plan.price}
                </p>
              </div>
              <div className="flex-1 flex flex-col gap-2 mb-5">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-1.5">
                    <Check
                      size={10}
                      className="mt-1 shrink-0"
                      style={{ color: plan.color }}
                    />
                    <span className="text-secondary text-xs font-mono leading-snug">
                      {f}
                    </span>
                  </div>
                ))}
              </div>
              {isCurrent ? (
                <div
                  className="text-center py-1.5 rounded-md border text-xs font-mono"
                  style={{
                    color: plan.color,
                    background: `${plan.color}15`,
                    borderColor: `${plan.color}30`,
                  }}
                >
                  Plano Atual
                </div>
              ) : (
                <Button
                  size="sm"
                  variant={plan.key === "PRO" ? "primary" : "secondary"}
                  loading={changePlan.isPending}
                  onClick={() => changePlan.mutate(plan.key)}
                  className="w-full justify-center"
                >
                  {plan.key === "ENTERPRISE"
                    ? "Falar com vendas"
                    : "Mudar para este"}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BillingPage;
