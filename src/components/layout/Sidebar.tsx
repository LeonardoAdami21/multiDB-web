import { NavLink, useNavigate } from "react-router-dom";
import {
  Database,
  Key,
  Webhook,
  HardDrive,
  BarChart3,
  FileCode2,
  CreditCard,
  ScrollText,
  LogOut,
  Zap,
} from "lucide-react";
import { useAuthStore } from "../../store/zustand";
import { PLAN_COLORS, PLAN_LABELS } from "../../utils";
import { cn } from "../../utils";

const NAV = [
  { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { to: "/database", icon: Database, label: "Databases" },
  { to: "/api-keys", icon: Key, label: "API Keys" },
  { to: "/webhook", icon: Webhook, label: "Webhooks" },
  { to: "/backup", icon: HardDrive, label: "Backups" },
  { to: "/sdk", icon: FileCode2, label: "SDK" },
  { to: "/billing", icon: CreditCard, label: "Billing" },
  { to: "/audit", icon: ScrollText, label: "Audit Log" },
];

const Sidebar = () => {
  const { tenant, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <aside className="w-[220px] min-h-screen bg-surface border-r border-border flex flex-col fixed left-0 top-0 bottom-0 z-50">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center glow-accent shrink-0">
            <Zap size={14} className="text-white fill-white" />
          </div>
          <span className="font-display font-extrabold text-base text-primary tracking-tight">
            MultiDB
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 flex flex-col gap-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-mono transition-all",
                "border-l-2",
                isActive
                  ? "text-accent bg-accent/10 border-accent"
                  : "text-secondary hover:text-primary hover:bg-hover border-transparent",
              )
            }
          >
            <Icon size={13} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Tenant info */}
      <div className="p-2 border-t border-border">
        <div className="px-2.5 py-2 rounded-md bg-elevated mb-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-primary text-xs font-mono font-medium truncate">
              {tenant?.name}
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded font-mono shrink-0 border"
              style={{
                color: PLAN_COLORS[tenant?.plan ?? "FREE"],
                background: `${PLAN_COLORS[tenant?.plan ?? "FREE"]}18`,
                borderColor: `${PLAN_COLORS[tenant?.plan ?? "FREE"]}30`,
                fontSize: "0.6rem",
              }}
            >
              {PLAN_LABELS[tenant?.plan ?? "FREE"]}
            </span>
          </div>
          <span
            className="text-muted text-xs truncate block mt-0.5"
            style={{ fontSize: "0.65rem" }}
          >
            {tenant?.email}
          </span>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-mono text-muted hover:text-brand-red hover:bg-red-glow transition-all cursor-pointer bg-transparent border-none"
        >
          <LogOut size={12} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
