import { useState, useEffect } from "react";
import { addProducto, getProductos } from "./productos";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_PRODUCTS = [
  { id:"p1", sku:"SKU-001", title:"Silla Ergonómica Negra", category:"Muebles", stockML:8, stockInternal:10, price:45000, status:"active", sales:152, monthlySales:23, locations:[{name:"Estantería A-2",units:6},{name:"Pasillo B-1",units:4}], image:"🪑", lowThreshold:5, criticalThreshold:1 },
  { id:"p2", sku:"SKU-002", title:"Monitor 24'' Full HD", category:"Electrónica", stockML:3, stockInternal:3, price:89000, status:"active", sales:87, monthlySales:14, locations:[{name:"Sector Tech-3",units:3}], image:"🖥️", lowThreshold:5, criticalThreshold:1 },
  { id:"p3", sku:"SKU-003", title:"Teclado Mecánico RGB", category:"Electrónica", stockML:0, stockInternal:0, price:32000, status:"active", sales:210, monthlySales:31, locations:[], image:"⌨️", lowThreshold:5, criticalThreshold:1 },
  { id:"p4", sku:"SKU-004", title:"Auriculares Bluetooth Pro", category:"Audio", stockML:12, stockInternal:15, price:28000, status:"active", sales:63, monthlySales:9, locations:[{name:"Caja C-4",units:15}], image:"🎧", lowThreshold:5, criticalThreshold:1 },
  { id:"p5", sku:"SKU-005", title:"Webcam 1080p HD", category:"Electrónica", stockML:2, stockInternal:2, price:18500, status:"active", sales:95, monthlySales:18, locations:[{name:"Sector Tech-1",units:2}], image:"📷", lowThreshold:5, criticalThreshold:1 },
  { id:"p6", sku:"SKU-006", title:"Lámpara LED Escritorio", category:"Iluminación", stockML:20, stockInternal:22, price:9800, status:"active", sales:341, monthlySales:42, locations:[{name:"Estantería D-1",units:22}], image:"💡", lowThreshold:5, criticalThreshold:1 },
  { id:"p7", sku:"SKU-007", title:"Mouse Inalámbrico Silent", category:"Electrónica", stockML:4, stockInternal:4, price:12000, status:"paused", sales:178, monthlySales:7, locations:[{name:"Sector Tech-2",units:4}], image:"🖱️", lowThreshold:5, criticalThreshold:1 },
  { id:"p8", sku:"SKU-008", title:"Soporte para Monitor", category:"Accesorios", stockML:1, stockInternal:1, price:15000, status:"active", sales:44, monthlySales:5, locations:[{name:"Pasillo A-3",units:1}], image:"🔧", lowThreshold:5, criticalThreshold:1 },
];

const MOCK_MOVEMENTS = [
  { id:"m1", product:"Silla Ergonómica Negra", type:"sale", qty:-2, before:12, after:10, source:"mercadolibre", user:"Sistema ML", date:"01/06 14:32" },
  { id:"m2", product:"Teclado Mecánico RGB", type:"sale", qty:-1, before:1, after:0, source:"mercadolibre", user:"Sistema ML", date:"01/06 11:15" },
  { id:"m3", product:"Lámpara LED Escritorio", type:"purchase", qty:10, before:12, after:22, source:"manual", user:"Juan Pérez", date:"31/05 09:00" },
  { id:"m4", product:"Auriculares Bluetooth Pro", type:"adjustment", qty:3, before:12, after:15, source:"manual", user:"Admin", date:"30/05 16:45" },
  { id:"m5", product:"Webcam 1080p HD", type:"sale", qty:-1, before:3, after:2, source:"mercadolibre", user:"Sistema ML", date:"30/05 13:20" },
  { id:"m6", product:"Monitor 24'' Full HD", type:"sale", qty:-2, before:5, after:3, source:"mercadolibre", user:"Sistema ML", date:"29/05 18:00" },
];

const MOCK_LOCATIONS = [
  { id:"l1", name:"Estantería A-1", sector:"A", capacity:40, used:28, products:["p4"] },
  { id:"l2", name:"Estantería A-2", sector:"A", capacity:30, used:6, products:["p1"] },
  { id:"l3", name:"Pasillo A-3", sector:"A", capacity:20, used:1, products:["p8"] },
  { id:"l4", name:"Pasillo B-1", sector:"B", capacity:50, used:4, products:["p1"] },
  { id:"l5", name:"Sector Tech-1", sector:"Tech", capacity:25, used:2, products:["p5"] },
  { id:"l6", name:"Sector Tech-2", sector:"Tech", capacity:25, used:4, products:["p7"] },
  { id:"l7", name:"Sector Tech-3", sector:"Tech", capacity:20, used:3, products:["p2"] },
  { id:"l8", name:"Caja C-4", sector:"C", capacity:60, used:15, products:["p4"] },
  { id:"l9", name:"Estantería D-1", sector:"D", capacity:80, used:22, products:["p6"] },
];

const getStatus = (p) => {
  if (p.stockInternal === 0) return "critical";
  if (p.stockInternal <= p.criticalThreshold) return "critical";
  if (p.stockInternal <= p.lowThreshold) return "warning";
  return "ok";
};

