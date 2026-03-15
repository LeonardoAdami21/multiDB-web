import { useQuery } from "@tanstack/react-query";
import {
  Database,
  HardDrive,
  Activity,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { metricsApi, billingApi, tenantApi } from "../api/service";
import { Card, StatCard, Progress, Badge, Spinner } from "../components/ui";
import {
  ENGINE_LABELS,
  ENGINE_COLORS,
  formatPercent,
  formatRelative,
} from "../utils";
import { useAuthStore } from "../store/zustand";
import { cn } from "../utils";
import Header from "../components/layout/Header";

export function DashboardPage() {
  const { tenant } = useAuthStore();
  const { data: metrics } = useQuery({
    queryKey: ["metrics"],
    queryFn: metricsApi.tenant,
  });
  const { data: usage } = useQuery({
    queryKey: ["usage"],
    queryFn: billingApi.usage,
  });
  const { data: alerts } = useQuery({
    queryKey: ["alerts"],
    queryFn: tenantApi.alerts,
  });

  const activeAlerts = alerts?.filter((a) => !a.resolvedAt) ?? [];

  return (
    <div className="animate-fade-in">
      <Header
        title={`Olá, ${tenant?.name?.split(" ")[0]} 👋`}
        subtitle="Visão geral da sua plataforma de bancos de dados"
      />

      {/* Alerts */}
      {activeAlerts.length > 0 && (
        <div className="mb-6 flex flex-col gap-2">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-mono border",
                alert.severity === "CRITICAL"
                  ? "bg-red-glow border-red-glow text-brand-red"
                  : "bg-yellow-glow border-yellow-glow text-brand-yellow",
              )}
            >
              <AlertTriangle size={13} />
              <span className="flex-1 text-primary">{alert.message}</span>
              <span className="text-muted text-xs">
                {formatRelative(alert.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Databases"
          value={usage?.usage.databases.used ?? 0}
          sub={`de ${usage?.usage.databases.limit === Infinity ? "∞" : (usage?.usage.databases.limit ?? "–")}`}
          color="#1e90ff"
          icon={<Database size={20} />}
        />
        <StatCard
          label="Requests (mês)"
          value={
            usage
              ? Intl.NumberFormat("pt-BR", { notation: "compact" }).format(
                  usage.usage.requests.used,
                )
              : "–"
          }
          sub={`de ${usage ? Intl.NumberFormat("pt-BR", { notation: "compact" }).format(usage.usage.requests.limit) : "–"}`}
          color="#a78bfa"
          icon={<Activity size={20} />}
        />
        <StatCard
          label="Storage"
          value={usage ? `${usage.usage.storage.usedMb.toFixed(0)} MB` : "–"}
          sub={`de ${usage?.usage.storage.limitMb === Infinity ? "∞" : `${usage?.usage.storage.limitMb} MB`}`}
          color="#00e5a0"
          icon={<HardDrive size={20} />}
        />
        <StatCard
          label="Alertas"
          value={activeAlerts.length}
          color={activeAlerts.length > 0 ? "#f5c518" : "#3d5470"}
          icon={<AlertTriangle size={20} />}
        />
      </div>

      {/* Usage */}
      {usage && (
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <p className="font-display font-semibold text-primary text-sm">
              Uso do Plano
            </p>
            <Badge color="#1e90ff">{usage.plan}</Badge>
          </div>
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
        </Card>
      )}

      {/* Bottom grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="font-display font-semibold text-primary text-sm mb-4">
            Seus Databases
          </p>
          {metrics ? (
            <div className="flex flex-col gap-2">
              {metrics.databases.length === 0 && (
                <p className="text-muted text-xs font-mono">
                  Nenhum database criado
                </p>
              )}
              {metrics.databases.map((db) => (
                <div
                  key={db.id}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-elevated"
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: ENGINE_COLORS[db.engine],
                      boxShadow: `0 0 6px ${ENGINE_COLORS[db.engine]}80`,
                    }}
                  />
                  <span className="flex-1 text-primary text-xs font-mono truncate">
                    {db.name}
                  </span>
                  <span className="text-muted text-xs">
                    {ENGINE_LABELS[db.engine]}
                  </span>
                  <span className="text-muted text-xs w-12 text-right">
                    {db.sizeMb.toFixed(1)} MB
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          )}
        </Card>

        <Card>
          <p className="font-display font-semibold text-primary text-sm mb-4">
            Atividade (24h)
          </p>
          {metrics ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-md bg-elevated">
                <Activity size={14} className="text-accent shrink-0" />
                <span className="flex-1 text-secondary text-xs font-mono">
                  Operações de leitura/escrita
                </span>
                <span className="font-display font-bold text-accent text-base">
                  {metrics.activity.requestsLast24h.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-md bg-elevated">
                <HardDrive size={14} className="text-brand-green shrink-0" />
                <span className="flex-1 text-secondary text-xs font-mono">
                  Backups concluídos
                </span>
                <span className="font-display font-bold text-brand-green text-base">
                  {metrics.activity.completedBackups}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
