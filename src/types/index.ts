// src/types/index.ts

export type Plan = "FREE" | "STARTER" | "PRO" | "ENTERPRISE";
export type TenantStatus = "ACTIVE" | "SUSPENDED" | "DELETED";
export type DbEngine = "POSTGRESQL" | "MYSQL" | "MONGODB" | "SQLITE";
export type DbStatus =
  | "PROVISIONING"
  | "ACTIVE"
  | "MIGRATING"
  | "ERROR"
  | "DELETED";
export type SchemaStatus = "DRAFT" | "APPLIED" | "ROLLED_BACK" | "FAILED";
export type BackupStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED";
export type BackupType = "MANUAL" | "DAILY" | "WEEKLY" | "PITR";
export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";
export type AlertType =
  | "STORAGE_WARNING"
  | "STORAGE_CRITICAL"
  | "SLOW_QUERIES"
  | "ERROR_RATE"
  | "BACKUP_FAILED"
  | "QUOTA_EXCEEDED";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  plan: Plan;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
  _count?: { databases: number; apiKeys: number; webhooks: number };
}

export interface Database {
  id: string;
  tenantId: string;
  name: string;
  engine: DbEngine;
  status: DbStatus;
  sizeBytes: string;
  createdAt: string;
  updatedAt: string;
  _count?: { schemas: number; backups: number };
}

export interface DbSchema {
  id: string;
  databaseId: string;
  version: number;
  definition: SchemaDefinition;
  prismaSchema: string;
  status: SchemaStatus;
  appliedAt?: string;
  createdAt: string;
}

export interface SchemaDefinition {
  name?: string;
  models: ModelDefinition[];
}

export interface ModelDefinition {
  name: string;
  fields: FieldDefinition[];
  indexes?: IndexDefinition[];
  uniqueConstraints?: UniqueConstraint[];
}

export interface FieldDefinition {
  name: string;
  type: string;
  required?: boolean;
  id?: boolean;
  autoincrement?: boolean;
  defaultUuid?: boolean;
  defaultNow?: boolean;
  default?: unknown;
  unique?: boolean;
  updatedAt?: boolean;
  isList?: boolean;
  relation?: string;
  encrypted?: boolean;
}

export interface IndexDefinition {
  name: string;
  fields: string[];
  type?: "NORMAL" | "UNIQUE" | "FULLTEXT";
}

export interface UniqueConstraint {
  fields: string[];
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  isActive: boolean;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
  key?: string; // only returned at creation
}

export interface Webhook {
  id: string;
  tenantId: string;
  name: string;
  url: string;
  events: string[];
  models: string[];
  isActive: boolean;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  payload: unknown;
  statusCode?: number;
  success: boolean;
  attempts: number;
  createdAt: string;
  deliveredAt?: string;
}

export interface Backup {
  id: string;
  tenantId: string;
  databaseId: string;
  label?: string;
  type: BackupType;
  status: BackupStatus;
  sizeBytes: string;
  storagePath?: string;
  expiresAt?: string;
  createdAt: string;
  completedAt?: string;
}

export interface UsageData {
  period: string;
  plan: Plan;
  usage: {
    requests: { used: number; limit: number };
    storage: { usedMb: number; limitMb: number };
    databases: { used: number; limit: number };
  };
  overage: {
    items: { resource: string; cost: number }[];
    total: number;
  };
}

export interface AuditLog {
  id: string;
  tenantId: string;
  apiKeyId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  metadata?: unknown;
  createdAt: string;
}

export interface Alert {
  id: string;
  tenantId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface TenantMetrics {
  tenantId: string;
  databases: Array<{
    id: string;
    name: string;
    engine: DbEngine;
    sizeMb: number;
  }>;
  activity: { requestsLast24h: number; completedBackups: number };
}

// Auth
export interface AuthUser {
  tenantId: string;
  email: string;
  plan: Plan;
}

export interface LoginResponse {
  data: {
    tenant: Tenant;
    token: string;
  };
}

export interface ApiResponse<T> {
  data: T;
  meta: { timestamp: string };
}
