import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/zustand";
import { authApi } from "../api/service";
import { cn, getErrorMessage } from "../utils";
import { Button, Input } from "../components/ui";

export function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const submit = async () => {
    if (!email) return toast.error("Informe o email");
    if (mode === "register" && !name) return toast.error("Informe o nome");
    setLoading(true);
    try {
      const res =
        mode === "register"
          ? await authApi.register(name, email)
          : await authApi.login(email);
      setAuth(res.token, res.tenant);
      toast.success(
        mode === "register" ? "Conta criada!" : "Bem-vindo de volta!",
      );
      navigate("/dashboard");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base relative overflow-hidden">
      {/* Grid texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#1e2d3d 1px, transparent 1px), linear-gradient(90deg, #1e2d3d 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="w-full max-w-sm px-5 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent glow-accent mb-4">
            <Zap size={26} className="text-white fill-white" />
          </div>
          <h1 className="font-display font-extrabold text-3xl text-primary tracking-tight">
            MultiDB
          </h1>
          <p className="text-muted text-xs font-mono mt-1.5">
            Database as a Service
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-xl p-7">
          {/* Tab toggle */}
          <div className="flex bg-elevated rounded-lg p-0.5 mb-6">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer border",
                  mode === m
                    ? "bg-active text-primary border-border-bright"
                    : "bg-transparent text-muted border-transparent hover:text-secondary",
                )}
              >
                {m === "login" ? "Entrar" : "Cadastrar"}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {mode === "register" && (
              <Input
                label="Nome da empresa"
                placeholder="Minha Empresa"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <Input
              label="Email"
              type="email"
              placeholder="dev@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            loading={loading}
            onClick={submit}
            icon={<ArrowRight size={14} />}
            className="w-full justify-center mt-5"
          >
            {mode === "register" ? "Criar conta" : "Entrar"}
          </Button>
        </div>

        <p className="text-center text-muted text-xs font-mono mt-5">
          PostgreSQL · MySQL · MongoDB · SQLite
        </p>
      </div>
    </div>
  );
}
