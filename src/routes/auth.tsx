import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

type Search = { redirect?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s.redirect === "string" && s.redirect.startsWith("/") && !s.redirect.startsWith("//") ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Entrar — MS 3D Studio" },
      { name: "description", content: "Acesse sua conta da oficina ou do portal do cliente MS 3D Studio." },
      { property: "og:title", content: "Entrar — MS 3D Studio" },
      { property: "og:description", content: "Acesse sua conta MS 3D Studio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const input = "w-full rounded-lg border border-white/10 bg-[#0d1117] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-red-400/50";

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const target = redirect ?? "/admin";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) navigate({ to: target }); });
    const { data } = supabase.auth.onAuthStateChange((e, s) => { if (e === "SIGNED_IN" && s) navigate({ to: target }); });
    return () => data.subscription.unsubscribe();
  }, [navigate, target]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: `${window.location.origin}/auth` } });
        if (error) throw error;
        if (!data.session) toast.success("Conta criada! Confirme pelo link enviado ao seu e-mail.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      toast.error(msg.includes("Invalid login") ? "E-mail ou senha incorretos." : msg.includes("not confirmed") ? "Confirme seu e-mail antes de entrar." : msg.includes("already registered") ? "Este e-mail já tem conta. Entre com ele." : "Não foi possível continuar. Verifique os dados.");
    } finally { setBusy(false); }
  }

  async function google() {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
    if (res.error) toast.error("Não foi possível entrar com Google.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0e12] px-4 text-slate-100">
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.07] bg-[#11161d] p-6">
        <Link to="/" className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0750a6]"><Printer size={22}/></div>
          <div className="brand-wordmark text-xl"><span>MS 3D</span><span className="text-red-400"> STUDIO</span></div>
        </Link>
        <h1 className="mb-1 text-2xl font-bold">{mode === "login" ? "Entrar" : "Criar conta"}</h1>
        <p className="mb-5 text-xs text-slate-500">Oficina e clientes usam a mesma conta.</p>
        <button onClick={google} className="mb-4 w-full rounded-lg border border-white/10 py-2.5 text-sm hover:bg-white/[0.04]">Continuar com Google</button>
        <div className="mb-4 text-center text-[10px] uppercase tracking-widest text-slate-600">ou</div>
        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && <input className={input} placeholder="Seu nome" value={name} onChange={e=>setName(e.target.value)} required/>}
          <input className={input} type="email" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} required/>
          <input className={input} type="password" placeholder="Senha (mín. 8 caracteres)" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required/>
          <button disabled={busy} className="w-full rounded-lg bg-[#ed1018] py-2.5 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-60">{busy ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}</button>
        </form>
        <button onClick={()=>setMode(mode === "login" ? "signup" : "login")} className="mt-4 w-full text-center text-xs text-slate-400 hover:text-white">
          {mode === "login" ? "Não tem conta? Criar conta" : "Já tem conta? Entrar"}
        </button>
      </div>
    </main>
  );
}
