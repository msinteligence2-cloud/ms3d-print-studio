import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Box, Download, FilePlus2, FolderOpen, Trash2 } from "lucide-react";
import {
  deleteProjectFile,
  listProjectFiles,
  saveProjectFile,
  type ProjectFileRecord,
} from "@/lib/ms3dprinting/library/storage";

export const Route = createFileRoute("/biblioteca")({
  component: LibraryPage,
});

function LibraryPage() {
  const [files, setFiles] = useState<ProjectFileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setFiles(await listProjectFiles());
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível abrir a biblioteca.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function importFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    if (!selected.length) return;
    setBusy(true);
    setMessage("");
    try {
      for (const file of selected) await saveProjectFile(file);
      await refresh();
      setMessage(`${selected.length} arquivo(s) importado(s) para este dispositivo.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha na importação.");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  async function removeFile(id: string) {
    if (!window.confirm("Excluir este arquivo da biblioteca local?")) return;
    await deleteProjectFile(id);
    await refresh();
  }

  function downloadFile(file: ProjectFileRecord) {
    const url = URL.createObjectURL(file.blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.name;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#202328] px-5 py-8 text-slate-100 md:px-10">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-red-300">
          <ArrowLeft size={16} /> Voltar ao painel
        </Link>
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-500/10 p-3 text-red-300"><FolderOpen size={24} /></div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Projetos 3D</p>
              <h1 className="ms-display text-3xl font-bold">Minha biblioteca</h1>
              <p className="mt-1 text-sm text-slate-400">Arquivos salvos localmente neste navegador/dispositivo.</p>
            </div>
          </div>
          <label className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-[#17120e] ${busy ? "opacity-50" : "hover:bg-red-400"}`}>
            <FilePlus2 size={16} /> {busy ? "Importando..." : "Importar arquivos"}
            <input className="sr-only" type="file" multiple accept=".stl,.3mf,.obj,.step,.stp" disabled={busy} onChange={importFiles} />
          </label>
        </div>

        {message && <p role="status" className="mb-5 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300">{message}</p>}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#292D33]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="font-semibold">Arquivos importados</h2>
            <span className="text-xs text-slate-500">{files.length} arquivo(s)</span>
          </div>
          {loading ? <p className="p-8 text-center text-sm text-slate-500">Carregando biblioteca...</p> : files.length === 0 ? (
            <div className="p-12 text-center">
              <Box size={32} className="mx-auto mb-3 text-slate-600" />
              <p className="font-medium">Sua biblioteca está vazia</p>
              <p className="mt-1 text-sm text-slate-500">Importe arquivos STL, 3MF, OBJ ou STEP para começar.</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {files.map((file) => (
                <li key={file.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <div className="rounded-lg bg-white/[0.05] p-2 text-red-300"><Box size={19} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{file.extension.toUpperCase()} · {(file.sizeBytes / 1024 / 1024).toFixed(2)} MB · Importado em {new Date(file.importedAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <button onClick={() => downloadFile(file)} aria-label={`Baixar ${file.name}`} className="rounded-lg border border-white/10 p-2 text-slate-400 hover:text-red-300"><Download size={16} /></button>
                  <button onClick={() => void removeFile(file.id)} aria-label={`Excluir ${file.name}`} className="rounded-lg border border-white/10 p-2 text-slate-400 hover:text-red-300"><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <p className="mt-4 text-xs leading-relaxed text-slate-500">Esta biblioteca usa IndexedDB e permanece neste navegador/perfil. A sincronização em nuvem, miniaturas 3D e compartilhamento entre dispositivos ainda serão adicionados.</p>
      </div>
    </main>
  );
}
