"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAcesso } from "@/lib/acesso";
import { withBase } from "@/lib/base";
import { CORES, calcular, corHex, normalizar, tipoPorId, valoresPadrao, type Valores } from "@/lib/configurador";
import { DEFAULT_CAMERA, LOOKS, renderAssembled } from "@/lib/render3d";
import { workshop } from "@/lib/workshop";
import { UnlockBox } from "./UnlockBox";

type Estado = { v: Valores; cx: string; fr: string };

const encode = (e: Estado) => btoa(unescape(encodeURIComponent(JSON.stringify(e))));
const decode = (s: string): Estado | null => {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(s))));
  } catch {
    return null;
  }
};

const GRAIN: Record<string, string> = { comprimento: "no compr.", largura: "na larg.", livre: "livre" };

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-bark-900/10 bg-wood-50 px-4 py-3">
      <span className="font-semibold">{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" aria-label={`Diminuir ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-bark-900/10 bg-[#4a3020] text-lg font-bold disabled:opacity-35">
          –
        </button>
        <span className="num w-6 text-center font-mono text-lg font-bold text-wood-600">{value}</span>
        <button type="button" aria-label={`Aumentar ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-bark-900/10 bg-[#4a3020] text-lg font-bold disabled:opacity-35">
          +
        </button>
      </div>
    </div>
  );
}

function Swatches({ label, value, onChange }: { label: string; value: string; onChange: (look: string) => void }) {
  const nome = CORES.find((c) => c.look === value)?.nome ?? value;
  return (
    <div>
      <p className="mb-2 text-sm text-bark-700">
        {label}: <strong className="text-bark-900">{nome}</strong>
      </p>
      <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label={label}>
        {CORES.map((c) => (
          <button
            key={c.look}
            type="button"
            role="radio"
            aria-checked={c.look === value}
            aria-label={c.nome}
            title={c.nome}
            onClick={() => onChange(c.look)}
            className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${c.look === value ? "border-sky-300 ring-2 ring-sky-300/50" : "border-bark-900/15"}`}
            style={{ background: corHex(c.look) }}
          />
        ))}
      </div>
    </div>
  );
}

