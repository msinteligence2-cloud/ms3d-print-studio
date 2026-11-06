import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity, Bell, Boxes, ChevronRight, CircleDollarSign, Clock3, Download,
  FileBox, Gauge, Layers3, LayoutDashboard, Library, Menu,
  MoreHorizontal, Pause, Play, Plus, Printer, Search, Settings2, ShieldCheck,
  Wifi, Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Dashboard });

const navItems = [
  { label: "Visão geral", icon: LayoutDashboard },
  { label: "Impressoras", icon: Printer },
  { label: "Fila de produção", icon: Layers3 },
  { label: "Biblioteca", icon: Library },
  { label: "Explorar projetos", icon: Search },
  { label: "Custos e relatórios", icon: CircleDollarSign },
];

const jobs = [
  { name: "Suporte articulado V2", printer: "Bambu Lab X1 Carbon", material: "PLA Matte · Preto", progress: 72, time: "01h 24m", cost: "R$ 4,82", state: "Imprimindo" },
  { name: "Organizador modular", printer: "Bambu Lab P1S", material: "PETG · Cinza", progress: 38, time: "02h 08m", cost: "R$ 7,15", state: "Imprimindo" },
  { name: "Engrenagem planetária", printer: "Bambu Lab A1", material: "PLA Basic · Laranja", progress: 0, time: "00h 46m", cost: "R$ 1,93", state: "Na fila" },
];

