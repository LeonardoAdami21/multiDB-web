import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Key,
  Copy,
  Eye,
  EyeOff,
  X,
  Check,
  ShieldOff,
} from "lucide-react";
import { apiKeyApi } from "../api/service";
import { Card, Button, ScopeTag, EmptyState, Spinner } from "../components/ui";
import { formatRelative, formatDate, getErrorMessage, cn } from "../utils";
import toast from "react-hot-toast";
import Header from "../components/layout/Header";

const ALL_SCOPES = [
  "db:read",
  "db:write",
  "db:delete",
  "schema:manage",
  "admin:full",
];

const ApiKeyPage = () => {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(["db:read", "db:write"]);
  const [expiresAt, setExpiresAt] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const { data: keys, isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: apiKeyApi.list,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiKeyApi.create({ name, scopes, expiresAt: expiresAt || undefined }),
    onSuccess: (key) => {
      qc.invalidateQueries({ queryKey: ["api-keys"] });
      setNewKey(key.key ?? null);
      setShowCreate(false);
      setName("");
      setScopes(["db:read", "db:write"]);
      setExpiresAt("");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const revokeMutation = useMutation({
    mutationFn: apiKeyApi.revoke,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API Key revogada");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <div className="animate-fade-in">
      <Header
        title="API Keys"
        subtitle="Gerencie as chaves de acesso à sua plataforma"
        action={
          <Button
            variant="primary"
            icon={<Plus size={13} />}
            onClick={() => setShowCreate(true)}
          >
            Nova API Key
          </Button>
        }
      />

      {/* New key reveal */}
      {newKey && (
        <div className="animate-fade-in mb-5 p-4 rounded-lg bg-green-glow border border-green-glow">
          <div className="flex items-center gap-2 mb-3">
            <Check size={13} className="text-brand-green" />
            <span className="text-brand-green text-xs font-mono font-medium">
              API Key criada — copie agora, não será exibida novamente
            </span>
          </div>
          <div className="flex items-center gap-2">
            <code
              className={cn(
                "flex-1 px-3 py-2 rounded-md bg-base border border-border text-primary text-xs font-mono tracking-wide transition-all",
                !showKey && "blur-sm select-none",
              )}
            >
              {newKey}
            </code>
            <button
              onClick={() => setShowKey((v) => !v)}
              className="p-1.5 text-muted hover:text-secondary bg-transparent border-none cursor-pointer"
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <Button
              size="sm"
              icon={<Copy size={12} />}
              onClick={() => {
                navigator.clipboard.writeText(newKey);
                toast.success("Copiado!");
              }}
            >
              Copiar
            </Button>
            <button
              onClick={() => setNewKey(null)}
              className="p-1.5 text-muted hover:text-secondary bg-transparent border-none cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <Card className="mb-6 animate-fade-in">
          <p className="font-display font-semibold text-primary mb-4">
            Nova API Key
          </p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-secondary text-xs font-mono block mb-1.5">
                Nome
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Production Key"
                className="w-full px-3 py-2 rounded-md bg-elevated border border-border text-primary text-sm font-mono outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="text-secondary text-xs font-mono block mb-2">
                Escopos
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_SCOPES.map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      setScopes((p) =>
                        p.includes(s) ? p.filter((x) => x !== s) : [...p, s],
                      )
                    }
                    className={cn(
                      "px-2.5 py-1 rounded text-xs font-mono cursor-pointer border transition-all",
                      scopes.includes(s)
                        ? "bg-accent/10 border-accent/30 text-accent"
                        : "bg-elevated border-border text-muted hover:text-secondary",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-secondary text-xs font-mono block mb-1.5">
                Expira em (opcional)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="px-3 py-2 rounded-md bg-elevated border border-border text-primary text-sm font-mono outline-none focus:border-accent transition-colors"
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

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size={24} />
        </div>
      ) : keys?.length === 0 ? (
        <EmptyState
          icon={<Key size={36} />}
          title="Nenhuma API Key"
          description="Crie uma chave para acessar seus bancos"
          action={
            <Button
              variant="primary"
              icon={<Plus size={13} />}
              onClick={() => setShowCreate(true)}
            >
              Criar API Key
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {keys?.map((key) => (
            <Card key={key.id}>
              <div className="flex items-start gap-3">
                <Key
                  size={15}
                  className={
                    key.isActive
                      ? "text-accent mt-0.5 shrink-0"
                      : "text-muted mt-0.5 shrink-0"
                  }
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono font-medium text-primary text-sm">
                      {key.name}
                    </span>
                    {!key.isActive && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-red-glow border border-red-glow text-brand-red font-mono">
                        Revogada
                      </span>
                    )}
                  </div>
                  <code className="text-muted text-xs font-mono tracking-wider block mb-2">
                    {key.keyPrefix}
                  </code>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {key.scopes.map((s) => (
                      <ScopeTag key={s} scope={s} />
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <span
                      className="text-muted font-mono"
                      style={{ fontSize: "0.65rem" }}
                    >
                      Criada {formatRelative(key.createdAt)}
                    </span>
                    {key.lastUsedAt && (
                      <span
                        className="text-muted font-mono"
                        style={{ fontSize: "0.65rem" }}
                      >
                        Usada {formatRelative(key.lastUsedAt)}
                      </span>
                    )}
                    {key.expiresAt && (
                      <span
                        className="text-brand-yellow font-mono"
                        style={{ fontSize: "0.65rem" }}
                      >
                        Expira {formatDate(key.expiresAt)}
                      </span>
                    )}
                  </div>
                </div>
                {key.isActive && (
                  <Button
                    size="sm"
                    variant="danger"
                    icon={<ShieldOff size={12} />}
                    loading={revokeMutation.isPending}
                    onClick={() => {
                      if (confirm("Revogar esta chave?"))
                        revokeMutation.mutate(key.id);
                    }}
                  >
                    Revogar
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApiKeyPage;
