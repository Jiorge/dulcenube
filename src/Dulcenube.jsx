import { useEffect, useMemo, useRef, useState } from "react";
import { ShoppingBag, Plus, Minus, X } from "lucide-react";

/* ───────────────────────────────────────────────────────────
   Dulcenube · Landing + catálogo (mobile-first)
   Requiere: react, tailwindcss, lucide-react
   Los componentes Btn / Chip / Badge siguen el patrón shadcn/ui:
   puedes reemplazarlos por los de tu carpeta /components/ui.
   ─────────────────────────────────────────────────────────── */

/* 1 · CAPA DE DATOS (aquí se conecta Odoo) ───────────────── */

const USE_MOCK = true; // ← cámbialo a false cuando tu proxy de Odoo esté listo
const API_URL = "/api/odoo/products";

/* Odoo NO debe llamarse directo desde el navegador (credenciales y CORS).
   Crea un endpoint propio (Node, Next.js route, etc.) que haga un
   search_read sobre product.template y devuelva JSON con estos campos:
   id, name, list_price, uom_id, x_color, x_sabor, image_256, is_featured */
const fromOdoo = (r) => ({
  id: r.id,
  name: r.name,
  price: r.list_price,
  soldBy: String(r.uom_id?.[1] ?? "").toLowerCase().includes("kg") ? "kilo" : "pieza",
  color: r.x_color || "rosa", // rosa | morado | azul | verde | amarillo | rojo
  flavor: r.x_sabor || "dulce", // dulce | acido | picante
  image: r.image_256 ? `data:image/png;base64,${r.image_256}` : null,
  emoji: "🍬",
  featured: !!r.is_featured,
});

const MOCK = [
  { id: 1, name: "Gomitas de osito", price: 180, soldBy: "kilo", color: "rosa", flavor: "dulce", emoji: "🧸", featured: true },
  { id: 2, name: "Paleta de uva", price: 18, soldBy: "pieza", color: "morado", flavor: "dulce", emoji: "🍭" },
  { id: 3, name: "Gusanos ácidos", price: 210, soldBy: "kilo", color: "verde", flavor: "acido", emoji: "🐛" },
  { id: 4, name: "Mango enchilado", price: 24, soldBy: "pieza", color: "amarillo", flavor: "picante", emoji: "🥭" },
  { id: 5, name: "Nubes de vainilla", price: 160, soldBy: "kilo", color: "azul", flavor: "dulce", emoji: "☁️", featured: true },
  { id: 6, name: "Caramelo de cereza", price: 6, soldBy: "pieza", color: "rojo", flavor: "acido", emoji: "🍒" },
  { id: 7, name: "Tamarindo con chile", price: 190, soldBy: "kilo", color: "rojo", flavor: "picante", emoji: "🌶️" },
  { id: 8, name: "Chocolate con lavanda", price: 45, soldBy: "pieza", color: "morado", flavor: "dulce", emoji: "🍫" },
  { id: 9, name: "Algodón de azúcar azul", price: 35, soldBy: "pieza", color: "azul", flavor: "dulce", emoji: "🍥" },
  { id: 10, name: "Aros ácidos de limón", price: 200, soldBy: "kilo", color: "verde", flavor: "acido", emoji: "🍋" },
];

async function fetchProducts(signal) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600)); // simula latencia
    return MOCK;
  }
  const res = await fetch(API_URL, { signal });
  if (!res.ok) throw new Error("No pudimos cargar el catálogo");
  return (await res.json()).map(fromOdoo);
}

function useProducts() {
  const [state, setState] = useState({ items: [], loading: true, error: null });
  useEffect(() => {
    const ctrl = new AbortController();
    fetchProducts(ctrl.signal)
      .then((items) => setState({ items, loading: false, error: null }))
      .catch((e) => e.name !== "AbortError" && setState({ items: [], loading: false, error: e.message }));
    return () => ctrl.abort();
  }, []);
  return state;
}

/* 2 · TOKENS ─────────────────────────────────────────────── */

