// src/pages/DatabaseDetailPage.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  Play,
  RotateCcw,
  Layers,
  HardDrive,
  Code2,
  ChevronDown,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { databaseApi, schemaApi, backupApi } from "../api/service";
import {
  Card,
  Button,
  Badge,
  Spinner,
  EmptyState,
  CodeBlock,
} from "../components/ui";
import {
  ENGINE_COLORS,
  ENGINE_LABELS,
  STATUS_COLORS,
  formatBytes,
  formatRelative,
  getErrorMessage,
  cn,
} from "../utils";
import toast from "react-hot-toast";
import type { ModelDefinition, FieldDefinition } from "../types";
import Header from "../components/layout/Header";

const FIELD_TYPES = [
  "String",
  "Int",
  "BigInt",
  "Float",
  "Decimal",
  "Boolean",
  "DateTime",
  "Json",
  "Bytes",
];

function defaultField(): FieldDefinition {
  return { name: "", type: "String", required: true };
}
function defaultModel(): ModelDefinition {
  return {
    name: "",
    fields: [
      { name: "id", type: "Int", id: true, autoincrement: true },
      { name: "createdAt", type: "DateTime", defaultNow: true },
      { name: "updatedAt", type: "DateTime", updatedAt: true },
    ],
  };
}

const TABS = [
  { key: "schemas", label: "Schemas", icon: <Layers size={13} /> },
  { key: "backups", label: "Backups", icon: <HardDrive size={13} /> },
  { key: "explorer", label: "Explorer", icon: <Code2 size={13} /> },
];

const inputCls =
  "w-full px-2 py-1 rounded text-xs font-mono bg-elevated border border-border text-primary outline-none focus:border-accent transition-colors";

