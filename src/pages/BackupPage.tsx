import { useQuery } from "@tanstack/react-query";
import { HardDrive, Database } from "lucide-react";
import { backupApi, databaseApi } from "../api/service";

import { Card, Badge, EmptyState, Spinner } from "../components/ui";
import { STATUS_COLORS, formatBytes, formatRelative } from "../utils";
import type { Backup } from "../types";
import Header from "../components/layout/Header";

const BackupsPage = () => {
  const { data: databases, isLoading } = useQuery({
    queryKey: ["database"],
    queryFn: databaseApi.list,
  });
  return (
    <div className="animate-fade-in">
      <Header
        title="Backups"
        subtitle="Histórico de todos os backups dos seus databases"
      />
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size={24} />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {databases
            ?.filter((db) => db.status === "ACTIVE")
            .map((db) => (
              <DbBackupSection
                key={db.id}
                databaseId={db.id}
                databaseName={db.name}
              />
            ))}
        </div>
      )}
    </div>
  );
};

function DbBackupSection({
  databaseId,
  databaseName,
}: {
  databaseId: string;
  databaseName: string;
}) {
  const { data: backups, isLoading } = useQuery({
    queryKey: ["backups", databaseId],
    queryFn: () => backupApi.list(databaseId),
  });
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Database size={13} className="text-muted" />
        <span className="font-display font-semibold text-primary text-sm">
          {databaseName}
        </span>
        {backups && <Badge>{backups.length} backups</Badge>}
      </div>
      {isLoading ? (
        <Spinner />
      ) : backups?.length === 0 ? (
        <Card>
          <EmptyState
            icon={<HardDrive size={28} />}
            title="Nenhum backup"
            description="Crie backups manuais na página do database"
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-1.5">
          {backups?.map((b) => (
            <BackupRow key={b.id} backup={b} />
          ))}
        </div>
      )}
    </div>
  );
}

function BackupRow({ backup }: { backup: Backup }) {
  const typeColors: Record<string, string> = {
    MANUAL: "#1e90ff",
    DAILY: "#a78bfa",
    WEEKLY: "#f5c518",
    PITR: "#ff8c42",
  };
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-surface border border-border">
      <HardDrive
        size={13}
        style={{ color: STATUS_COLORS[backup.status] }}
        className="shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-primary text-xs">
            {backup.label ?? `Backup ${backup.type.toLowerCase()}`}
          </span>
          <Badge color={STATUS_COLORS[backup.status]}>{backup.status}</Badge>
          <Badge color={typeColors[backup.type]}>{backup.type}</Badge>
        </div>
        <div className="flex gap-3 mt-0.5">
          <span
            className="text-muted font-mono"
            style={{ fontSize: "0.65rem" }}
          >
            {formatBytes(backup.sizeBytes)}
          </span>
          <span
            className="text-muted font-mono"
            style={{ fontSize: "0.65rem" }}
          >
            {formatRelative(backup.createdAt)}
          </span>
          {backup.expiresAt && (
            <span
              className="text-brand-yellow font-mono"
              style={{ fontSize: "0.65rem" }}
            >
              Expira {formatRelative(backup.expiresAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default BackupsPage;