const COLORS = {
  rosa: { label: "Rosa", hex: "#FF6FB5", tint: "#FFE1F0" },
  morado: { label: "Morado", hex: "#7B4FD6", tint: "#E9DEFF" },
  azul: { label: "Azul", hex: "#7CC4FF", tint: "#DDF0FF" },
  verde: { label: "Verde", hex: "#7ED9A0", tint: "#DEF7E8" },
  amarillo: { label: "Amarillo", hex: "#FFD25E", tint: "#FFF3CC" },
  rojo: { label: "Rojo", hex: "#FF6B6B", tint: "#FFE0E0" },
};
const FLAVORS = [
  { id: "dulce", label: "Dulce" },
  { id: "acido", label: "Ácido" },
  { id: "picante", label: "Picante" },
];
const money = (n) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Comfortaa:wght@600;700&display=swap');
.dn{--bg:#FFF9F4;--ink:#2E1F55;--soft:#6F6490;--pink:#FF6FB5;--grape:#7B4FD6;--sky:#A9D6FF;
  font-family:'Quicksand',system-ui,sans-serif;background:var(--bg);color:var(--ink)}
.dn .display{font-family:'Comfortaa','Quicksand',sans-serif;letter-spacing:-.02em}
.dn ::-webkit-scrollbar{display:none}
@keyframes dn-float{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-14px) rotate(3deg)}}
@keyframes dn-pop{0%{transform:scale(.6)}60%{transform:scale(1.15)}100%{transform:scale(1)}}
@keyframes dn-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes dn-shimmer{to{background-position:-200% 0}}
.dn .float{animation:dn-float 6s ease-in-out infinite}
.dn .pop{animation:dn-pop .35s ease-out}
.dn .rise{animation:dn-rise .7s cubic-bezier(.2,.8,.2,1) both}
.dn .skeleton{background:linear-gradient(90deg,#f3e9f7 25%,#fff 50%,#f3e9f7 75%);background-size:200% 100%;animation:dn-shimmer 1.4s linear infinite}
@media (prefers-reduced-motion:reduce){.dn *{animation:none!important;transition:none!important}}
`;

/* 3 · UI BASE (estilo shadcn) ────────────────────────────── */

const Btn = ({ className = "", variant = "primary", ...p }) => (
  <button
    {...p}
    className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-bold transition active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--grape)] ${
      variant === "primary"
        ? "bg-[var(--pink)] text-white shadow-[0_10px_24px_-8px_rgba(255,111,181,.7)] hover:brightness-105"
        : "bg-white text-[var(--grape)] shadow-[0_6px_18px_-8px_rgba(123,79,214,.4)] hover:bg-[#F4EEFF]"
    } ${className}`}
  />
);

