import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileCode2, Download, Copy, RefreshCw, Database } from "lucide-react";
import { databaseApi, sdkApi } from "../api/service";
import { Card, Button, EmptyState, Spinner, CodeBlock } from "../components/ui";
import { ENGINE_LABELS, ENGINE_COLORS, cn } from "../utils";
import toast from "react-hot-toast";
import Header from "../components/layout/Header";

const SdkPage = () => {
  const [selectedDb, setSelectedDb] = useState<string | null>(null);
  const [sdkType, setSdkType] = useState<"typescript" | "openapi">(
    "typescript",
  );
  const [sdkContent, setSdkContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: databases } = useQuery({
    queryKey: ["database"],
    queryFn: databaseApi.list,
  });

  const generate = async (dbId: string, type: "typescript" | "openapi") => {
    setLoading(true);
    setSdkContent(null);
    try {
      const content =
        type === "typescript"
          ? await sdkApi.typescript(dbId)
          : JSON.stringify(await sdkApi.openapi(dbId), null, 2);
      setSdkContent(content);
      toast.success("SDK gerado!");
    } catch {
      toast.error("Erro ao gerar SDK. Verifique se há um schema aplicado.");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!sdkContent) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([sdkContent], { type: "text/plain" }),
    );
    a.download = `multidb-client.${sdkType === "typescript" ? "ts" : "json"}`;
    a.click();
  };

  return (
    <div className="animate-fade-in">
      <Header
        title="SDK Generator"
        subtitle="Gere um SDK TypeScript ou spec OpenAPI a partir do schema do seu database"
      />

      <div className="grid gap-4" style={{ gridTemplateColumns: "260px 1fr" }}>
        {/* DB list */}
        <div className="flex flex-col gap-2">
          <p className="text-muted text-xs font-mono uppercase tracking-widest mb-1">
            Database
          </p>
          {databases
            ?.filter((db) => db.status === "ACTIVE")
            .map((db) => (
              <button
                key={db.id}
                onClick={() => {
                  setSelectedDb(db.id);
                  setSdkContent(null);
                }}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left cursor-pointer border transition-all",
                  selectedDb === db.id
                    ? "bg-accent/10 border-accent/50"
                    : "bg-surface border-border hover:border-border-bright",
                )}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: ENGINE_COLORS[db.engine] }}
                />
                <div className="min-w-0">
                  <span className="text-primary text-xs font-mono block truncate">
                    {db.name}
                  </span>
                  <span
                    className="text-muted font-mono"
                    style={{ fontSize: "0.62rem" }}
                  >
                    {ENGINE_LABELS[db.engine]}
                  </span>
                </div>
              </button>
            ))}
          {databases?.filter((db) => db.status === "ACTIVE").length === 0 && (
            <EmptyState
              icon={<Database size={24} />}
              title="Nenhum database ativo"
            />
          )}
        </div>

        {/* Generator */}
        <div className="flex flex-col gap-3">
          {!selectedDb ? (
            <Card>
              <EmptyState
                icon={<FileCode2 size={36} />}
                title="Selecione um database"
                description="Escolha um database com schema aplicado"
              />
            </Card>
          ) : (
            <>
              <Card>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex bg-elevated rounded-lg p-0.5">
                    {(["typescript", "openapi"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setSdkType(t);
                          setSdkContent(null);
                        }}
                        className={cn(
                          "px-3 py-1 rounded-md text-xs font-mono cursor-pointer border transition-all",
                          sdkType === t
                            ? "bg-active text-primary border-border-bright"
                            : "bg-transparent text-muted border-transparent hover:text-secondary",
                        )}
                      >
                        {t === "typescript" ? "TypeScript SDK" : "OpenAPI 3.0"}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={loading}
                    icon={<RefreshCw size={12} />}
                    onClick={() => generate(selectedDb, sdkType)}
                  >
                    Gerar
                  </Button>
                  {sdkContent && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Copy size={12} />}
                        onClick={() => {
                          navigator.clipboard.writeText(sdkContent);
                          toast.success("Copiado!");
                        }}
                      >
                        Copiar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Download size={12} />}
                        onClick={download}
                      >
                        Download
                      </Button>
                    </>
                  )}
                </div>
              </Card>

              {loading ? (
                <Card>
                  <div className="flex justify-center py-10">
                    <Spinner size={24} />
                  </div>
                </Card>
              ) : sdkContent ? (
                <CodeBlock
                  code={sdkContent}
                  language={sdkType === "typescript" ? "typescript" : "json"}
                />
              ) : (
                <Card>
                  <p className="text-muted text-xs font-mono text-center py-8">
                    Clique em "Gerar" para criar o SDK
                  </p>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SdkPage;