export function Configurator({ tipoId }: { tipoId: string }) {
  const tipo = tipoPorId(tipoId)!;
  const padrao: Estado = { v: valoresPadrao(tipo), cx: tipo.coresPadrao[0], fr: tipo.coresPadrao[1] };
  const [st, setSt] = useState<Estado>(padrao);
  const [cam, setCam] = useState(DEFAULT_CAMERA);
  const [cliente, setCliente] = useState("");
  const [salvo, setSalvo] = useState(false);
  const acesso = useAcesso();
  const bloqueado = !tipo.livre && !acesso.liberado;

  // reabrir um projeto salvo: #c=<estado>
  useEffect(() => {
    const m = location.hash.match(/c=([^&]+)/);
    const e = m && decode(m[1]);
    if (e) setSt({ v: normalizar(tipo, e.v), cx: e.cx, fr: e.fr });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const res = useMemo(() => calcular(tipo, st.v, st.cx, st.fr), [tipo, st]);
  const lookOf = useMemo(() => {
    const map = new Map(res.materials.map((m) => [m.key, m.look]));
    return (k: string) => LOOKS[map.get(k) ?? k] ?? LOOKS.pinus;
  }, [res]);
  const svg = useMemo(() => renderAssembled(res.parts, lookOf, 800, 600, { th: cam.th, ph: cam.ph, dims: true, id: "cfg", frame: false, claro: true }), [res, lookOf, cam]);

  // arrastar para girar
  const drag = useRef<{ x: number; y: number; th: number; ph: number } | null>(null);
  const raf = useRef(0);
  const onDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, th: cam.th, ph: cam.ph };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    cancelAnimationFrame(raf.current);
    const th = d.th - (e.clientX - d.x) * 0.45;
    const ph = Math.max(4, Math.min(70, d.ph + (e.clientY - d.y) * 0.3));
    raf.current = requestAnimationFrame(() => setCam({ th, ph }));
  };
  const onUp = () => (drag.current = null);

  const set = (k: string, val: number | string | boolean) => {
    setSalvo(false);
    setSt((s) => ({ ...s, v: normalizar(tipo, { ...s.v, [k]: val }) }));
  };

  const planUrl = (g: (typeof res.grupos)[number]) =>
    `${withBase("/plano-de-corte/")}#d=${encodeURIComponent(JSON.stringify({ t: `${tipo.nome} ${res.dims[0]} × ${res.dims[1]} × ${res.dims[2]} mm`, g: [{ m: g.nome, p: g.linhas.map((c) => [c[0], c[1], c[2], c[3], c[5] === "livre" ? 1 : 0]) }] }))}`;

  const salvar = () => {
    if (!cliente.trim()) return;
    workshop.salvar({ tipo: tipo.id, tipoNome: tipo.nome, cliente: cliente.trim(), valores: st.v, caixa: st.cx, frente: st.fr, dims: res.dims });
    setSalvo(true);
    history.replaceState(null, "", `#c=${encode(st)}`);
  };

  const ok = res.avisos.length === 0;

  return (
    <div className="space-y-4">
      {/* VISUALIZAÇÃO 3D */}
      <div className="app-card relative overflow-hidden p-0">
        <div
          className="aspect-[4/3] w-full cursor-grab touch-none select-none active:cursor-grabbing [&>svg]:h-full [&>svg]:w-full"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onDoubleClick={() => setCam(DEFAULT_CAMERA)}
          role="img"
          aria-label={`Modelo 3D: ${tipo.nome} ${res.dims.join(" × ")} mm. Arraste para girar.`}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <span className="pointer-events-none absolute top-3 left-3 rounded-md border border-bark-900/10 bg-white/90 px-2 py-1 font-mono text-[11px] font-bold tracking-widest text-bark-700">3D · ARRASTE PARA GIRAR</span>
        <span className="num pointer-events-none absolute right-3 bottom-3 rounded-md border border-bark-900/15 bg-white/90 px-2 py-1 font-mono text-xs font-bold text-bark-900">
          {res.dims[0]} × {res.dims[1]} × {res.dims[2]} mm
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={ok ? "ok" : "warn"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className={`rounded-2xl border p-4 ${ok ? "border-leaf-500/50 bg-leaf-50" : "border-amber-400/50 bg-amber-50"}`}
          role="status"
        >
          {ok ? (
            <>
              <p className="font-semibold text-leaf-700">Medidas conferidas</p>
              <p className="text-sm text-bark-700">Todas as peças cabem no lugar e na chapa.</p>
            </>
          ) : (
            <>
              <p className="font-semibold text-amber-700">Confira antes de cortar</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-bark-700">
                {res.avisos.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {bloqueado ? (
        <UnlockBox titulo={`${tipo.nome} sob medida`} texto="O configurador deste móvel faz parte do app completo. Digite a senha de desbloqueio para mudar medidas, cores, portas e gerar a lista de corte." />
      ) : (
        <>
          {/* MEDIDAS */}
          <section className="app-card p-4 sm:p-5">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="app-title text-2xl">Medidas do cliente</h2>
              <span className="app-kicker text-bark-500">em mm</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {tipo.params
                .filter((p) => p.kind === "mm" || p.kind === "select")
                .map((p) =>
                  p.kind === "mm" ? (
                    <label key={p.key} className="block">
                      <span className="app-kicker mb-1 block text-bark-700">{p.label}</span>
                      <span className="relative block">
                        <input
                          type="number"
                          inputMode="numeric"
                          value={Number(st.v[p.key])}
                          min={p.min}
                          max={p.max}
                          step={p.step ?? 1}
                          onChange={(e) => setSt((s) => ({ ...s, v: { ...s.v, [p.key]: Number(e.target.value) } }))}
                          onBlur={(e) => set(p.key, Number(e.target.value))}
                          className="w-full rounded-xl border border-bark-900/10 bg-white px-3 py-3 pr-10 font-mono text-lg text-bark-900 focus:border-wood-400 focus:outline-none"
                        />
                        <span className="absolute top-1/2 right-3 -translate-y-1/2 font-mono text-xs text-wood-600">mm</span>
                      </span>
                      <span className="num mt-1 block font-mono text-[11px] text-wood-600">
                        {p.min} a {p.max}
                      </span>
                    </label>
                  ) : (
                    <label key={p.key} className="block">
                      <span className="app-kicker mb-1 block text-bark-700">{p.label}</span>
                      <select value={String(st.v[p.key])} onChange={(e) => set(p.key, e.target.value)} className="w-full rounded-xl border border-bark-900/10 bg-white px-3 py-3 font-mono text-bark-900 focus:border-wood-400 focus:outline-none">
                        {p.options.map((o) => (
                          <option key={o.value} value={o.value} className="bg-white">
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ),
                )}
            </div>
            <div className="mt-4 space-y-2.5">
              {tipo.params.map((p) =>
                p.kind === "count" ? (
                  <Stepper key={p.key} label={p.label} value={Number(st.v[p.key])} min={p.min} max={p.max} onChange={(n) => set(p.key, n)} />
                ) : p.kind === "toggle" ? (
                  <label key={p.key} className="flex cursor-pointer items-center justify-between rounded-xl border border-bark-900/10 bg-wood-50 px-4 py-3">
                    <span className="font-semibold">{p.label}</span>
                    <input type="checkbox" checked={Boolean(st.v[p.key])} onChange={(e) => set(p.key, e.target.checked)} className="h-6 w-6 accent-leaf-600" />
                  </label>
                ) : null,
              )}
            </div>
            {tipo.usaCores && (
              <div className="mt-5 space-y-4">
                <Swatches label="Caixa" value={st.cx} onChange={(cx) => setSt((s) => ({ ...s, cx }))} />
                <Swatches label="Portas e gavetas" value={st.fr} onChange={(fr) => setSt((s) => ({ ...s, fr }))} />
              </div>
            )}
            <button type="button" onClick={() => setSt(padrao)} className="app-btn-ghost mt-5">
              Voltar às medidas padrão
            </button>
          </section>

          {/* LISTA DE CORTE */}
          <section className="app-card p-4 sm:p-5">
            <h2 className="app-title mb-4 text-2xl">Lista de corte</h2>
            <div className="space-y-6">
              {res.grupos.map((g) => (
                <div key={g.key}>
                  <p className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-wood-600 uppercase">
                    <span className="h-3 w-3 rounded-full border border-bark-900/15" style={{ background: g.cor }} />
                    {g.nome} · {g.pecas} peça{g.pecas > 1 ? "s" : ""}
                  </p>
                  <a href={planUrl(g)} className="app-btn mt-3 px-5 py-2.5 text-sm">
                    Abrir no plano de corte
                  </a>
                  <table className="mt-3 w-full text-sm">
                    <thead>
                      <tr className="border-b border-dashed border-bark-900/10 text-left font-mono text-[11px] tracking-wider text-bark-500 uppercase">
                        <th className="py-2 font-semibold">Peça</th>
                        <th className="py-2 font-semibold">Qtd</th>
                        <th className="py-2 font-semibold">Medida</th>
                        <th className="py-2 font-semibold">Veio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.linhas.map((c, i) => (
                        <tr key={i} className="border-b border-dashed border-bark-900/10">
                          <td className="py-2 pr-2 font-semibold">{c[0]}</td>
                          <td className="num py-2 font-mono">{c[1]}</td>
                          <td className="num py-2 font-mono whitespace-nowrap">
                            {c[2]} × {c[3]}
                          </td>
                          <td className="py-2 text-bark-700">{GRAIN[c[5]]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </section>

          {/* FERRAGENS */}
          <section className="app-card p-4 sm:p-5">
            <h2 className="app-title mb-3 text-2xl">Ferragens</h2>
            <ul>
              {res.hardware.map((h) => (
                <li key={h.item} className="flex justify-between gap-4 border-b border-dashed border-bark-900/10 py-2.5 text-sm">
                  <span className="text-bark-700">{h.item}</span>
                  {h.qtd === "ver Módulo 4" ? (
                    <Link href="/aulas/" className="font-mono font-bold whitespace-nowrap text-wood-600 underline">
                      ver Módulo 4
                    </Link>
                  ) : (
                    <span className="num font-mono font-bold whitespace-nowrap">{h.qtd}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* SALVAR */}
          <section className="app-card p-4 sm:p-5">
            <h2 className="app-title mb-3 text-2xl">Salvar para o cliente</h2>
            <label className="app-kicker mb-1 block text-bark-700" htmlFor="cliente">
              Cliente ou obra
            </label>
            <input
              id="cliente"
              value={cliente}
              onChange={(e) => {
                setCliente(e.target.value);
                setSalvo(false);
              }}
              placeholder="Ex.: Ana, cozinha"
              className="w-full rounded-xl border border-bark-900/10 bg-white px-4 py-3 text-bark-900 placeholder:text-bark-500 focus:border-wood-400 focus:outline-none"
            />
            <button type="button" disabled={!cliente.trim()} onClick={salvar} className="app-btn mt-3">
              {salvo ? "Salvo ✓" : "Salvar projeto"}
            </button>
            <p className="mt-2 text-sm text-bark-500">
              Fica em{" "}
              <Link href="/membro/" className="underline">
                Minha oficina › Projetos salvos
              </Link>
              , com as medidas, as quantidades e as cores escolhidas.
            </p>
          </section>
        </>
      )}

      <p className="px-1 font-mono text-[11px] leading-5 text-bark-500">
        Regras simplificadas para orçamento e estudo: folga de 3 mm entre portas e gavetas, fundo de 6 mm pregado atrás, rodapé recuado, corrediças de 12,5 mm por lado e prateleiras limitadas a ~80 cm (MDF 15) ou ~90 cm (MDF 18) de vão. Confira as medidas no local antes de cortar.
      </p>
    </div>
  );
}
