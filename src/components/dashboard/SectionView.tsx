import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, CircleDollarSign, Library, Pause, Play, Plus, Printer, Search, Trash2 } from "lucide-react";

type P = { id: number; name: string; model: string; online: boolean };
type J = { id: number; name: string; printer: string; progress: number; state: "Imprimindo" | "Na fila" | "Pausado" | "Concluído" };

const card = "rounded-2xl border border-white/[0.07] bg-[#11161d] p-5";
const btn = "flex items-center gap-2 rounded-xl bg-[#ed1018] px-4 py-2.5 text-xs font-bold text-white hover:bg-red-400";
const input = "rounded-lg border border-white/10 bg-[#0d1117] px-3 py-2 text-xs text-slate-200 outline-none";

export function SectionView({ active, onBack }: { active: string; onBack: () => void }) {
  return (
    <div>
      <button onClick={onBack} className="mb-4 flex items-center gap-2 text-xs text-slate-400 hover:text-white"><ArrowLeft size={14}/> Voltar à visão geral</button>
      <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-[30px]">{active}<span className="text-red-400">.</span></h1>
      {active === "Impressoras" && <Printers/>}
      {active === "Fila de produção" && <Queue/>}
      {active === "Biblioteca" && <Shortcut icon={Library} text="Seus modelos, arquivos e coleções ficam na biblioteca." to="/biblioteca" label="Abrir biblioteca"/>}
      {active === "Custos e relatórios" && <Shortcut icon={CircleDollarSign} text="Simule material, energia e tempo de cada impressão." to="/calculadora" label="Abrir calculadora"/>}
      {active === "Explorar projetos" && <Explore/>}
      {active === "Assinatura e licenças" && <Plans/>}
      {active === "Configurações" && <SettingsPanel/>}
    </div>
  );
}

function Printers() {
  const [list, setList] = useState<P[]>([
    { id: 1, name: "Bambu Lab X1 Carbon", model: "X1C", online: true },
    { id: 2, name: "Bambu Lab P1S", model: "P1S", online: true },
    { id: 3, name: "Bambu Lab A1", model: "A1", online: false },
  ]);
  const [name, setName] = useState("");
  return <div className="space-y-4">
    <div className={`${card} flex flex-wrap gap-2`}>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome da impressora" className={`${input} flex-1`}/>
      <button className={btn} onClick={()=>{ if(!name.trim()) return; setList(l=>[...l,{id:Date.now(),name,model:"Nova",online:false}]); setName(""); }}><Plus size={14}/> Adicionar</button>
    </div>
    {list.map(p=><div key={p.id} className={`${card} flex items-center gap-3`}>
      <Printer size={18} className="text-slate-400"/>
      <div className="flex-1"><div className="text-sm font-semibold">{p.name}</div><div className="text-[11px] text-slate-500">{p.model}</div></div>
      <button onClick={()=>setList(l=>l.map(x=>x.id===p.id?{...x,online:!x.online}:x))} className={`rounded-full px-3 py-1 text-[10px] ${p.online?"bg-emerald-400/10 text-emerald-300":"bg-white/5 text-slate-400"}`}>{p.online?"Online":"Offline"}</button>
      <button onClick={()=>setList(l=>l.filter(x=>x.id!==p.id))} className="text-slate-500 hover:text-red-300"><Trash2 size={15}/></button>
    </div>)}
  </div>;
}

