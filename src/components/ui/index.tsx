import React from "react";
import { cn } from "../../utils";
import { Loader2 } from "lucide-react";

// ─── Button ───────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = "secondary",
  size = "md",
  loading,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 font-mono font-medium rounded transition-all cursor-pointer border disabled:opacity-40 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-accent border-accent text-white hover:bg-blue-500",
    secondary:
      "bg-elevated border-border text-primary hover:bg-hover hover:border-border-bright",
    ghost:
      "bg-transparent border-transparent text-secondary hover:text-primary hover:bg-hover",
    danger: "bg-red-glow border-red-glow text-brand-red hover:opacity-80",
    success:
      "bg-green-glow border-green-glow text-brand-green hover:opacity-80",
  };

  const sizes = {
    sm: "text-xs px-2.5 py-1.5",
    md: "text-sm px-3.5 py-2",
    lg: "text-sm px-5 py-2.5",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function Badge({ children, color, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-mono border",
        className,
      )}
      style={{
        color: color ?? "#7a9bb5",
        background: color ? `${color}18` : "#111820",
        borderColor: color ? `${color}30` : "#1e2d3d",
      }}
    >
      {children}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  style?: React.CSSProperties;
}

export function Card({
  children,
  className,
  onClick,
  hoverable,
  style,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={cn(
        "rounded-lg border border-border bg-surface p-4",
        hoverable &&
          "cursor-pointer transition-all hover:border-border-bright hover:bg-elevated",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs text-secondary font-mono">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full rounded border px-3 py-2 text-sm font-mono outline-none transition-colors bg-elevated text-primary",
          error ? "border-brand-red" : "border-border focus:border-accent",
          className,
        )}
        {...props}
      />
      {error && <span className="text-brand-red text-xs">{error}</span>}
      {hint && !error && <span className="text-muted text-xs">{hint}</span>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export function Select({
  label,
  options,
  error,
  className,
  id,
  ...props
}: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs text-secondary font-mono">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          "w-full rounded border px-3 py-2 text-sm font-mono outline-none transition-colors bg-elevated text-primary appearance-none",
          error ? "border-brand-red" : "border-border focus:border-accent",
          className,
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-elevated">
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="text-brand-red text-xs">{error}</span>}
    </div>
  );
}

// ─── Progress ─────────────────────────────────────────────

export function Progress({
  value,
  color,
  size = "md",
  label,
}: {
  value: number;
  color?: string;
  size?: "sm" | "md";
  label?: string;
}) {
  const h = size === "sm" ? "h-0.5" : "h-1.5";
  const c =
    color ?? (value > 90 ? "#ff4d6a" : value > 75 ? "#f5c518" : "#1e90ff");
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <div className="flex justify-between text-xs text-secondary font-mono">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
      )}
      <div className={cn("w-full bg-elevated rounded-full overflow-hidden", h)}>
        <div
          className={cn("h-full rounded-full transition-all duration-500")}
          style={{
            width: `${value}%`,
            background: c,
            boxShadow: `0 0 6px ${c}50`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────

export function Spinner({ size = 18 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin text-accent" />;
}

// ─── Empty State ──────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="text-muted opacity-40">{icon}</div>
      <div>
        <p className="text-primary font-display font-semibold">{title}</p>
        {description && (
          <p className="text-muted text-xs mt-1 font-mono">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── Code Block ───────────────────────────────────────────

export function CodeBlock({
  code,
  language = "typescript",
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <div className="flex items-center justify-between px-3 py-1.5 bg-elevated border-b border-border">
        <span className="text-muted text-xs font-mono">{language}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className={cn(
            "text-xs font-mono cursor-pointer bg-transparent border-none transition-colors",
            copied ? "text-brand-green" : "text-muted hover:text-secondary",
          )}
        >
          {copied ? "✓ Copiado" : "Copiar"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto bg-surface text-xs text-secondary font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────

export function StatCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted text-xs uppercase tracking-widest font-mono">
            {label}
          </p>
          <p
            className="font-display font-bold text-2xl leading-none mt-1"
            style={{ color: color ?? "#e2eaf4" }}
          >
            {value}
          </p>
          {sub && <p className="text-muted text-xs mt-1 font-mono">{sub}</p>}
        </div>
        {icon && (
          <div className="opacity-50" style={{ color: color ?? "#3d5470" }}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Scope Tag ────────────────────────────────────────────

export function ScopeTag({ scope }: { scope: string }) {
  const colors: Record<string, string> = {
    "db:read": "#00e5a0",
    "db:write": "#1e90ff",
    "db:delete": "#ff4d6a",
    "schema:manage": "#a78bfa",
    "admin:full": "#f5c518",
  };
  return <Badge color={colors[scope] ?? "#7a9bb5"}>{scope}</Badge>;
}