const ALERTS = MOCK_PRODUCTS.filter(p => getStatus(p) !== "ok").map(p => ({
  id:`a-${p.id}`, product:p.title, sku:p.sku, type:getStatus(p),
  stock:p.stockInternal, threshold:p.lowThreshold, mlActive:p.status==="active",
}));

// ─── ICONS ───────────────────────────────────────────────────────────────────
const I = ({ n, s=16, c="" }) => {
  const d = {
    grid:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={c}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    box:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={c}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    wave:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={c}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    bell:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={c}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    pin:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={c}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    clock:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={c}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    cog:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={c}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    sync:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={c}><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/></svg>,
    plus:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={c}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    search:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={c}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    edit:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={c}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    x:       <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={c}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    warn:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={c}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    check:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={c}><polyline points="20 6 9 17 4 12"/></svg>,
    menu:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={c}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    export:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={c}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  };
  return d[n] || null;
};

// ─── MINI COMPONENTS ─────────────────────────────────────────────────────────
const Tag = ({ product }) => {
  const s = getStatus(product);
  const cfg = {
    ok:       "border-emerald-500/30 text-emerald-400 bg-emerald-500/8",
    warning:  "border-amber-500/30 text-amber-400 bg-amber-500/8",
    critical: "border-red-500/30 text-red-400 bg-red-500/8",
  };
  const labels = { ok:"NORMAL", warning:"BAJO", critical: product.stockInternal===0?"AGOTADO":"CRÍTICO" };
  return <span className={`text-[9px] font-black tracking-[0.15em] border px-2 py-0.5 rounded ${cfg[s]}`}>{labels[s]}</span>;
};

const Bar = ({ pct, color="bg-[#f97316]" }) => (
  <div className="w-full h-[3px] bg-white/6 rounded-full overflow-hidden">
    <div className={`h-full rounded-full ${color}`} style={{width:`${Math.min(pct,100)}%`}}/>
  </div>
);

// ─── MODALS ──────────────────────────────────────────────────────────────────
const EditModal = ({ product, onClose, onSave }) => {
  const [val, setVal] = useState(product.stockInternal);
  const [note, setNote] = useState("");
  const diff = val - product.stockInternal;
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111318] border border-white/10 rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-white/6">
          <div>
            <p className="font-black text-white text-sm">{product.title}</p>
            <p className="text-[10px] text-white/30 font-mono mt-0.5">{product.sku}</p>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white transition-colors"><I n="x" s={15}/></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/4 border border-white/6 rounded-xl p-3 text-center">
              <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Actual</p>
              <p className="text-3xl font-black text-white">{product.stockInternal}</p>
            </div>
            <div className="bg-[#f97316]/8 border border-[#f97316]/20 rounded-xl p-3 text-center">
              <p className="text-[9px] text-[#f97316]/60 uppercase tracking-widest mb-1">ML</p>
              <p className="text-3xl font-black text-[#f97316]">{product.stockML}</p>
            </div>
          </div>
          <div>
            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2">Nuevo stock</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setVal(Math.max(0,val-1))} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white font-black text-lg transition-colors">−</button>
              <input type="number" value={val} onChange={e => setVal(Math.max(0,parseInt(e.target.value)||0))} className="flex-1 h-10 bg-white/5 border border-white/8 rounded-lg text-center text-white text-xl font-black outline-none focus:border-[#f97316]/40"/>
              <button onClick={() => setVal(val+1)} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white font-black text-lg transition-colors">+</button>
            </div>
            {diff!==0 && <p className={`text-xs font-mono mt-1.5 ${diff>0?"text-emerald-400":"text-red-400"}`}>{diff>0?`+${diff}`:diff} unidades</p>}
          </div>
          <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Motivo del ajuste..." rows={2} className="w-full bg-white/4 border border-white/6 rounded-xl p-3 text-sm text-white placeholder-white/20 outline-none resize-none focus:border-[#f97316]/30"/>
        </div>
        <div className="flex gap-2 p-5 border-t border-white/6">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl bg-white/5 text-white/40 text-sm hover:bg-white/8 transition-colors">Cancelar</button>
          <button onClick={() => onSave(product.id, val)} className="flex-1 h-10 rounded-xl bg-[#f97316] hover:bg-[#e8650a] text-white font-black text-sm transition-colors">Guardar</button>
        </div>
      </div>
    </div>
  );
};

const NuevoModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ title:"", sku:"", category:"", price:"", stock:"", location:"" });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const fields = [
    {k:"title",l:"Nombre del producto",p:"Ej: Silla Ergonómica",full:true},
    {k:"sku",l:"SKU / Código",p:"SKU-001"},
    {k:"category",l:"Categoría",p:"Muebles"},
    {k:"price",l:"Precio ($)",p:"45000"},
    {k:"stock",l:"Stock inicial",p:"10"},
    {k:"location",l:"Ubicación en depósito",p:"Estantería A-1",full:true},
  ];
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111318] border border-white/10 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-white/6">
          <div>
            <p className="font-black text-white">Nuevo Producto</p>
            <p className="text-[10px] text-white/30 mt-0.5 uppercase tracking-widest">Guardar en Firebase</p>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white transition-colors"><I n="x" s={15}/></button>
        </div>
        <div className="p-5 grid grid-cols-2 gap-3">
          {fields.map(({k,l,p,full})=>(
            <div key={k} className={full?"col-span-2":""}>
              <label className="text-[9px] text-white/30 uppercase tracking-widest mb-1.5 block">{l}</label>
              <input value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={p}
                className="w-full h-10 bg-white/4 border border-white/6 rounded-xl px-3 text-sm text-white placeholder-white/15 outline-none focus:border-[#f97316]/40 transition-colors"/>
            </div>
          ))}
        </div>
        <div className="flex gap-2 p-5 border-t border-white/6">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl bg-white/5 text-white/40 text-sm hover:bg-white/8 transition-colors">Cancelar</button>
          <button onClick={()=>onSave(form)} className="flex-1 h-10 rounded-xl bg-[#f97316] hover:bg-[#e8650a] text-white font-black text-sm transition-colors flex items-center justify-center gap-2">
            <I n="plus" s={14}/>Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
