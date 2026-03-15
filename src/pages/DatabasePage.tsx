import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Database, Trash2, ChevronRight, RefreshCw } from "lucide-react";
import { databaseApi } from "../api/service";
import { Card, Button, Badge, EmptyState, Spinner } from "../components/ui";
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
import type { Database as DB } from "../types";
import Header from "../components/layout/Header";

const ENGINE_OPTIONS = [
  { value: "POSTGRESQL", label: "PostgreSQL", desc: "Relacional avançado" },
  { value: "MYSQL", label: "MySQL", desc: "Relacional popular" },
  { value: "MONGODB", label: "MongoDB", desc: "Documentos NoSQL" },
  { value: "SQLITE", label: "SQLite", desc: "Leve e embutido" },
];

const DatabasePage: React.FC = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [engine, setEngine] = useState("POSTGRESQL");

  const { data: databases, isLoading } = useQuery({
    queryKey: ["database"],
    queryFn: databaseApi.list,
    refetchInterval: 5000,
  });

  const createMutation = useMutation({
    mutationFn: () => databaseApi.create({ name, engine }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["database"] });
      toast.success("Provisionando...");
      setShowCreate(false);
      setName("");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: databaseApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["database"] });
      toast.success("Database deletado");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <div className="animate-fade-in">
      <Header
        title="Databases"
        subtitle="Gerencie seus bancos de dados provisionados"
        action={
          <Button
            variant="primary"
            icon={<Plus size={13} />}
            onClick={() => setShowCreate(true)}
          >
            Novo Banco de Dados
          </Button>
        }
      />

      {showCreate && (
        <Card className="mb-6 animate-fade-in">
          <p className="font-display font-semibold text-primary mb-4">
            Novo Database
          </p>

          <div className="mb-4">
            <label className="text-secondary text-xs font-mono block mb-1.5">
              Nome
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="meu-banco-db"
              className="w-full px-3 py-2 rounded-md bg-elevated border border-border text-primary text-sm font-mono outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="mb-5">
            <label className="text-secondary text-xs font-mono block mb-2">
              Engine
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ENGINE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setEngine(opt.value)}
                  className={cn(
                    "px-3 py-2.5 rounded-lg text-left cursor-pointer transition-all border",
                    engine === opt.value
                      ? "border-current"
                      : "bg-elevated border-border hover:border-border-bright",
                  )}
                  style={
                    engine === opt.value
                      ? {
                          background: `${ENGINE_COLORS[opt.value]}18`,
                          borderColor: ENGINE_COLORS[opt.value],
                        }
                      : {}
                  }
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: ENGINE_COLORS[opt.value],
                        boxShadow: `0 0 5px ${ENGINE_COLORS[opt.value]}`,
                      }}
                    />
                    <span className="text-primary text-xs font-mono font-medium">
                      {opt.label}
                    </span>
                  </div>
                  <span
                    className="text-muted font-mono"
                    style={{ fontSize: "0.62rem" }}
                  >
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="primary"
              loading={createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Provisionar
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
      ) : databases?.length === 0 ? (
        <EmptyState
          icon={<Database size={40} />}
          title="Nenhum database ainda"
          description="Crie seu primeiro banco de dados"
          action={
            <Button
              variant="primary"
              icon={<Plus size={13} />}
              onClick={() => setShowCreate(true)}
            >
              Criar agora
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {databases?.map((db) => (
            <DatabaseRow
              key={db.id}
              db={db}
              onView={() => navigate(`/database/${db.id}`)}
              onDelete={() => {
                if (confirm(`Deletar "${db.name}"?`))
                  deleteMutation.mutate(db.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function DatabaseRow({
  db,
  onView,
  onDelete,
}: {
  db: DB;
  onView: () => void;
  onDelete: () => void;
}) {
  const isProvisioning =
    db.status === "PROVISIONING" || db.status === "MIGRATING";
  return (
    <div
      onClick={onView}
      className="flex items-center gap-3.5 px-4 py-3.5 rounded-lg bg-surface border border-border hover:border-border-bright hover:bg-elevated cursor-pointer transition-all"
    >
      <div
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{
          background: ENGINE_COLORS[db.engine],
          boxShadow: `0 0 8px ${ENGINE_COLORS[db.engine]}80`,
          animation: isProvisioning ? "pulseGlow 1.5s ease infinite" : "none",
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono font-medium text-primary text-sm">
            {db.name}
          </span>
          <Badge color={STATUS_COLORS[db.status]}>{db.status}</Badge>
        </div>
        <div className="flex gap-3 mt-0.5">
          {[
            ENGINE_LABELS[db.engine],
            formatBytes(db.sizeBytes),
            formatRelative(db.createdAt),
            db._count ? `${db._count.schemas} schemas` : null,
          ]
            .filter(Boolean)
            .map((t) => (
              <span
                key={t}
                className="text-muted font-mono"
                style={{ fontSize: "0.68rem" }}
              >
                {t}
              </span>
            ))}
        </div>
      </div>
      {isProvisioning && (
        <RefreshCw size={13} className="text-brand-yellow animate-spin" />
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-1.5 rounded text-muted hover:text-brand-red hover:bg-red-glow transition-all cursor-pointer bg-transparent border-none"
      >
        <Trash2 size={13} />
      </button>
      <ChevronRight size={13} className="text-muted" />
    </div>
  );
}

export default DatabasePage;