const Chip = ({ active, children, className = "", ...p }) => (
  <button
    {...p}
    aria-pressed={active}
    className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--grape)] ${
      active ? "bg-[var(--grape)] text-white shadow-md" : "bg-white text-[var(--ink)] shadow-sm hover:bg-[#F4EEFF]"
    } ${className}`}
  >
    {children}
  </button>
);

const Badge = ({ children, tone = "#E9DEFF" }) => (
  <span className="rounded-full px-2.5 py-1 text-xs font-bold text-[var(--ink)]" style={{ background: tone }}>
    {children}
  </span>
);

/* 4 · HERO: dulce que gira con el cursor ─────────────────── */

function Candy() {
  return (
    <svg viewBox="0 0 240 160" className="w-full drop-shadow-[0_24px_24px_rgba(123,79,214,.35)]" aria-hidden="true">
      <defs>
        <radialGradient id="dn-body" cx=".35" cy=".3" r=".9">
          <stop offset="0" stopColor="#FFB3DA" />
          <stop offset=".6" stopColor="#FF6FB5" />
          <stop offset="1" stopColor="#D9449A" />
        </radialGradient>
        <clipPath id="dn-clip"><ellipse cx="120" cy="80" rx="82" ry="56" /></clipPath>
      </defs>
      <polygon points="40,80 2,40 12,80 2,120" fill="#A9D6FF" />
      <polygon points="200,80 238,40 228,80 238,120" fill="#A9D6FF" />
      <ellipse cx="120" cy="80" rx="82" ry="56" fill="url(#dn-body)" />
      <g clipPath="url(#dn-clip)" stroke="#fff" strokeOpacity=".55" strokeWidth="10">
        <path d="M60 140 L110 10" /><path d="M95 150 L145 0" /><path d="M130 150 L180 0" /><path d="M165 150 L215 10" />
      </g>
      <ellipse cx="92" cy="52" rx="26" ry="10" fill="#fff" fillOpacity=".55" transform="rotate(-20 92 52)" />
    </svg>
  );
}

function Hero({ onKilo }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [spin, setSpin] = useState(0);
  const ref = useRef(null);

  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    setTilt({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  };

  const minis = [
    { c: "#FFD25E", s: "h-10 w-10", p: "top-[8%] left-[6%]", d: "0s", k: 40 },
    { c: "#7ED9A0", s: "h-7 w-7", p: "top-[70%] left-[10%]", d: "1.2s", k: -30 },
    { c: "#7B4FD6", s: "h-12 w-12", p: "top-[12%] right-[8%]", d: ".6s", k: -50 },
    { c: "#7CC4FF", s: "h-8 w-8", p: "bottom-[8%] right-[14%]", d: "1.8s", k: 30 },
  ];

  return (
    <section className="relative mx-auto grid max-w-6xl items-center gap-4 px-5 pb-10 pt-6 md:grid-cols-2 md:gap-10 md:pt-14">
      <div className="rise order-2 md:order-1">
        <h1 className="display text-[2.6rem] font-bold leading-[1.05] md:text-6xl">
          Hoy toca algo dulce, ácido o con chile.
        </h1>
        <p className="mt-4 max-w-md text-lg text-[var(--soft)]">
          Gomitas, chocolates y enchilados por pieza o por kilo. Eliges desde tu celular y te lo preparamos.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Btn onClick={() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })}>Ver dulces</Btn>
          <Btn variant="soft" onClick={onKilo}>Armar mi kilo</Btn>
        </div>
      </div>

      {/* Escenario interactivo */}
      <div
        ref={ref}
        onPointerMove={move}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
        className="order-1 relative mx-auto aspect-square w-full max-w-md touch-pan-y select-none rounded-[3rem] bg-gradient-to-br from-[#FFE1F0] via-[#E9DEFF] to-[#DDF0FF] md:order-2"
        style={{ perspective: 900 }}
      >
        {minis.map((m, i) => (
          <span
            key={i}
            className={`float absolute rounded-full shadow-lg ${m.s} ${m.p}`}
            style={{
              background: `radial-gradient(circle at 30% 30%, #fff9, ${m.c})`,
              animationDelay: m.d,
              translate: `${tilt.x * m.k}px ${tilt.y * m.k}px`,
              transition: "translate .25s ease-out",
            }}
          />
        ))}
        <button
          onClick={() => setSpin((s) => s + 360)}
          aria-label="Girar el dulce"
          className="absolute inset-0 m-auto h-fit w-[72%] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--grape)] rounded-3xl"
          style={{
            transform: `rotateY(${tilt.x * 40 + spin}deg) rotateX(${-tilt.y * 32}deg) rotateZ(${tilt.x * 10 - 6}deg)`,
            transition: "transform .6s cubic-bezier(.2,.8,.2,1)",
            transformStyle: "preserve-3d",
          }}
        >
          <div className="float"><Candy /></div>
        </button>
      </div>
    </section>
  );
}

/* 5 · FILTROS ────────────────────────────────────────────── */