function Queue() {
  const [jobs, setJobs] = useState<J[]>([
    { id: 1, name: "Suporte articulado V2", printer: "X1 Carbon", progress: 72, state: "Imprimindo" },
    { id: 2, name: "Organizador modular", printer: "P1S", progress: 38, state: "Imprimindo" },
    { id: 3, name: "Engrenagem planetária", printer: "A1", progress: 0, state: "Na fila" },
  ]);
  const [filter, setFilter] = useState("Todos");
  const set = (id:number, state:J["state"]) => setJobs(js=>js.map(j=>j.id===id?{...j,state,progress:state==="Concluído"?100:j.progress}:j));
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-2">{["Todos","Imprimindo","Na fila","Pausado","Concluído"].map(f=><button key={f} onClick={()=>setFilter(f)} className={`rounded-full px-3 py-1.5 text-[11px] ${filter===f?"bg-red-500/15 text-red-300":"bg-white/5 text-slate-400"}`}>{f}</button>)}</div>
    {jobs.filter(j=>filter==="Todos"||j.state===filter).map(j=><div key={j.id} className={card}>
      <div className="flex items-center justify-between"><div><div className="text-sm font-semibold">{j.name}</div><div className="text-[11px] text-slate-500">{j.printer} · {j.state}</div></div>
      <div className="flex gap-1">
        {j.state==="Imprimindo"?<button title="Pausar" onClick={()=>set(j.id,"Pausado")} className="rounded-md border border-white/10 p-2"><Pause size={13}/></button>:j.state!=="Concluído"&&<button title="Iniciar" onClick={()=>set(j.id,"Imprimindo")} className="rounded-md border border-white/10 p-2"><Play size={13}/></button>}
        {j.state!=="Concluído"&&<button title="Concluir" onClick={()=>set(j.id,"Concluído")} className="rounded-md border border-white/10 p-2"><Check size={13}/></button>}
      </div></div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full bg-red-400" style={{width:`${j.progress}%`}}/></div>
    </div>)}
  </div>;
}

function Shortcut({ icon: Icon, text, to, label }: { icon: typeof Library; text: string; to: "/biblioteca" | "/calculadora"; label: string }) {
  return <div className={`${card} flex flex-wrap items-center gap-4`}><Icon size={22} className="text-red-300"/><p className="flex-1 text-sm text-slate-400">{text}</p><Link to={to} className={btn}>{label}</Link></div>;
}

function Explore() {
  const [q, setQ] = useState("");
  return <div className={`${card} flex flex-wrap gap-2`}>
    <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar projetos no MakerWorld" className={`${input} flex-1`}/>
    <a className={btn} href={`https://makerworld.com/pt/search/models?keyword=${encodeURIComponent(q)}`} target="_blank" rel="noreferrer"><Search size={14}/> Buscar</a>
  </div>;
}

function Plans() {
  const [plan, setPlan] = useState("Demonstração");
  return <div className="grid gap-4 md:grid-cols-3">{([["Demonstração","Grátis"],["Maker","R$ 29/mês"],["Pro","R$ 79/mês"]] as const).map(([n,p])=><div key={n} className={`${card} ${plan===n?"ring-1 ring-red-400/40":""}`}>
    <div className="text-sm font-semibold">{n}</div><div className="my-3 text-2xl font-bold">{p}</div>
    <button onClick={()=>setPlan(n)} className={plan===n?"text-xs text-emerald-300":btn}>{plan===n?"Plano atual":"Selecionar"}</button>
  </div>)}<p className="text-[11px] text-slate-500 md:col-span-3">Valores ilustrativos — pagamento ainda não conectado.</p></div>;
}

function SettingsPanel() {
  const [s, setS] = useState({ nome: "Minha oficina", tarifa: "0,85", notif: true });
  const [saved, setSaved] = useState(false);
  return <div className={`${card} max-w-lg space-y-4`}>
    <label className="block text-xs text-slate-400">Nome da oficina<input value={s.nome} onChange={e=>setS({...s,nome:e.target.value})} className={`${input} mt-1 w-full`}/></label>
    <label className="block text-xs text-slate-400">Tarifa de energia (R$/kWh)<input value={s.tarifa} onChange={e=>setS({...s,tarifa:e.target.value})} className={`${input} mt-1 w-full`}/></label>
    <label className="flex items-center gap-2 text-xs text-slate-400"><input type="checkbox" checked={s.notif} onChange={e=>setS({...s,notif:e.target.checked})}/> Receber notificações</label>
    <button onClick={()=>setSaved(true)} className={btn}>Salvar</button>{saved&&<p className="text-xs text-emerald-300">Configurações salvas.</p>}
  </div>;
}