export function DatabaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"schemas" | "backups" | "explorer">("schemas");
  const [showSchemaBuilder, setShowSchemaBuilder] = useState(false);
  const [models, setModels] = useState<ModelDefinition[]>([defaultModel()]);
  const [expandedModel, setExpandedModel] = useState<number | null>(0);

  const { data: db } = useQuery({
    queryKey: ["database", id],
    queryFn: () => databaseApi.get(id!),
  });
  const { data: schemas } = useQuery({
    queryKey: ["schemas", id],
    queryFn: () => schemaApi.list(id!),
  });
  const { data: backups } = useQuery({
    queryKey: ["backups", id],
    queryFn: () => backupApi.list(id!),
  });

  const createSchema = useMutation({
    mutationFn: () => schemaApi.create(id!, { models }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schemas", id] });
      setShowSchemaBuilder(false);
      toast.success("Schema criado");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const applySchema = useMutation({
    mutationFn: (schemaId: string) => schemaApi.apply(id!, schemaId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schemas", id] });
      toast.success("Migration aplicada!");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const createBackup = useMutation({
    mutationFn: (label?: string) => backupApi.create(id!, label),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["backups", id] });
      toast.success("Backup iniciado");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const addModel = () => setModels((m) => [...m, defaultModel()]);
  const addField = (mi: number) =>
    setModels((m) =>
      m.map((mod, i) =>
        i === mi ? { ...mod, fields: [...mod.fields, defaultField()] } : mod,
      ),
    );
  const updateModel = (mi: number, key: string, val: string) =>
    setModels((m) =>
      m.map((mod, i) => (i === mi ? { ...mod, [key]: val } : mod)),
    );
  const updateField = (mi: number, fi: number, key: string, val: unknown) =>
    setModels((m) =>
      m.map((mod, i) =>
        i === mi
          ? {
              ...mod,
              fields: mod.fields.map((f, j) =>
                j === fi ? { ...f, [key]: val } : f,
              ),
            }
          : mod,
      ),
    );
  const removeField = (mi: number, fi: number) =>
    setModels((m) =>
      m.map((mod, i) =>
        i === mi
          ? { ...mod, fields: mod.fields.filter((_, j) => j !== fi) }
          : mod,
      ),
    );

  if (!db)
    return (
      <div className="flex justify-center py-20">
        <Spinner size={24} />
      </div>
    );

  return (
    <div className="animate-fade-in">
      <Header
        title={db.name}
        subtitle={`${ENGINE_LABELS[db.engine]} · ${formatBytes(db.sizeBytes)} · ${db.status}`}
        action={
          <Button
            variant="ghost"
            icon={<ArrowLeft size={13} />}
            onClick={() => navigate("/databases")}
          >
            Voltar
          </Button>
        }
      />

      {/* Info badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge color={ENGINE_COLORS[db.engine]}>
          {ENGINE_LABELS[db.engine]}
        </Badge>
        <Badge color={STATUS_COLORS[db.status]}>{db.status}</Badge>
        <Badge>{formatBytes(db.sizeBytes)}</Badge>
        <Badge>{formatRelative(db.createdAt)}</Badge>
        {db._count && <Badge>{db._count.schemas} schemas</Badge>}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border mb-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-xs font-mono cursor-pointer bg-transparent border-0 transition-all border-b-2 -mb-px",
              tab === t.key
                ? "text-accent border-accent"
                : "text-muted border-transparent hover:text-secondary",
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SCHEMAS ── */}
      {tab === "schemas" && (
        <div>
          <div className="flex justify-end mb-4">
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={12} />}
              onClick={() => setShowSchemaBuilder((v) => !v)}
            >
              Novo Schema
            </Button>
          </div>

          {showSchemaBuilder && (
            <Card className="mb-5 animate-fade-in">
              <p className="font-display font-semibold text-primary mb-4">
                Schema Builder
              </p>

              {models.map((model, mi) => (
                <div
                  key={mi}
                  className="border border-border rounded-lg mb-2.5 overflow-hidden"
                >
                  {/* Model header */}
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 bg-elevated cursor-pointer"
                    onClick={() =>
                      setExpandedModel(expandedModel === mi ? null : mi)
                    }
                  >
                    {expandedModel === mi ? (
                      <ChevronDown size={12} className="text-muted" />
                    ) : (
                      <ChevronRight size={12} className="text-muted" />
                    )}
                    <input
                      value={model.name}
                      onChange={(e) => updateModel(mi, "name", e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="NomeDoModelo"
                      className="flex-1 bg-transparent border-none outline-none font-mono font-semibold text-primary text-sm"
                    />
                    <span
                      className="text-muted font-mono"
                      style={{ fontSize: "0.65rem" }}
                    >
                      {model.fields.length} campos
                    </span>
                  </div>

                  {expandedModel === mi && (
                    <div className="p-3">
                      {/* Column headers */}
                      <div
                        className="grid gap-1.5 mb-2"
                        style={{
                          gridTemplateColumns: "1fr 120px 56px 56px 20px",
                        }}
                      >
                        {["Nome", "Tipo", "Req.", "Uniq.", ""].map((h) => (
                          <span
                            key={h}
                            className="text-muted font-mono uppercase tracking-widest"
                            style={{ fontSize: "0.6rem" }}
                          >
                            {h}
                          </span>
                        ))}
                      </div>

                      {model.fields.map((field, fi) => (
                        <div
                          key={fi}
                          className="grid gap-1.5 mb-1.5 items-center"
                          style={{
                            gridTemplateColumns: "1fr 120px 56px 56px 20px",
                          }}
                        >
                          <input
                            value={field.name}
                            onChange={(e) =>
                              updateField(mi, fi, "name", e.target.value)
                            }
                            placeholder="nomeCampo"
                            className={inputCls}
                          />
                          <select
                            value={field.type}
                            onChange={(e) =>
                              updateField(mi, fi, "type", e.target.value)
                            }
                            className={inputCls}
                          >
                            {FIELD_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={field.required !== false}
                              onChange={(e) =>
                                updateField(
                                  mi,
                                  fi,
                                  "required",
                                  e.target.checked,
                                )
                              }
                              className="w-4 h-4 accent-accent"
                            />
                          </div>
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={!!field.unique}
                              onChange={(e) =>
                                updateField(mi, fi, "unique", e.target.checked)
                              }
                              className="w-4 h-4 accent-accent"
                            />
                          </div>
                          <button
                            onClick={() => removeField(mi, fi)}
                            className="text-muted hover:text-brand-red transition-colors bg-transparent border-none cursor-pointer p-0"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}

                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Plus size={11} />}
                        onClick={() => addField(mi)}
                        className="mt-2"
                      >
                        Adicionar campo
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Plus size={11} />}
                  onClick={addModel}
                >
                  Novo modelo
                </Button>
                <div className="ml-auto flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowSchemaBuilder(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    loading={createSchema.isPending}
                    onClick={() => createSchema.mutate()}
                  >
                    Salvar Schema
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {schemas?.length === 0 ? (
            <EmptyState
              icon={<Layers size={36} />}
              title="Nenhum schema"
              description="Crie o primeiro schema para este database"
            />
          ) : (
            <div className="flex flex-col gap-2">
              {schemas?.map((schema) => (
                <Card key={schema.id}>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-primary text-sm">
                          v{schema.version}
                        </span>
                        <Badge color={STATUS_COLORS[schema.status]}>
                          {schema.status}
                        </Badge>
                        {(schema.definition as any)?.models?.length > 0 && (
                          <span
                            className="text-muted font-mono"
                            style={{ fontSize: "0.68rem" }}
                          >
                            {(schema.definition as any).models.length} modelo(s)
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3 mt-1">
                        <span
                          className="text-muted font-mono"
                          style={{ fontSize: "0.68rem" }}
                        >
                          Criado {formatRelative(schema.createdAt)}
                        </span>
                        {schema.appliedAt && (
                          <span
                            className="text-muted font-mono"
                            style={{ fontSize: "0.68rem" }}
                          >
                            Aplicado {formatRelative(schema.appliedAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    {schema.status === "DRAFT" && (
                      <Button
                        size="sm"
                        variant="success"
                        icon={<Play size={11} />}
                        loading={applySchema.isPending}
                        onClick={() => applySchema.mutate(schema.id)}
                      >
                        Aplicar Migration
                      </Button>
                    )}
                    {schema.status === "APPLIED" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<RotateCcw size={11} />}
                        onClick={() => {
                          if (confirm("Rollback para esta versão?"))
                            schemaApi.rollback(id!, schema.version);
                        }}
                      >
                        Rollback
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── BACKUPS ── */}
      {tab === "backups" && (
        <div>
          <div className="flex justify-end mb-4">
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={12} />}
              loading={createBackup.isPending}
              onClick={() => {
                const label =
                  prompt("Label do backup (opcional):") ?? undefined;
                createBackup.mutate(label);
              }}
            >
              Backup Agora
            </Button>
          </div>

          {backups?.length === 0 ? (
            <EmptyState
              icon={<HardDrive size={36} />}
              title="Nenhum backup"
              description="Crie um backup manual ou ative backups automáticos no seu plano"
            />
          ) : (
            <div className="flex flex-col gap-2">
              {backups?.map((backup) => (
                <Card key={backup.id}>
                  <div className="flex items-center gap-3">
                    <HardDrive
                      size={15}
                      style={{ color: STATUS_COLORS[backup.status] }}
                      className="shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-primary text-sm">
                          {backup.label ??
                            `Backup ${backup.type.toLowerCase()}`}
                        </span>
                        <Badge color={STATUS_COLORS[backup.status]}>
                          {backup.status}
                        </Badge>
                        <Badge>{backup.type}</Badge>
                      </div>
                      <div className="flex gap-3 mt-1">
                        {[
                          `${Number(backup.sizeBytes) > 0 ? formatBytes(backup.sizeBytes) : "—"}`,
                          formatRelative(backup.createdAt),
                          backup.expiresAt
                            ? `Expira ${formatRelative(backup.expiresAt)}`
                            : null,
                        ]
                          .filter(Boolean)
                          .map((t) => (
                            <span
                              key={t!}
                              className="text-muted font-mono"
                              style={{ fontSize: "0.68rem" }}
                            >
                              {t}
                            </span>
                          ))}
                      </div>
                    </div>
                    {backup.status === "COMPLETED" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<RotateCcw size={11} />}
                        onClick={() => {
                          if (confirm("Restaurar este backup?"))
                            backupApi.restore(id!, backup.id);
                        }}
                      >
                        Restaurar
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── EXPLORER ── */}
      {tab === "explorer" && (
        <div className="flex flex-col gap-4">
          <Card>
            <p className="text-secondary text-sm font-mono mb-3">
              Acesse seus dados via REST com sua API Key:
            </p>
            <CodeBlock
              language="bash"
              code={`# Listar registros
GET /api/v1/data/${id}/{NomeDoModelo}?limit=20&page=1
X-API-Key: sk_live_xxxx

# Criar registro
POST /api/v1/data/${id}/{NomeDoModelo}
X-API-Key: sk_live_xxxx
Content-Type: application/json

# GraphQL endpoint
POST /api/v1/graphql/${id}
X-API-Key: sk_live_xxxx`}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