function Filters({ f, set, count }) {
  const toggle = (k, v) => set({ ...f, [k]: f[k] === v ? null : v });
  return (
    <div className="sticky top-0 z-20 -mx-5 bg-[var(--bg)]/85 px-5 pb-3 pt-3 backdrop-blur-md md:mx-0 md:rounded-[2rem] md:px-6">
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5" role="group" aria-label="Buscar por color">
          <span className="shrink-0 pr-1 text-sm font-bold text-[var(--soft)]">Color</span>
          {Object.entries(COLORS).map(([k, c]) => (
            <Chip key={k} active={f.color === k} onClick={() => toggle("color", k)}>
              <span className="h-3.5 w-3.5 rounded-full ring-2 ring-white" style={{ background: c.hex }} />
              {c.label}
            </Chip>
          ))}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5" role="group" aria-label="Buscar por sabor">
          <span className="shrink-0 pr-1 text-sm font-bold text-[var(--soft)]">Sabor</span>
          {FLAVORS.map((x) => (
            <Chip key={x.id} active={f.flavor === x.id} onClick={() => toggle("flavor", x.id)}>{x.label}</Chip>
          ))}
          <span className="mx-1 h-5 w-px shrink-0 bg-[#E4D9F7]" />
          <Chip active={f.kilo} onClick={() => set({ ...f, kilo: !f.kilo })}>Dulces por kilo</Chip>
        </div>
      </div>
      <p className="mt-2 text-sm text-[var(--soft)]" aria-live="polite">{count} {count === 1 ? "dulce" : "dulces"}</p>
    </div>
  );
}

/* 6 · TARJETAS BENTO ─────────────────────────────────────── */

function ProductCard({ p, qty, onChange }) {
  const c = COLORS[p.color] ?? COLORS.rosa;
  const step = p.soldBy === "kilo" ? 0.25 : 1;
  const unit = p.soldBy === "kilo" ? "/kg" : " c/u";
  const label = p.soldBy === "kilo" ? `${qty} kg` : `${qty}`;
  const [bump, setBump] = useState(0);
  const change = (d) => { onChange(p.id, d * step); setBump((b) => b + 1); };

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-[2rem] bg-white p-3 shadow-[0_14px_34px_-16px_rgba(123,79,214,.45)] transition hover:-translate-y-1 hover:shadow-[0_22px_40px_-16px_rgba(123,79,214,.55)] ${
        p.featured ? "col-span-2 sm:flex-row sm:items-stretch" : ""
      }`}
    >
      <div
        className={`relative grid place-items-center rounded-[1.5rem] ${p.featured ? "aspect-[2/1] sm:aspect-auto sm:w-1/2" : "aspect-square"}`}
        style={{ background: `linear-gradient(135deg, ${c.tint}, #fff)` }}
      >
        {p.image ? (
          <img src={p.image} alt={p.name} loading="lazy" className="h-4/5 w-4/5 object-contain transition group-hover:scale-110 group-hover:rotate-6" />
        ) : (
          <span className="text-6xl transition duration-300 group-hover:scale-125 group-hover:-rotate-12 md:text-7xl" aria-hidden="true">{p.emoji}</span>
        )}
        <span className="absolute left-3 top-3"><Badge tone={c.tint}>{FLAVORS.find((x) => x.id === p.flavor)?.label}</Badge></span>
      </div>

      <div className={`flex flex-1 flex-col justify-between gap-3 px-2 pb-1 pt-3 ${p.featured ? "sm:p-5" : ""}`}>
        <div>
          <h3 className="display text-base font-bold leading-snug md:text-lg">{p.name}</h3>
          <p className="mt-0.5 text-sm text-[var(--soft)]">{p.soldBy === "kilo" ? "Se vende por kilo" : "Se vende por pieza"}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-bold">{money(p.price)}<span className="text-sm font-medium text-[var(--soft)]">{unit}</span></span>
          {qty > 0 ? (
            <div key={bump} className="pop flex items-center gap-1 rounded-full bg-[#F4EEFF] p-1">
              <button aria-label="Quitar" onClick={() => change(-1)} className="grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--grape)]"><Minus size={16} /></button>
              <span className="min-w-[3.2rem] text-center text-sm font-bold">{label}</span>
              <button aria-label="Agregar más" onClick={() => change(1)} className="grid h-8 w-8 place-items-center rounded-full bg-[var(--pink)] text-white"><Plus size={16} /></button>
            </div>
          ) : (
            <button
              aria-label={`Agregar ${p.name}`}
              onClick={() => change(1)}
              className="grid h-11 w-11 place-items-center rounded-full bg-[var(--pink)] text-white shadow-[0_8px_18px_-6px_rgba(255,111,181,.8)] transition active:scale-90"
            ><Plus size={20} /></button>
          )}
        </div>
      </div>
    </article>
  );
}

