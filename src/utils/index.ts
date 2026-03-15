import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: string | number): string {
  const n = typeof bytes === "string" ? parseInt(bytes) : bytes;
  if (!n || n === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return `${parseFloat((n / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatRelative(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
}

export function formatDate(date: string): string {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatPercent(used: number, total: number): number {
  if (!total || total === Infinity) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? "Erro desconhecido";
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export const ENGINE_COLORS: Record<string, string> = {
  POSTGRESQL: "#336791",
  MYSQL: "#00758f",
  MONGODB: "#00e5a0",
  SQLITE: "#7a9bb5",
};

export const ENGINE_LABELS: Record<string, string> = {
  POSTGRESQL: "PostgreSQL",
  MYSQL: "MySQL",
  MONGODB: "MongoDB",
  SQLITE: "SQLite",
};

export const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#00e5a0",
  PROVISIONING: "#f5c518",
  MIGRATING: "#f5c518",
  ERROR: "#ff4d6a",
  DELETED: "#3d5470",
  DRAFT: "#7a9bb5",
  APPLIED: "#00e5a0",
  ROLLED_BACK: "#ff8c42",
  FAILED: "#ff4d6a",
  COMPLETED: "#00e5a0",
  PENDING: "#f5c518",
  IN_PROGRESS: "#1e90ff",
  EXPIRED: "#3d5470",
  SUSPENDED: "#ff4d6a",
};

export const PLAN_COLORS: Record<string, string> = {
  FREE: "#7a9bb5",
  STARTER: "#1e90ff",
  PRO: "#a78bfa",
  ENTERPRISE: "#f5c518",
};

export const PLAN_LABELS: Record<string, string> = {
  FREE: "Free",
  STARTER: "Starter",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};
