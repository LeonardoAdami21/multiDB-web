import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Webhook,
  Trash2,
  Activity,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { webhookApi } from "../api/service";
import { Card, Button, Badge, EmptyState, Spinner } from "../components/ui";
import { formatRelative, getErrorMessage, cn } from "../utils";
import toast from "react-hot-toast";
import Header from "../components/layout/Header";

const ALL_EVENTS = [
  "record.created",
  "record.updated",
  "record.deleted",
  "schema.migrated",
  "backup.completed",
  "quota.warning",
];

const WebhookPage = () => {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>([
    "record.created",
    "record.updated",
    "record.deleted",
  ]);
  const [models, setModels] = useState("");
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);

  const { data: webhooks, isLoading } = useQuery({
    queryKey: ["webhooks"],
    queryFn: webhookApi.list,
  });
  const { data: deliveries } = useQuery({
    queryKey: ["deliveries", selectedWebhook],
    queryFn: () => webhookApi.deliveries(selectedWebhook!),
    enabled: !!selectedWebhook,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      webhookApi.create({
        name,
        url,
        events,
        models: models
          ? models
              .split(",")
              .map((m) => m.trim())
              .filter(Boolean)
          : [],
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["webhooks"] });
      setShowCreate(false);
      toast.success("Webhook criado");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: webhookApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Deletado");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const inputCls =
    "w-full px-3 py-2 rounded-md bg-elevated border border-border text-primary text-sm font-mono outline-none focus:border-accent transition-colors";

  return (
    <div className="animate-fade-in">
      <Header
        title="Webhooks"
        subtitle="Receba eventos em tempo real quando seus dados mudarem"
        action={
          <Button
            variant="primary"
            icon={<Plus size={13} />}
            onClick={() => setShowCreate(true)}
          >
            Novo Webhook
          </Button>
        }
      />

      {showCreate && (
        <Card className="mb-6 animate-fade-in">
          <p className="font-display font-semibold text-primary mb-4">
            Novo Webhook
          </p>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-secondary text-xs font-mono block mb-1.5">
                  Nome
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Meu Webhook"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-secondary text-xs font-mono block mb-1.5">
                  URL
                </label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://myapp.com/webhook"
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="text-secondary text-xs font-mono block mb-2">
                Eventos
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_EVENTS.map((ev) => (
                  <button
                    key={ev}
                    onClick={() =>
                      setEvents((p) =>
                        p.includes(ev) ? p.filter((x) => x !== ev) : [...p, ev],
                      )
                    }
                    className={cn(
                      "px-2.5 py-1 rounded text-xs font-mono cursor-pointer border transition-all",
                      events.includes(ev)
                        ? "bg-accent/10 border-accent/30 text-accent"
                        : "bg-elevated border-border text-muted hover:text-secondary",
                    )}
                  >
                    {ev}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-secondary text-xs font-mono block mb-1.5">
                Modelos (separado por vírgula, vazio = todos)
              </label>
              <input
                value={models}
                onChange={(e) => setModels(e.target.value)}
                placeholder="Post, User"
                className={inputCls}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant="primary"
              loading={createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Criar
            </Button>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      <div
        className={cn(
          "grid gap-4",
          selectedWebhook ? "grid-cols-2" : "grid-cols-1",
        )}
      >
        <div>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size={24} />
            </div>
          ) : webhooks?.length === 0 ? (
            <EmptyState
              icon={<Webhook size={36} />}
              title="Nenhum webhook"
              description="Configure webhooks para receber eventos"
            />
          ) : (
            <div className="flex flex-col gap-2">
              {webhooks?.map((hook) => (
                <Card
                  key={hook.id}
                  hoverable
                  onClick={() =>
                    setSelectedWebhook(
                      hook.id === selectedWebhook ? null : hook.id,
                    )
                  }
                >
                  <div className="flex items-start gap-2.5">
                    <Webhook
                      size={14}
                      className="text-accent mt-0.5 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-medium text-primary text-sm">
                          {hook.name}
                        </span>
                        <Badge color={hook.isActive ? "#00e5a0" : "#3d5470"}>
                          {hook.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <span className="text-muted text-xs font-mono block mb-2 truncate">
                        {hook.url}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {hook.events.map((ev) => (
                          <Badge key={ev}>{ev}</Badge>
                        ))}
                      </div>
                      <span
                        className="text-muted font-mono block mt-1.5"
                        style={{ fontSize: "0.65rem" }}
                      >
                        Criado {formatRelative(hook.createdAt)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Deletar?")) deleteMutation.mutate(hook.id);
                      }}
                      className="p-1 text-muted hover:text-brand-red hover:bg-red-glow rounded transition-all cursor-pointer bg-transparent border-none"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {selectedWebhook && (
          <div className="animate-fade-in">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Activity size={13} className="text-accent" />
                <span className="font-display font-semibold text-primary text-sm">
                  Histórico de Entregas
                </span>
              </div>
              {!deliveries ? (
                <div className="flex justify-center py-6">
                  <Spinner />
                </div>
              ) : deliveries.length === 0 ? (
                <p className="text-muted text-xs font-mono">
                  Nenhuma entrega ainda
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {deliveries.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-elevated"
                    >
                      {d.success ? (
                        <CheckCircle
                          size={12}
                          className="text-brand-green shrink-0"
                        />
                      ) : (
                        <XCircle
                          size={12}
                          className="text-brand-red shrink-0"
                        />
                      )}
                      <span className="flex-1 text-secondary text-xs font-mono">
                        {d.event}
                      </span>
                      {d.statusCode && (
                        <Badge color={d.success ? "#00e5a0" : "#ff4d6a"}>
                          {d.statusCode}
                        </Badge>
                      )}
                      <span
                        className="text-muted font-mono"
                        style={{ fontSize: "0.65rem" }}
                      >
                        {formatRelative(d.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebhookPage;