const Skeletons = () => (
  <>{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton aspect-[4/5] rounded-[2rem]" />)}</>
);

/* 7 · PÁGINA ─────────────────────────────────────────────── */

export default function Dulcenube() {
  const { items, loading, error } = useProducts();
  const [filters, setFilters] = useState({ color: null, flavor: null, kilo: false });
  const [cart, setCart] = useState({}); // { [id]: cantidad }

  const visible = useMemo(
    () => items.filter((p) =>
      (!filters.color || p.color === filters.color) &&
      (!filters.flavor || p.flavor === filters.flavor) &&
      (!filters.kilo || p.soldBy === "kilo")),
    [items, filters]
  );

  const change = (id, d) =>
    setCart((c) => {
      const next = Math.max(0, +((c[id] ?? 0) + d).toFixed(2));
      const { [id]: _, ...rest } = c;
      return next ? { ...rest, [id]: next } : rest;
    });

  const { total, lines } = useMemo(() => {
    let t = 0;
    for (const [id, q] of Object.entries(cart)) t += (items.find((p) => p.id === +id)?.price ?? 0) * q;
    return { total: t, lines: Object.keys(cart).length };
  }, [cart, items]);

  const goKilo = () => {
    setFilters({ color: null, flavor: null, kilo: true });
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="dn min-h-screen pb-28">
      <style>{CSS}</style>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a href="#" className="display flex items-center gap-2 text-xl font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--pink)] text-white">d</span>
          Dulcenube
        </a>
        <span className="relative grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm" aria-label={`Carrito: ${lines} productos`}>
          <ShoppingBag size={20} />
          {lines > 0 && <span key={lines} className="pop absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--grape)] px-1 text-xs font-bold text-white">{lines}</span>}
        </span>
      </header>

      <Hero onKilo={goKilo} />

      <main id="catalogo" className="mx-auto max-w-6xl scroll-mt-2 px-5">
        <Filters f={filters} set={setFilters} count={visible.length} />

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {loading && <Skeletons />}
          {error && (
            <p className="col-span-full rounded-3xl bg-white p-6 text-center">{error}. Recarga la página para intentar de nuevo.</p>
          )}
          {!loading && !error && visible.map((p) => <ProductCard key={p.id} p={p} qty={cart[p.id] ?? 0} onChange={change} />)}
          {!loading && !error && visible.length === 0 && (
            <div className="col-span-full grid place-items-center gap-3 rounded-[2rem] bg-white p-10 text-center">
              <p className="display text-lg font-bold">No hay dulces con esa mezcla.</p>
              <p className="text-[var(--soft)]">Quita un filtro para ver más opciones.</p>
              <Btn variant="soft" onClick={() => setFilters({ color: null, flavor: null, kilo: false })}><X size={16} /> Limpiar filtros</Btn>
            </div>
          )}
        </div>
      </main>

      {/* Barra de pedido (aparece al agregar algo) */}
      {lines > 0 && (
        <div className="pop fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-md items-center justify-between rounded-full bg-[var(--grape)] py-2 pl-6 pr-2 text-white shadow-[0_18px_40px_-10px_rgba(123,79,214,.8)]">
            <span className="font-bold">{lines} {lines === 1 ? "producto" : "productos"} · {money(total)}</span>
            <Btn className="py-2.5">Hacer pedido</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