const DashboardPage = ({ products, onEdit, mlConnected = false }) => {
  const noStock   = products.filter(p=>p.stockInternal===0).length;
  const lowStock  = products.filter(p=>getStatus(p)==="warning").length;
  const totalVal  = products.reduce((a,p)=>a+p.price*p.stockInternal,0);
  const topMovers = [...products].sort((a,b)=>b.monthlySales-a.monthlySales).slice(0,5);
  const fecha = new Date().toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"});

  return (
    <div className="space-y-6">

      {/* Header row */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[9px] font-black text-[#f97316] uppercase tracking-[0.25em] mb-2">Panel de control</p>
          <h1 className="text-4xl font-black text-white leading-none tracking-tight">Dashboard</h1>
          <p className="text-sm text-white/30 mt-2 capitalize">{fecha}</p>
        </div>
        <div className={`shrink-0 flex items-center gap-2 border px-3 py-1.5 rounded-full ${mlConnected ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-white/30"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${mlConnected ? "bg-emerald-400 animate-pulse" : "bg-white/30"}`}/>
          <span className="text-[10px] font-black uppercase tracking-widest">{mlConnected ? "ML Conectado" : "ML Desconectado"}</span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {label:"PRODUCTOS",  val:products.length,          sub:"en catálogo",        accent:"#f97316", glow:"shadow-[0_0_20px_rgba(249,115,22,0.08)]"},
          {label:"AGOTADOS",   val:noStock,                  sub:"requieren reposición",accent:"#ef4444", glow:"shadow-[0_0_20px_rgba(239,68,68,0.08)]"},
          {label:"STOCK BAJO", val:lowStock,                 sub:"menos de 5 unidades", accent:"#f59e0b", glow:"shadow-[0_0_20px_rgba(245,158,11,0.08)]"},
          {label:"VALOR",      val:`$${(totalVal/1000).toFixed(0)}K`, sub:"en inventario", accent:"#10b981", glow:"shadow-[0_0_20px_rgba(16,185,129,0.08)]"},
        ].map(({label,val,sub,accent,glow})=>(
          <div key={label} className={`bg-[#111318] border border-white/8 rounded-2xl p-5 relative overflow-hidden hover:border-white/15 transition-colors ${glow}`}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{background:`linear-gradient(90deg, transparent, ${accent}80, transparent)`}}/>
            <p className="text-[9px] font-black tracking-[0.2em] mb-4" style={{color:accent}}>{label}</p>
            <p className="text-5xl font-black text-white leading-none">{val}</p>
            <p className="text-xs text-white/25 mt-2">{sub}</p>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Rotación */}
        <div className="lg:col-span-2 bg-[#111318] border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between">
            <p className="font-black text-white tracking-tight">Mayor rotación</p>
            <p className="text-[9px] text-white/25 uppercase tracking-widest">últimos 30 días</p>
          </div>
          <div className="divide-y divide-white/4">
            {topMovers.map((p,i)=>{
              const s = getStatus(p);
              const barColor = s==="ok"?"bg-emerald-500":s==="warning"?"bg-amber-500":"bg-red-500";
              return (
                <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 group hover:bg-white/2 transition-colors">
                  <span className="text-[10px] font-black text-white/15 w-4 shrink-0">0{i+1}</span>
                  <span className="text-xl w-7 shrink-0">{p.image}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{p.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Bar pct={(p.stockInternal/20)*100} color={barColor}/>
                      <span className="text-[10px] text-white/25 shrink-0 font-mono">{p.stockInternal}u</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-[#f97316] leading-none">{p.monthlySales}</p>
                    <p className="text-[9px] text-white/25 uppercase tracking-widest mt-0.5">ventas</p>
                  </div>
                  <Tag product={p}/>
                  <button onClick={()=>onEdit(p)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-[#f97316] transition-all ml-1">
                    <I n="edit" s={14}/>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alertas */}
        <div className="bg-[#111318] border border-white/8 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between shrink-0">
            <p className="font-black text-white tracking-tight">Alertas</p>
            <span className="text-[9px] font-black bg-red-500/12 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest">{ALERTS.length} activas</span>
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-white/4">
            {ALERTS.map(a=>(
              <div key={a.id} className={`px-4 py-3.5 flex items-start gap-3 border-l-2 ${a.type==="critical"?"border-red-500":"border-amber-500"}`}>
                <I n="warn" s={13} c={`mt-0.5 shrink-0 ${a.type==="critical"?"text-red-400":"text-amber-400"}`}/>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{a.product}</p>
                  <p className={`text-[10px] mt-0.5 ${a.type==="critical"?"text-red-400":"text-amber-400"}`}>
                    {a.stock===0?"Sin stock disponible":`${a.stock} unidades restantes`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Tabla */}
      <div className="bg-[#111318] border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between">
          <p className="font-black text-white tracking-tight">Inventario</p>
          <span className="text-[9px] text-[#f97316] uppercase tracking-widest font-bold cursor-pointer hover:underline">Ver todos →</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/4">
                {["Producto","SKU","Ubicación","ML","Interno","Estado",""].map(h=>(
                  <th key={h} className="text-left text-[9px] font-black text-white/25 uppercase tracking-widest px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/3">
              {products.slice(0,6).map(p=>{
                const s = getStatus(p);
                const stockColor = s==="ok"?"text-white":s==="warning"?"text-amber-400":"text-red-400";
                return (
                  <tr key={p.id} className="group hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="text-base">{p.image}</span>
                        <span className="text-sm font-semibold text-white">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[10px] text-white/30">{p.sku}</td>
                    <td className="px-5 py-3.5 text-[10px] text-white/40">{p.locations?.[0]?.name || "—"}</td>
                    <td className="px-5 py-3.5 font-black text-[#f97316] text-lg">{p.stockML}</td>
                    <td className="px-5 py-3.5 font-black text-lg"><span className={stockColor}>{p.stockInternal}</span></td>
                    <td className="px-5 py-3.5"><Tag product={p}/></td>
                    <td className="px-5 py-3.5">
                      <button onClick={()=>onEdit(p)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-[#f97316] transition-all"><I n="edit" s={14}/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── OTHER PAGES ─────────────────────────────────────────────────────────────
const ProductsPage = ({ products, onEdit }) => {
  const [q, setQ] = useState("");
  const [f, setF] = useState("all");
  const list = products.filter(p=>{
    const ms = p.title.toLowerCase().includes(q.toLowerCase())||p.sku.toLowerCase().includes(q.toLowerCase());
    const mf = f==="all"||(f==="active"?p.status==="active":p.status!=="active");
    return ms&&mf;
  });
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[9px] font-black text-[#f97316] uppercase tracking-[0.25em] mb-2">Catálogo</p>
          <h1 className="text-4xl font-black text-white leading-none tracking-tight">Productos</h1>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 text-xs px-3 py-2 bg-white/5 hover:bg-white/8 text-white/50 rounded-xl border border-white/8 transition-colors"><I n="export" s={13}/>Exportar</button>
          <button className="flex items-center gap-1.5 text-xs px-3 py-2 bg-[#f97316] hover:bg-[#e8650a] text-white font-black rounded-xl transition-colors"><I n="sync" s={13}/>Sincronizar ML</button>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <I n="search" s={13} c="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25"/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar producto o SKU..." className="w-full pl-9 pr-4 h-10 bg-[#111318] border border-white/8 rounded-xl text-sm text-white placeholder-white/15 outline-none focus:border-[#f97316]/30"/>
        </div>
        <select value={f} onChange={e=>setF(e.target.value)} className="h-10 bg-[#111318] border border-white/8 rounded-xl text-sm text-white/50 px-3 outline-none">
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="paused">Pausados</option>
        </select>
      </div>
      <div className="space-y-2">
        {list.map(p=>{
          const s = getStatus(p);
          const sc = s==="ok"?"text-white":s==="warning"?"text-amber-400":"text-red-400";
          return (
            <div key={p.id} className="bg-[#111318] border border-white/8 rounded-2xl p-4 flex items-center gap-4 group hover:border-white/15 transition-all">
              <div className="w-12 h-12 bg-white/4 rounded-xl flex items-center justify-center text-2xl shrink-0 border border-white/6">{p.image}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-black text-white text-sm">{p.title}</p>
                  <span className={`text-[9px] font-black border px-2 py-0.5 rounded ${p.status==="active"?"bg-emerald-500/8 text-emerald-400 border-emerald-500/20":"bg-white/4 text-white/25 border-white/8"}`}>{p.status==="active"?"ACTIVO":"PAUSADO"}</span>
                  <Tag product={p}/>
                </div>
                <div className="flex gap-4 mt-1 text-[10px] text-white/25">
                  <span className="font-mono">{p.sku}</span><span>{p.category}</span><span>${p.price.toLocaleString("es-AR")}</span>
                </div>
              </div>
              <div className="flex items-center gap-5 shrink-0">
                <div className="text-center"><p className="text-[9px] text-white/25 uppercase tracking-widest mb-0.5">ML</p><p className="text-2xl font-black text-[#f97316] leading-none">{p.stockML}</p></div>
                <div className="text-center"><p className="text-[9px] text-white/25 uppercase tracking-widest mb-0.5">Interno</p><p className={`text-2xl font-black leading-none ${sc}`}>{p.stockInternal}</p></div>
                <button onClick={()=>onEdit(p)} className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs px-3 py-2 bg-white/5 hover:bg-white/10 text-white/50 rounded-xl border border-white/8 transition-all"><I n="edit" s={13}/>Editar</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AlertsPage = ({ products = [] }) => {
  const rawAlerts = products.filter(p => getStatus(p) !== "ok").map(p => ({id:`a-${p.id}`, product:p.title, sku:p.sku, type:getStatus(p), stock:p.stockInternal, threshold:p.lowThreshold}));
  const [resolved, setResolved] = useState([]);
  const alerts = rawAlerts.filter(a => !resolved.includes(a.id));
  const resolve = id => setResolved(r => [...r, id]);
  
  
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[9px] font-black text-[#f97316] uppercase tracking-[0.25em] mb-2">Notificaciones</p>
        <h1 className="text-4xl font-black text-white leading-none tracking-tight">Alertas</h1>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          {l:"Sin stock", v:alerts.filter(a=>a.stock===0).length, c:"#ef4444"},
          {l:"Crítico",   v:alerts.filter(a=>a.type==="critical"&&a.stock>0).length, c:"#f97316"},
          {l:"Stock bajo",v:alerts.filter(a=>a.type==="warning").length, c:"#f59e0b"},
        ].map(({l,v,c})=>(
          <div key={l} className="bg-[#111318] border border-white/8 rounded-2xl p-5 text-center">
            <div className="w-px h-8 mx-auto mb-3 rounded" style={{background:c,width:"3px"}}/>
            <p className="text-5xl font-black text-white">{v}</p>
            <p className="text-[9px] text-white/25 uppercase tracking-widest mt-2">{l}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {alerts.map(a=>(
          <div key={a.id} className={`bg-[#111318] border rounded-2xl p-4 flex items-center gap-4 ${a.type==="critical"?"border-red-500/20":"border-amber-500/20"}`}>
            <div className={`w-1.5 h-12 rounded-full shrink-0 ${a.type==="critical"?"bg-red-500":"bg-amber-500"}`}/>
            <div className="flex-1">
              <p className="font-black text-white text-sm">{a.product}</p>
              <p className={`text-xs mt-0.5 ${a.type==="critical"?"text-red-400":"text-amber-400"}`}>
                {a.stock===0?"Sin unidades disponibles":`${a.stock} unidades — umbral: ${a.threshold}`}
              </p>
            </div>
            <button onClick={()=>resolve(a.id)} className="flex items-center gap-1.5 text-xs px-3 py-2 bg-white/4 hover:bg-emerald-500/12 hover:text-emerald-400 text-white/30 rounded-xl border border-white/8 transition-colors">
              <I n="check" s={13}/>Resolver
            </button>
          </div>
        ))}
        {alerts.length===0 && <div className="bg-[#111318] border border-white/8 rounded-2xl p-8 text-center"><p className="text-white/25 text-sm">No hay alertas activas</p></div>}
      </div>
    </div>
  );
};

const LocationsPage = ({ products }) => {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);

  // Construir ubicaciones dinámicamente desde los productos reales
  const allLocations = [];
  const locMap = {};
  products.forEach(p => {
    if (!p.locations) return;
    p.locations.forEach(loc => {
      if (!loc.name) return;
      if (!locMap[loc.name]) {
        locMap[loc.name] = { name: loc.name, sector: loc.name.split(/[0-9]/)[0].trim() || "General", used: 0, capacity: 100, prods: [] };
        allLocations.push(locMap[loc.name]);
      }
      locMap[loc.name].used += (loc.units || p.stockInternal || 0);
      locMap[loc.name].prods.push(p);
    });
  });

  const sectors = [...new Set(allLocations.map(l => l.sector))].sort();
  const filtered = allLocations.filter(l => l.name.toLowerCase().includes(q.toLowerCase()));

  const getProdsForLoc = (loc) => locMap[loc.name]?.prods || [];

  if (selected) {
    const locProds = getProdsForLoc(selected);
    const pct = Math.round((selected.used/selected.capacity)*100);
    const bc = pct>85?"bg-red-500":pct>60?"bg-amber-500":"bg-emerald-500";
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={()=>setSelected(null)} className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Volver al depósito
          </button>
        </div>
        <div>
          <p className="text-[9px] font-black text-[#f97316] uppercase tracking-[0.25em] mb-2">Sector {selected.sector}</p>
          <h1 className="text-4xl font-black text-white leading-none tracking-tight">{selected.name}</h1>
        </div>
        <div className="bg-[#111318] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-black text-white">Capacidad</p>
            <span className="text-xs font-black text-white/30 font-mono">{selected.used} / {selected.capacity} u. — {pct}%</span>
          </div>
          <Bar pct={pct} color={bc}/>
        </div>
        <div>
          <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.2em] mb-3">Productos en esta ubicación ({locProds.length})</p>
          {locProds.length === 0 ? (
            <div className="bg-[#111318] border border-white/8 rounded-2xl p-8 text-center">
              <p className="text-white/25 text-sm">No hay productos asignados a esta ubicación</p>
            </div>
          ) : (
            <div className="space-y-2">
              {locProds.map(p => {
                const s = getStatus(p);
                const sc = s==="ok"?"text-white":s==="warning"?"text-amber-400":"text-red-400";
                const locInfo = p.locations && p.locations.find(l=>l.name===selected.name);
                return (
                  <div key={p.id||p.sku} className="bg-[#111318] border border-white/8 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/4 rounded-xl flex items-center justify-center text-2xl shrink-0 border border-white/6">{p.image||"📦"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-white text-sm">{p.title}</p>
                        <Tag product={p}/>
                      </div>
                      <div className="flex gap-4 mt-1 text-[10px] text-white/25">
                        <span className="font-mono">{p.sku}</span>
                        <span>{p.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-5 shrink-0">
                      {locInfo && (
                        <div className="text-center">
                          <p className="text-[9px] text-white/25 uppercase tracking-widest mb-0.5">En este lugar</p>
                          <p className="text-2xl font-black text-[#f97316] leading-none">{locInfo.units}</p>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-[9px] text-white/25 uppercase tracking-widest mb-0.5">Total</p>
                        <p className={`text-2xl font-black leading-none ${sc}`}>{p.stockInternal}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[9px] font-black text-[#f97316] uppercase tracking-[0.25em] mb-2">Logística</p>
          <h1 className="text-4xl font-black text-white leading-none tracking-tight">Depósito</h1>
          <p className="text-xs text-white/25 mt-2">{allLocations.length} ubicaciones · {products.length} productos</p>
        </div>
      </div>
      <div className="relative">
        <I n="search" s={13} c="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25"/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar ubicación..." className="w-full pl-9 pr-4 h-10 bg-[#111318] border border-white/8 rounded-xl text-sm text-white placeholder-white/15 outline-none focus:border-[#f97316]/30"/>
      </div>
      {filtered.length === 0 && (
        <div className="bg-[#111318] border border-white/8 rounded-2xl p-8 text-center">
          <p className="text-white/25 text-sm">No se encontraron ubicaciones</p>
        </div>
      )}
      {sectors.map(sector=>{
        const locs = filtered.filter(l=>l.sector===sector);
        if(!locs.length) return null;
        return (
          <div key={sector}>
            <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.2em] mb-3">Sector {sector}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {locs.map(loc=>{
                const locProds = getProdsForLoc(loc);
                const totalUnits = locProds.reduce((a,p)=>{
                  const li = p.locations?.find(l=>l.name===loc.name);
                  return a + (li?.units || p.stockInternal || 0);
                }, 0);
                const pct = Math.min(Math.round((totalUnits/100)*100), 100);
                const bc = pct>85?"bg-red-500":pct>60?"bg-amber-500":"bg-emerald-500";
                return (
                  <button key={loc.name} onClick={()=>setSelected(loc)}
                    className="bg-[#111318] border border-white/8 rounded-2xl p-4 hover:border-[#f97316]/40 hover:bg-white/2 transition-all text-left group">
                    <div className="flex items-start justify-between mb-3">
                      <p className="font-black text-white text-sm group-hover:text-[#f97316] transition-colors">{loc.name}</p>
                      <span className="text-[10px] font-black text-white/30">{locProds.length} prod.</span>
                    </div>
                    <Bar pct={pct} color={bc}/>
                    <p className="text-[10px] text-white/25 mt-2">{totalUnits} unidades</p>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const HistoryPage = () => {
  const cfg = {
    sale:       {l:"VENTA",   c:"text-red-400",     b:"bg-red-500/8 border-red-500/20"},
    purchase:   {l:"COMPRA",  c:"text-emerald-400", b:"bg-emerald-500/8 border-emerald-500/20"},
    adjustment: {l:"AJUSTE",  c:"text-blue-400",    b:"bg-blue-500/8 border-blue-500/20"},
  };
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[9px] font-black text-[#f97316] uppercase tracking-[0.25em] mb-2">Registro</p>
        <h1 className="text-4xl font-black text-white leading-none tracking-tight">Historial</h1>
      </div>
      <div className="bg-[#111318] border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/6">
              {["Fecha","Producto","Tipo","Origen","Cambio","Stock"].map(h=>(
                <th key={h} className="text-left text-[9px] font-black text-white/25 uppercase tracking-widest px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/3">
            {MOCK_MOVEMENTS.map(m=>{
              const t = cfg[m.type]||cfg.adjustment;
              return (
                <tr key={m.id} className="group hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5 text-[10px] text-white/25 font-mono whitespace-nowrap">{m.date}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-white">{m.product}</td>
                  <td className="px-5 py-3.5"><span className={`text-[9px] font-black border px-2 py-0.5 rounded ${t.b} ${t.c}`}>{t.l}</span></td>
                  <td className="px-5 py-3.5"><span className={`text-xs font-semibold ${m.source==="mercadolibre"?"text-[#f97316]":"text-white/25"}`}>{m.source==="mercadolibre"?"Mercado Libre":"Manual"}</span></td>
                  <td className="px-5 py-3.5"><span className={`text-base font-black ${m.qty>0?"text-emerald-400":"text-red-400"}`}>{m.qty>0?`+${m.qty}`:m.qty}</span></td>
                  <td className="px-5 py-3.5 text-[10px] text-white/25 font-mono">{m.before} → <span className="text-white font-black">{m.after}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SettingsPage = () => (
  <div className="space-y-5">
    <div>
      <p className="text-[9px] font-black text-[#f97316] uppercase tracking-[0.25em] mb-2">Sistema</p>
      <h1 className="text-4xl font-black text-white leading-none tracking-tight">Configuración</h1>
    </div>
    <div className="bg-[#111318] border border-white/8 rounded-2xl p-6 space-y-4">
      <p className="font-black text-white">Mercado Libre</p>
      <div className="flex items-center justify-between p-4 bg-emerald-500/6 border border-emerald-500/15 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/>
          <div><p className="text-sm font-semibold text-white">Cuenta conectada</p><p className="text-[10px] text-white/25 mt-0.5">TIENDA_ML · Seller ID: 123456789</p></div>
        </div>
        <button className="text-xs px-3 py-1.5 bg-red-500/8 hover:bg-red-500/15 text-red-400 rounded-lg border border-red-500/15 transition-colors">Desconectar</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[{l:"Sincronización",v:"Cada 30 min"},{l:"Última sync",v:"Hace 8 min"},{l:"Items sync",v:"8 publicaciones"},{l:"Webhook",v:"Activo"}].map(({l,v})=>(
          <div key={l} className="bg-white/3 border border-white/6 rounded-xl p-3">
            <p className="text-[9px] text-white/25 uppercase tracking-widest">{l}</p>
            <p className="text-sm font-black text-white mt-1">{v}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function StockML() {
  const [page, setPage]         = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(null);
  const [newOpen, setNewOpen]   = useState(false);
  const [sidebar, setSidebar]   = useState(false);
  const [syncing, setSyncing]   = useState(false);
  const [syncMsg, setSyncMsg]   = useState("");
  const [search, setSearch]     = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mlToken, setMlToken]   = useState("APP_USR-1864770524455888-031215-b0e09b4ee526790f7668f572709c52b2-2070821310");
  const [mlUserId, setMlUserId] = useState("2070821310");
  const [mlConnected, setMlConnected] = useState(true);

  // Leer token de ML desde la URL si acaba de autenticarse
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userId = params.get("user_id");
    if (token && userId) {
      sessionStorage.setItem("ml_token", token);
      sessionStorage.setItem("ml_user_id", userId);
      setMlToken(token);
      setMlUserId(userId);
      setMlConnected(true);
      window.history.replaceState({}, "", "/");
    }
  }, []);

  useEffect(() => {
    getProductos().then(data => {
      setProducts(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = (id, stock) => {
    setProducts(p=>p.map(x=>x.id===id?{...x,stockInternal:stock}:x));
    setEditing(null);
  };

  const handleSync = async () => {
    if (!mlConnected || !mlToken || !mlUserId) {
      // Redirigir a autorizar ML
      window.location.href = `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=1864770524455888&redirect_uri=https://stockml-fawn.vercel.app/auth/callback`;
      return;
    }
    setSyncing(true);
    setSyncMsg("Conectando con Mercado Libre...");
    try {
      const res = await fetch(`/api/ml-stock?token=${mlToken}&user_id=${mlUserId}`);
      const mlItems = await res.json();
      if (!Array.isArray(mlItems)) throw new Error("Respuesta inválida");
      setSyncMsg(`Sincronizando ${mlItems.length} publicaciones...`);
      // Actualizar stockML de cada producto que coincida por título o SKU
      setProducts(prev => prev.map(p => {
        const match = mlItems.find(item =>
          item.title?.toLowerCase().includes(p.title?.toLowerCase()) ||
          p.title?.toLowerCase().includes(item.title?.toLowerCase())
        );
        if (match) return { ...p, stockML: match.available_quantity ?? p.stockML };
        return p;
      }));
      setSyncMsg(`✓ ${mlItems.length} publicaciones actualizadas`);
      setTimeout(() => setSyncMsg(""), 3000);
    } catch(e) {
      setSyncMsg("Error al sincronizar");
      setTimeout(() => setSyncMsg(""), 3000);
    }
    setSyncing(false);
  };

  const alertCount = products.filter(p => getStatus(p) !== "ok").length;

  const searchResults = search.length > 1
    ? products.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase()) ||
        p.locations?.some(l => l.name?.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  const nav = [
    {id:"dashboard", label:"Dashboard",    icon:"grid"},
    {id:"products",  label:"Productos",    icon:"box"},
    {id:"alerts",    label:"Alertas",      icon:"bell", badge:alertCount},
    {id:"locations", label:"Depósito",     icon:"pin"},
    {id:"history",   label:"Historial",    icon:"clock"},
    {id:"settings",  label:"Configuración",icon:"cog"},
  ];

  const Page = () => {
    if (loading) return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
          <p className="text-white/40 text-sm">Cargando productos...</p>
        </div>
      </div>
    );
    switch(page) {
      case "dashboard": return <DashboardPage products={products} onEdit={setEditing} mlConnected={mlConnected}/>;
      case "products":  return <ProductsPage  products={products} onEdit={setEditing}/>;
      case "alerts":    return <AlertsPage products={products}/>;
      case "locations": return <LocationsPage products={products}/>;
      case "history":   return <HistoryPage/>;
      case "settings":  return <SettingsPage/>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0e12] text-white flex" style={{fontFamily:"'Syne',system-ui,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.06);border-radius:2px}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spin{animation:spin 1s linear infinite}
      `}</style>

      {sidebar && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={()=>setSidebar(false)}/>}

      {/* SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-52 bg-[#0e1015] border-r border-white/5 flex flex-col transition-transform duration-200 ${sidebar?"translate-x-0":"-translate-x-full lg:translate-x-0"}`}>
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#f97316] rounded-xl flex items-center justify-center shrink-0">
              <I n="box" s={16} c="text-white"/>
            </div>
            <div>
              <p className="font-black text-white text-sm tracking-tight leading-none">StockML</p>
              <p className="text-[8px] text-white/25 mt-1 uppercase tracking-[0.2em]">Gestión de stock</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(item=>(
            <button key={item.id} onClick={()=>{setPage(item.id);setSidebar(false)}}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${page===item.id?"bg-[#f97316]/12 text-[#f97316]":"text-white/35 hover:text-white hover:bg-white/4"}`}>
              <I n={item.icon} s={15}/>
              <span className="text-sm font-semibold flex-1">{item.label}</span>
              {item.badge>0 && <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1">{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5 space-y-2">
          <button onClick={()=>setNewOpen(true)} className="w-full flex items-center justify-center gap-2 h-9 rounded-xl bg-[#f97316] hover:bg-[#e8650a] text-white font-black text-sm transition-colors">
            <I n="plus" s={14}/>Nuevo producto
          </button>
          <button onClick={handleSync} disabled={syncing} className={`w-full flex items-center justify-center gap-2 h-9 rounded-xl text-sm font-semibold transition-all border ${syncing?"bg-white/3 text-white/20 border-white/5 cursor-not-allowed":mlConnected?"bg-[#f97316]/10 hover:bg-[#f97316]/20 text-[#f97316] border-[#f97316]/20":"bg-white/4 hover:bg-white/7 text-white/50 border-white/8"}`}>
            <I n="sync" s={13} c={syncing?"spin":""}/>
            {syncing ? (syncMsg || "Sincronizando...") : mlConnected ? "Sincronizar ML" : "Conectar ML"}
          </button>
          <div className="flex items-center gap-2.5 px-1 pt-2">
            <div className="w-7 h-7 rounded-full bg-[#f97316] flex items-center justify-center text-[10px] font-black text-white shrink-0">JP</div>
            <div>
              <p className="text-xs font-black text-white leading-none">Juan Pérez</p>
              <p className="text-[8px] text-white/25 mt-0.5 uppercase tracking-widest">Administrador</p>
            </div>
          </div>
        </div>
      </aside>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 bg-[#0e1015] border-b border-white/5 flex items-center px-5 gap-3 shrink-0">
          <button onClick={()=>setSidebar(true)} className="lg:hidden text-white/25 hover:text-white"><I n="menu"/></button>
          {/* BUSCADOR */}
          <div className="flex-1 max-w-sm relative">
            <I n="search" s={13} c="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"/>
            <input
              value={search}
              onChange={e=>{setSearch(e.target.value);setSearchOpen(true)}}
              onFocus={()=>setSearchOpen(true)}
              onBlur={()=>setTimeout(()=>setSearchOpen(false),200)}
              placeholder="Buscar producto, SKU, ubicación..."
              className="w-full pl-8 pr-4 h-8 bg-white/5 border border-white/8 rounded-lg text-xs text-white placeholder-white/20 outline-none focus:border-[#f97316]/30"
            />
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute top-10 left-0 right-0 bg-[#1a1d24] border border-white/10 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                {searchResults.slice(0,10).map(p=>{
                  const s = getStatus(p);
                  const sc = s==="ok"?"text-white":s==="warning"?"text-amber-400":"text-red-400";
                  return (
                    <button key={p.id} onMouseDown={()=>{setPage("products");setSearch("");setSearchOpen(false)}}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0">
                      <span className="text-lg shrink-0">{p.image||"📦"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{p.title}</p>
                        <div className="flex gap-2 text-[10px] text-white/30 mt-0.5">
                          <span className="font-mono">{p.sku}</span>
                          {p.locations?.length>0 && <span>📍 {p.locations[0].name}</span>}
                        </div>
                      </div>
                      <span className={`text-lg font-black shrink-0 ${sc}`}>{p.stockInternal}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className={`flex items-center gap-1.5 border px-3 py-1 rounded-full ${mlConnected ? "bg-emerald-500/8 border-emerald-500/15 text-emerald-400" : "bg-white/5 border-white/10 text-white/30"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${mlConnected ? "bg-emerald-400 animate-pulse" : "bg-white/30"}`}/>
            <span className="text-[9px] font-black uppercase tracking-widest">{mlConnected ? "ML Conectado" : "ML Desconectado"}</span>
          </div>
          <button onClick={()=>setPage("alerts")} className="relative w-8 h-8 flex items-center justify-center text-white/25 hover:text-white bg-white/4 rounded-lg border border-white/6 transition-colors">
            <I n="bell" s={14}/>
            {alertCount>0 && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"/>}
          </button>
        </header>
        <main className="flex-1 overflow-auto p-5 md:p-7">
          <div className="max-w-5xl mx-auto"><Page/></div>
        </main>
      </div>

      {editing && <EditModal product={editing} onClose={()=>setEditing(null)} onSave={handleSave}/>}
      {newOpen && (
        <NuevoModal
          onClose={()=>setNewOpen(false)}
          onSave={async(form)=>{
            const nuevoProducto = {
              title:form.title, sku:form.sku, category:form.category,
              price:Number(form.price), stockInternal:Number(form.stock),
              stockML:0, status:"active",
              locations:form.location?[{name:form.location,units:Number(form.stock)}]:[],
              image:"📦", lowThreshold:5, criticalThreshold:1,
              sales:0, monthlySales:0, createdAt:new Date().toISOString()
            };
            const docRef = await addProducto(nuevoProducto);
            setProducts(prev => [...prev, { ...nuevoProducto, id: docRef?.id || `local-${Date.now()}` }]);
            setNewOpen(false);
          }}
        />
      )}
    </div>
  );
}