function Dashboard() {
  const [active, setActive] = useState("Visão geral");
  const [period, setPeriod] = useState("Este mês");
  const [search, setSearch] = useState("");

  return (
    <main className="min-h-screen bg-[#0b0e12] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-[248px] shrink-0 border-r border-white/[0.07] bg-[#0e1218] px-4 py-6 lg:flex lg:flex-col">
          <div className="mb-10 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0750a6] text-white"><Printer size={22} strokeWidth={2.5}/></div>
            <div><div className="brand-wordmark text-[19px] font-black tracking-[0.01em]"><span className="text-white">MS 3D</span><span className="text-red-400"> STUDIO</span></div><div className="mt-0.5 text-[10px] tracking-[0.2em] text-slate-500">PRINT SMARTER</div></div>
          </div>
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">Workspace</div>
          <nav className="space-y-1">
            {navItems.map(({ label, icon: Icon }) => <button key={label} onClick={() => setActive(label)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] transition ${active === label ? "bg-red-500/10 font-semibold text-red-300 ring-1 ring-red-400/20" : "text-slate-400 hover:bg-white/[0.04] hover:text-white"}`}><Icon size={17}/>{label}{label === "Explorar projetos" && <span className="ml-auto rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[9px] text-slate-400">NOVO</span>}</button>)}
          </nav>
          <div className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">Sistema</div>
          <button onClick={() => setActive("Assinatura e licenças")} className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] text-slate-400 hover:bg-white/[0.04]"><ShieldCheck size={17}/> Assinatura e licenças</button>
          <button onClick={() => setActive("Configurações")} className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] text-slate-400 hover:bg-white/[0.04]"><Settings2 size={17}/> Configurações</button>
          <div className="mt-auto rounded-2xl border border-red-400/15 bg-gradient-to-br from-red-500/10 to-transparent p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-red-300"><Zap size={14}/> MS 3D PRO</div>
            <p className="text-[11px] leading-relaxed text-slate-400">Desbloqueie sua produção com ferramentas profissionais.</p>
            <button onClick={() => setActive("Assinatura e licenças")} className="mt-3 flex w-full items-center justify-between rounded-lg bg-[#ed1018] px-3 py-2 text-[11px] font-bold text-white">Conhecer planos <ChevronRight size={14}/></button>
          </div>
          <div className="mt-5 flex items-center gap-3 border-t border-white/[0.07] px-2 pt-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-xs font-bold">MS</div><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold">Minha oficina</div><div className="text-[10px] text-slate-500">Plano demonstração</div></div><MoreHorizontal size={17} className="text-slate-500"/>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-[72px] items-center justify-between border-b border-white/[0.07] px-5 md:px-8">
            <div className="flex items-center gap-3"><button className="text-slate-400 lg:hidden"><Menu size={20}/></button><div className="text-xs text-slate-500">Workspace <span className="px-2 text-slate-700">/</span><span className="text-slate-200">{active}</span></div></div>
            <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5 text-[10px] font-medium text-emerald-300 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/> Sistema operacional</div><button className="relative rounded-xl border border-white/[0.08] p-2 text-slate-400"><Bell size={17}/><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#ed1018]"/></button><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0750a6]/25 text-[11px] font-bold text-blue-200">MS</div></div>
          </header>

          <div className="mx-auto max-w-[1500px] p-5 md:p-8">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400"><Activity size={13}/> Central de produção</div><h1 className="text-2xl font-bold tracking-tight md:text-[30px]">Visão geral<span className="text-red-400">.</span></h1><p className="mt-1 text-xs text-slate-500">Acompanhe sua oficina, custos e impressões em um só lugar.</p></div>
              <div className="flex gap-2"><Link to="/biblioteca" className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-slate-300 hover:bg-white/[0.04]"><Library size={14}/> Biblioteca</Link><Link to="/calculadora" className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-slate-300 hover:bg-white/[0.04]"><CircleDollarSign size={14}/> Calcular custo</Link><button className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-slate-300 hover:bg-white/[0.04]"><Download size={14}/> Exportar</button><button onClick={() => setActive("Impressoras")} className="flex items-center gap-2 rounded-xl bg-[#ed1018] px-4 py-2.5 text-xs font-bold text-white hover:bg-red-400"><Plus size={15}/> Adicionar impressora</button></div>
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric icon={Printer} label="Impressoras online" value="02" detail="de 03 cadastradas" accent="orange"/>
              <Metric icon={Layers3} label="Impressões no mês" value="128" detail="+18,4% vs. mês anterior" accent="blue"/>
              <Metric icon={Clock3} label="Horas de impressão" value="246h" detail="10 dias e 6 horas" accent="violet"/>
              <Metric icon={CircleDollarSign} label="Custo estimado" value="R$ 384,60" detail="Energia + filamentos" accent="green"/>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
              <div className="rounded-2xl border border-white/[0.07] bg-[#11161d] p-5">
                <div className="mb-5 flex items-center justify-between"><div><h2 className="text-sm font-semibold">Fila de produção</h2><p className="mt-1 text-[11px] text-slate-500">Acompanhe o andamento dos trabalhos</p></div><button onClick={() => setActive("Fila de produção")} className="text-[11px] font-semibold text-red-300">Ver fila <ChevronRight size={13} className="inline"/></button></div>
                <div className="space-y-4">{jobs.map((job) => <div key={job.name} className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-start gap-3"><div className="rounded-lg bg-white/[0.05] p-2 text-slate-400"><FileBox size={18}/></div><div><div className="text-xs font-semibold">{job.name}</div><div className="mt-1 text-[10px] text-slate-500">{job.printer} <span className="px-1.5 text-slate-700">·</span>{job.material}</div></div></div><span className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${job.progress ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"}`}>{job.state}</span></div>
                  <div className="mt-4 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-red-400" style={{width:`${job.progress}%`}}/></div><span className="w-8 text-right text-[10px] tabular-nums text-slate-400">{job.progress}%</span></div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500"><span className="flex items-center gap-1.5"><Clock3 size={12}/>{job.time} restantes</span><span>Custo previsto <b className="ml-1 font-semibold text-slate-300">{job.cost}</b></span><div className="flex gap-1">{job.progress ? <><button className="rounded-md border border-white/10 p-1.5 text-slate-400"><Pause size={12}/></button><button className="rounded-md border border-white/10 p-1.5 text-slate-400"><MoreHorizontal size={12}/></button></> : <button className="rounded-md border border-red-400/20 p-1.5 text-red-300"><Play size={12}/></button>}</div></div>
                </div>)}</div>
                <p className="mt-4 text-[9px] text-slate-600">Dados ilustrativos para demonstração da interface — impressoras ainda não conectadas.</p>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-white/[0.07] bg-[#11161d] p-5">
                  <div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-semibold">Minha frota</h2><p className="mt-1 text-[11px] text-slate-500">Status dos dispositivos</p></div><button onClick={() => setActive("Impressoras")} className="text-[11px] text-red-300">Gerenciar</button></div>
                  <Device name="Bambu Lab X1 Carbon" model="X1C · Oficina principal" state="Imprimindo" online/>
                  <Device name="Bambu Lab P1S" model="P1S · Oficina principal" state="Imprimindo" online/>
                  <Device name="Bambu Lab A1" model="A1 · Não conectada" state="Offline" online={false}/>
                  <button onClick={() => setActive("Impressoras")} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-2.5 text-[11px] text-slate-400 hover:border-red-400/30 hover:text-red-300"><Plus size={13}/> Adicionar dispositivo</button>
                </div>
                <div className="rounded-2xl border border-white/[0.07] bg-[#11161d] p-5">
                  <div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-semibold">Resumo de custos</h2><p className="mt-1 text-[11px] text-slate-500">Estimativa do período</p></div><select value={period} onChange={e=>setPeriod(e.target.value)} className="rounded-lg border border-white/10 bg-[#0d1117] px-2 py-1.5 text-[10px] text-slate-300 outline-none"><option>Este mês</option><option>Últimos 7 dias</option><option>Este ano</option></select></div>
                  <div className="mb-4 text-2xl font-bold tracking-tight">R$ 384,60</div>
                  <CostLine icon={Boxes} label="Filamentos" amount="R$ 312,40" percent="81%"/>
                  <CostLine icon={Zap} label="Energia elétrica" amount="R$ 72,20" percent="19%"/>
                  <div className="mt-4 rounded-lg bg-red-400/[0.06] p-3 text-[10px] leading-relaxed text-slate-400">Configure o preço por kg de cada filamento e sua tarifa de energia para calcular custos por impressão com mais precisão.</div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <QuickLink icon={Library} title="Biblioteca de projetos" description="Seus modelos, arquivos e coleções" onClick={()=>setActive("Biblioteca")}/>
              <QuickLink icon={Search} title="Explorar MakerWorld" description="Encontre novos projetos para imprimir" onClick={()=>setActive("Explorar projetos")}/>
              <QuickLink icon={Gauge} title="Calculadora de custos" description="Simule material, energia e tempo" onClick={()=>setActive("Custos e relatórios")}/>
            </div>
            <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-5 text-[9px] text-slate-600"><span>MS 3D Studio · Plataforma de gestão de impressão 3D</span><span className="flex items-center gap-1.5"><Wifi size={11}/> Ambiente de demonstração</span></footer>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({icon:Icon,label,value,detail,accent}:{icon:typeof Printer;label:string;value:string;detail:string;accent:string}) {
  const styles:Record<string,string>={orange:"bg-red-400/10 text-red-300",blue:"bg-[#0750a6]/20 text-blue-200",violet:"bg-violet-400/10 text-violet-300",green:"bg-emerald-400/10 text-emerald-300"};
  return <div className="rounded-2xl border border-white/[0.07] bg-[#11161d] p-4"><div className="mb-4 flex items-center justify-between"><span className="text-[11px] text-slate-500">{label}</span><span className={`rounded-lg p-2 ${styles[accent]}`}><Icon size={16}/></span></div><div className="text-[25px] font-bold tracking-tight">{value}</div><div className="mt-1 text-[10px] text-slate-500">{detail}</div></div>;
}
function Device({name,model,state,online}:{name:string;model:string;state:string;online:boolean}) {
  return <div className="flex items-center gap-3 border-b border-white/[0.05] py-3 last:border-0"><div className="rounded-lg bg-white/[0.05] p-2 text-slate-400"><Printer size={17}/></div><div className="min-w-0 flex-1"><div className="truncate text-[11px] font-semibold">{name}</div><div className="mt-1 text-[9px] text-slate-500">{model}</div></div><div className="text-right"><div className={`mb-1 flex items-center justify-end gap-1.5 text-[9px] ${online?"text-emerald-300":"text-slate-500"}`}><span className={`h-1.5 w-1.5 rounded-full ${online?"bg-emerald-400":"bg-slate-600"}`}/>{state}</div><div className="text-[9px] text-slate-600">{online?"LAN":"—"}</div></div></div>;
}
function CostLine({icon:Icon,label,amount,percent}:{icon:typeof Boxes;label:string;amount:string;percent:string}) {
  return <div className="mb-3"><div className="mb-2 flex items-center justify-between text-[10px]"><span className="flex items-center gap-2 text-slate-400"><Icon size={13}/>{label}</span><b className="text-slate-200">{amount}</b></div><div className="h-1 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-red-400" style={{width:percent}}/></div></div>;
}
function QuickLink({icon:Icon,title,description,onClick}:{icon:typeof Library;title:string;description:string;onClick:()=>void}) {
  return <button onClick={onClick} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-[#11161d] p-4 text-left transition hover:border-red-400/25 hover:bg-[#151b23]"><div className="rounded-xl bg-red-400/10 p-2.5 text-red-300"><Icon size={18}/></div><div className="min-w-0 flex-1"><div className="text-xs font-semibold">{title}</div><div className="mt-1 text-[10px] text-slate-500">{description}</div></div><ChevronRight size={15} className="text-slate-600"/></button>;
}
