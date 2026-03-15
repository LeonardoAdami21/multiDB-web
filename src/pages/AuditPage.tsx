import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollText, Filter } from "lucide-react";
import { Badge, Button, Card, EmptyState, Spinner } from "../components/ui";
import { formatDate } from "../utils";
import { auditApi } from "../api/service";
import Header from "../components/layout/Header";

const ACTION_COLORS: Record<string, string> = {
  READ: "#3d5470",
  CREATE: "#00e5a0",
  UPDATE: "#1e90ff",
  DELETE: "#ff4d6a",
  BULK_CREATE: "#a78bfa",
  SCHEMA_MIGRATE: "#f5c518",
};

const filterCls =
  "px-2.5 py-1.5 rounded-md bg-elevated border border-border text-primary text-xs font-mono outline-none focus:border-accent transition-colors";

const AuditPage = () => {
  const [resource, setResource] = useState("");
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);

  const { data: logs, isLoading } = useQuery({
    queryKey: ["audit", resource, action, page],
    queryFn: () =>
      auditApi.list({
        resource: resource || undefined,
        action: action || undefined,
        page,
        limit: 30,
      }),
  });

  return (
    <div className="animate-fade-in">
      <Header
        title="Audit Log"
        subtitle="Histórico completo de todas as operações realizadas"
      />

      <Card className="mb-4">
        <div className="flex items-center gap-2.5">
          <Filter size={13} className="text-muted" />
          <span className="text-muted text-xs font-mono">Filtros:</span>
          <input
            value={resource}
            onChange={(e) => {
              setResource(e.target.value);
              setPage(1);
            }}
            placeholder="Recurso (ex: Post)"
            className={filterCls}
          />
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            className={filterCls}
          >
            <option value="">Todos os actions</option>
            {[
              "READ",
              "CREATE",
              "UPDATE",
              "DELETE",
              "BULK_CREATE",
              "SCHEMA_MIGRATE",
            ].map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setResource("");
              setAction("");
              setPage(1);
            }}
          >
            Limpar
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size={24} />
        </div>
      ) : logs?.length === 0 ? (
        <EmptyState
          icon={<ScrollText size={36} />}
          title="Nenhum log encontrado"
          description="As operações realizadas aparecerão aqui"
        />
      ) : (
        <>
          <Card className="p-0 overflow-hidden">
            {/* Header */}
            <div
              className="grid gap-0 px-4 py-2 bg-elevated border-b border-border"
              style={{ gridTemplateColumns: "110px 70px 110px 1fr 150px" }}
            >
              {["Action", "IP", "Recurso", "ID", "Data"].map((h) => (
                <span
                  key={h}
                  className="text-muted text-xs font-mono uppercase tracking-widest"
                >
                  {h}
                </span>
              ))}
            </div>
            {logs?.map((log, i) => (
              <div
                key={log.id}
                className="grid gap-0 px-4 py-2.5 border-b border-border last:border-none items-center"
                style={{
                  gridTemplateColumns: "110px 70px 110px 1fr 150px",
                  background:
                    i % 2 === 0 ? "var(--surface, #0d1117)" : "transparent",
                }}
              >
                <Badge color={ACTION_COLORS[log.action] ?? "#3d5470"}>
                  {log.action}
                </Badge>
                <span className="text-secondary text-xs font-mono">
                  {log.ipAddress ? log.ipAddress.slice(-8) : "—"}
                </span>
                <span className="text-primary text-xs font-mono">
                  {log.resource}
                </span>
                <span className="text-muted text-xs font-mono truncate">
                  {log.resourceId ?? "—"}
                </span>
                <span
                  className="text-muted font-mono"
                  style={{ fontSize: "0.65rem" }}
                >
                  {formatDate(log.createdAt)}
                </span>
              </div>
            ))}
          </Card>

          <div className="flex justify-center gap-2 mt-4">
            <Button
              size="sm"
              variant="ghost"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Anterior
            </Button>
            <span className="text-secondary text-xs font-mono px-3 py-1.5">
              Página {page}
            </span>
            <Button
              size="sm"
              variant="ghost"
              disabled={(logs?.length ?? 0) < 30}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima →
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AuditPage;
