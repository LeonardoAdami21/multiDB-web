// src/api/services.ts
import { api, unwrap } from "./client";
import type {
  Tenant,
  Database,
  DbSchema,
  ApiKey,
  Webhook,
  WebhookDelivery,
  Backup,
  UsageData,
  AuditLog,
  Alert,
  TenantMetrics,
  SchemaDefinition,
} from "../types";

// ─── Auth ──────────────────────────────────────────────────

export const authApi = {
  register: (name: string, email: string) =>
    api
      .post("/auth/register", { name, email })
      .then(unwrap<{ tenant: Tenant; token: string }>),

  login: (email: string) =>
    api
      .post("/auth/login", { email })
      .then(unwrap<{ tenant: Tenant; token: string }>),
};

// ─── Tenant ────────────────────────────────────────────────

export const tenantApi = {
  me: () => api.get("/tenants/me").then(unwrap<Tenant>),
  update: (data: { name?: string }) =>
    api.patch("/tenants/me", data).then(unwrap<Tenant>),
  alerts: () => api.get("/tenants/me/alerts").then(unwrap<Alert[]>),
  resolveAlert: (id: string) =>
    api.patch(`/tenants/me/alerts/${id}/resolve`).then(unwrap<void>),
};

// ─── Databases ─────────────────────────────────────────────

export const databaseApi = {
  list: () => api.get("/databases").then(unwrap<Database[]>),
  get: (id: string) => api.get(`/databases/${id}`).then(unwrap<Database>),
  create: (data: { name: string; engine: string }) =>
    api.post("/databases", data).then(unwrap<Database>),
  delete: (id: string) => api.delete(`/databases/${id}`).then(unwrap<Database>),
};

// ─── Schemas ───────────────────────────────────────────────

export const schemaApi = {
  list: (dbId: string) =>
    api.get(`/databases/${dbId}/schemas`).then(unwrap<DbSchema[]>),
  create: (dbId: string, definition: SchemaDefinition) =>
    api.post(`/databases/${dbId}/schemas`, definition).then(unwrap<DbSchema>),
  apply: (dbId: string, schemaId: string) =>
    api
      .post(`/databases/${dbId}/schemas/${schemaId}/apply`)
      .then(unwrap<{ success: boolean; version: number }>),
  rollback: (dbId: string, version: number) =>
    api
      .post(`/databases/${dbId}/schemas/rollback/${version}`)
      .then(unwrap<{ success: boolean }>),
};

// ─── API Keys ──────────────────────────────────────────────

export const apiKeyApi = {
  list: () => api.get("/auth/api-keys").then(unwrap<ApiKey[]>),
  create: (data: { name: string; scopes: string[]; expiresAt?: string }) =>
    api.post("/auth/api-keys", data).then(unwrap<ApiKey>),
  revoke: (id: string) =>
    api.delete(`/auth/api-keys/${id}`).then(unwrap<ApiKey>),
};

// ─── Webhooks ──────────────────────────────────────────────

export const webhookApi = {
  list: () => api.get("/webhooks").then(unwrap<Webhook[]>),
  create: (data: {
    name: string;
    url: string;
    events: string[];
    models: string[];
  }) => api.post("/webhooks", data).then(unwrap<Webhook>),
  delete: (id: string) => api.delete(`/webhooks/${id}`).then(unwrap<void>),
  deliveries: (id: string) =>
    api.get(`/webhooks/${id}/deliveries`).then(unwrap<WebhookDelivery[]>),
};

// ─── Backups ───────────────────────────────────────────────

export const backupApi = {
  list: (dbId: string) =>
    api.get(`/databases/${dbId}/backups`).then(unwrap<Backup[]>),
  create: (dbId: string, label?: string) =>
    api.post(`/databases/${dbId}/backups`, { label }).then(unwrap<Backup>),
  restore: (dbId: string, backupId: string, targetEnvironment?: string) =>
    api
      .post(`/databases/${dbId}/backups/${backupId}/restore`, {
        targetEnvironment,
      })
      .then(unwrap<{ message: string }>),
};

// ─── Billing ───────────────────────────────────────────────

export const billingApi = {
  usage: () => api.get("/billing/usage").then(unwrap<UsageData>),
  changePlan: (plan: string) =>
    api.post("/billing/plan", { plan }).then(unwrap<{ plan: string }>),
};

// ─── Audit ─────────────────────────────────────────────────

export const auditApi = {
  list: (params?: {
    resource?: string;
    action?: string;
    page?: number;
    limit?: number;
  }) => api.get("/audit", { params }).then(unwrap<AuditLog[]>),
};

// ─── Metrics ───────────────────────────────────────────────

export const metricsApi = {
  tenant: () => api.get("/metrics/tenant").then(unwrap<TenantMetrics>),
};

// ─── SDK ───────────────────────────────────────────────────

export const sdkApi = {
  typescript: (dbId: string) =>
    api
      .get(`/databases/${dbId}/sdk/typescript`, { responseType: "text" })
      .then((r) => r.data as string),
  openapi: (dbId: string) =>
    api.get(`/databases/${dbId}/sdk/openapi`).then(unwrap<object>),
};

// ─── Data (CRUD) ───────────────────────────────────────────

export const dataApi = {
  list: (dbId: string, model: string, params?: Record<string, unknown>) =>
    api.get(`/data/${dbId}/${model}`, {
      params,
      headers: { "X-API-Key": getApiKey() },
    }),
  create: (dbId: string, model: string, data: unknown) =>
    api.post(`/data/${dbId}/${model}`, data, {
      headers: { "X-API-Key": getApiKey() },
    }),
  update: (dbId: string, model: string, id: string, data: unknown) =>
    api.patch(`/data/${dbId}/${model}/${id}`, data, {
      headers: { "X-API-Key": getApiKey() },
    }),
  delete: (dbId: string, model: string, id: string) =>
    api.delete(`/data/${dbId}/${model}/${id}`, {
      headers: { "X-API-Key": getApiKey() },
    }),
};

function getApiKey(): string {
  return localStorage.getItem("multidb_api_key") ?? "";
}
