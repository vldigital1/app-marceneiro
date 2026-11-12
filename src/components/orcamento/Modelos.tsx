"use client";

// Os 6 modelos visuais do orçamento. Largura fixa de folha A4 (794 px) para exportar PDF e imagem iguais à tela.
import { forwardRef } from "react";
import { brl, dataBR, somaDias, totais, type Empresa, type Orcamento, type TemplateId } from "@/lib/orcamentos";

export const A4_LARGURA = 794;
export const A4_ALTURA = 1123;

const SANS = "'Segoe UI', Inter, Roboto, 'Helvetica Neue', Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

type Tema = {
  fundo: string;
  texto: string;
  suave: string;
  linha: string;
  destaque: string;
  cabecalho: string; // CSS background
  cabecalhoTexto: string;
  titulo: string; // fonte dos títulos
  tabelaCab: string;
  tabelaCabTexto: string;
  zebra: string;
  totalFundo: string;
  totalTexto: string;
  raio: number;
};

function escurecer(hex: string, f: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = Math.round(((n >> 16) & 255) * f);
  const g = Math.round(((n >> 8) & 255) * f);
  const b = Math.round((n & 255) * f);
  return `rgb(${r}, ${g}, ${b})`;
}
function clarear(hex: string, a: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function tema(id: TemplateId, cor: string): Tema {
  switch (id) {
    case "premium":
      return { fundo: "#101114", texto: "#f3efe6", suave: "#a8a296", linha: "#2a2b31", destaque: "#d6b46a", cabecalho: "linear-gradient(135deg,#17181d,#0b0b0e)", cabecalhoTexto: "#f3efe6", titulo: SERIF, tabelaCab: "#1b1c22", tabelaCabTexto: "#d6b46a", zebra: "#15161b", totalFundo: "linear-gradient(135deg,#d6b46a,#a8853d)", totalTexto: "#101114", raio: 6 };
    case "executivo":
      return { fundo: "#ffffff", texto: "#1d2330", suave: "#6b7280", linha: "#e5e7eb", destaque: cor, cabecalho: "#ffffff", cabecalhoTexto: "#1d2330", titulo: SANS, tabelaCab: escurecer(cor, 0.85), tabelaCabTexto: "#ffffff", zebra: "#f6f7f9", totalFundo: escurecer(cor, 0.85), totalTexto: "#ffffff", raio: 2 };
    case "minimal":
      return { fundo: "#ffffff", texto: "#111111", suave: "#6b6b6b", linha: "#e6e6e6", destaque: "#111111", cabecalho: "#ffffff", cabecalhoTexto: "#111111", titulo: SANS, tabelaCab: "#ffffff", tabelaCabTexto: "#6b6b6b", zebra: "#ffffff", totalFundo: "#ffffff", totalTexto: "#111111", raio: 0 };
    case "madeira":
      return { fundo: "#fbf5ea", texto: "#2b1d12", suave: "#7a6250", linha: "#e7d8c1", destaque: "#9a6528", cabecalho: "repeating-linear-gradient(92deg, rgba(0,0,0,.06) 0 3px, transparent 3px 14px), linear-gradient(135deg,#6b4528,#3d2616)", cabecalhoTexto: "#fbf1de", titulo: SERIF, tabelaCab: "#efe1c9", tabelaCabTexto: "#4a3526", zebra: "#f7eedf", totalFundo: "linear-gradient(135deg,#8a5a33,#5a3a22)", totalTexto: "#fff7e8", raio: 8 };
    case "vibrante":
      return { fundo: "#ffffff", texto: "#172033", suave: "#64748b", linha: "#e2e8f0", destaque: cor, cabecalho: "#ffffff", cabecalhoTexto: "#172033", titulo: SANS, tabelaCab: clarear(cor, 0.12), tabelaCabTexto: escurecer(cor, 0.7), zebra: "#f8fafc", totalFundo: `linear-gradient(135deg, ${cor}, ${escurecer(cor, 0.65)})`, totalTexto: "#ffffff", raio: 18 };
    case "moderno":
    default:
      return { fundo: "#ffffff", texto: "#1f2430", suave: "#6b7280", linha: "#ebe7e1", destaque: cor, cabecalho: `linear-gradient(120deg, ${escurecer(cor, 0.55)}, ${cor})`, cabecalhoTexto: "#ffffff", titulo: SANS, tabelaCab: clarear(cor, 0.1), tabelaCabTexto: escurecer(cor, 0.6), zebra: "#fafaf9", totalFundo: `linear-gradient(120deg, ${escurecer(cor, 0.55)}, ${cor})`, totalTexto: "#ffffff", raio: 14 };
  }
}

const num = (n: number) => String(n).padStart(4, "0");

function Logo({ e, t, tamanho = 64 }: { e: Empresa; t: Tema; tamanho?: number }) {
  if (e.logo)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={e.logo} alt="" style={{ width: tamanho, height: tamanho, objectFit: "contain", borderRadius: Math.min(t.raio, 14) }} />;
  const ini = (e.nome || "Marcenaria")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return (
    <div style={{ width: tamanho, height: tamanho, borderRadius: Math.min(t.raio, 14), background: t.destaque, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: tamanho * 0.36, fontFamily: SANS }}>
      {ini}
    </div>
  );
}

function Contato({ e, cor }: { e: Empresa; cor: string }) {
  const linhas = [e.telefone && `WhatsApp ${e.telefone}`, e.email, e.instagram && `@${e.instagram.replace(/^@/, "")}`, e.cidade, e.documento].filter(Boolean);
  return (
    <div style={{ fontSize: 11.5, lineHeight: 1.55, color: cor }}>
      {linhas.map((l) => (
        <div key={l as string}>{l}</div>
      ))}
    </div>
  );
}

export const FolhaOrcamento = forwardRef<HTMLDivElement, { o: Orcamento; e: Empresa }>(function FolhaOrcamento({ o, e }, ref) {
  const t = tema(o.template, e.cor || "#b97f35");
  const tt = totais(o);
  const lateral = o.template === "executivo";
  const minimal = o.template === "minimal";
  const vibrante = o.template === "vibrante";
  const cabecalhoCheio = ["moderno", "premium", "madeira"].includes(o.template);
  const validade = dataBR(somaDias(o.criadoEm, o.validadeDias || 15));

  return (
    <div
      ref={ref}
      style={{ width: A4_LARGURA, minHeight: A4_ALTURA, background: t.fundo, color: t.texto, fontFamily: SANS, position: "relative", display: "flex", boxSizing: "border-box" }}
    >
      {lateral && <div style={{ width: 14, background: `linear-gradient(${t.destaque}, ${escurecer(t.destaque, 0.6)})`, flexShrink: 0 }} />}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* CABEÇALHO */}
        <div style={{ background: t.cabecalho, color: t.cabecalhoTexto, padding: cabecalhoCheio ? "34px 44px 30px" : "40px 44px 18px", position: "relative", overflow: "hidden" }}>
          {o.template === "moderno" && (
            <div style={{ position: "absolute", right: -80, top: -120, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.10)" }} />
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, position: "relative" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <Logo e={e} t={t} tamanho={vibrante ? 70 : 64} />
              <div>
                <div style={{ fontFamily: t.titulo, fontWeight: 800, fontSize: 22, lineHeight: 1.15 }}>{e.nome || "Sua Marcenaria"}</div>
                {e.responsavel && <div style={{ fontSize: 12.5, opacity: 0.85, marginTop: 3 }}>{e.responsavel}</div>}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, letterSpacing: 3, fontWeight: 700, color: cabecalhoCheio ? t.cabecalhoTexto : t.destaque, opacity: cabecalhoCheio ? 0.85 : 1 }}>ORÇAMENTO</div>
              <div style={{ fontFamily: t.titulo, fontSize: vibrante ? 40 : 30, fontWeight: 800, lineHeight: 1.1, color: o.template === "premium" ? t.destaque : undefined }}>Nº {num(o.numero)}</div>
              <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 4 }}>
                Emitido em {dataBR(o.criadoEm)} · válido até {validade}
              </div>
            </div>
          </div>
          {cabecalhoCheio && (
            <div style={{ marginTop: 18, position: "relative" }}>
              <Contato e={e} cor={o.template === "premium" ? t.suave : "rgba(255,255,255,0.85)"} />
            </div>
          )}
        </div>
        {!cabecalhoCheio && (
          <div style={{ padding: "0 44px", display: "flex", justifyContent: "space-between", borderBottom: minimal ? `1px solid ${t.linha}` : "none", paddingBottom: 14 }}>
            <Contato e={e} cor={t.suave} />
          </div>
        )}

        <div style={{ padding: "26px 44px 30px", display: "flex", flexDirection: "column", gap: 22, flex: 1 }}>
          {/* CLIENTE */}
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ flex: 1.4, border: `1px solid ${t.linha}`, borderRadius: t.raio, padding: "14px 18px", background: vibrante ? clarear(t.destaque, 0.06) : "transparent" }}>
              <div style={{ fontSize: 10.5, letterSpacing: 2, fontWeight: 700, color: t.destaque }}>CLIENTE</div>
              <div style={{ fontFamily: t.titulo, fontSize: 18, fontWeight: 700, marginTop: 4 }}>{o.cliente.nome || "—"}</div>
              <div style={{ fontSize: 12, color: t.suave, marginTop: 3, lineHeight: 1.5 }}>
                {[o.cliente.telefone, o.cliente.email].filter(Boolean).join(" · ")}
                {o.cliente.endereco && <div>{o.cliente.endereco}</div>}
              </div>
            </div>
            <div style={{ flex: 1, border: `1px solid ${t.linha}`, borderRadius: t.raio, padding: "14px 18px" }}>
              <div style={{ fontSize: 10.5, letterSpacing: 2, fontWeight: 700, color: t.destaque }}>PROJETO</div>
              <div style={{ fontFamily: t.titulo, fontSize: 16, fontWeight: 700, marginTop: 4 }}>{o.titulo || "Móveis sob medida"}</div>
              <div style={{ fontSize: 12, color: t.suave, marginTop: 3 }}>
                Prazo: {o.prazoDias ? `${o.prazoDias} dias` : "a combinar"}
              </div>
            </div>
          </div>

          {/* ITENS */}
          <div style={{ border: minimal ? "none" : `1px solid ${t.linha}`, borderRadius: t.raio, overflow: "hidden" }}>
            <div style={{ display: "flex", background: t.tabelaCab, color: t.tabelaCabTexto, fontSize: 10.5, fontWeight: 800, letterSpacing: 1.5, padding: "11px 16px", borderBottom: minimal ? `2px solid ${t.texto}` : "none" }}>
              <div style={{ flex: 1 }}>DESCRIÇÃO</div>
              <div style={{ width: 60, textAlign: "center" }}>QTD</div>
              <div style={{ width: 110, textAlign: "right" }}>VALOR UNIT.</div>
              <div style={{ width: 120, textAlign: "right" }}>TOTAL</div>
            </div>
            {o.itens.length === 0 && <div style={{ padding: "18px 16px", fontSize: 12.5, color: t.suave }}>Nenhum item adicionado.</div>}
            {o.itens.map((i, k) => (
              <div key={i.id} style={{ display: "flex", alignItems: "flex-start", padding: "12px 16px", background: k % 2 ? t.zebra : "transparent", borderTop: k ? `1px solid ${t.linha}` : "none", fontSize: 13 }}>
                <div style={{ flex: 1, paddingRight: 10 }}>
                  <div style={{ fontWeight: 650 }}>{i.descricao || "Item"}</div>
                  {i.detalhes && <div style={{ fontSize: 11.5, color: t.suave, marginTop: 2, lineHeight: 1.45 }}>{i.detalhes}</div>}
                </div>
                <div style={{ width: 60, textAlign: "center", color: t.suave }}>
                  {i.quantidade} {i.unidade && i.unidade !== "un" ? i.unidade : ""}
                </div>
                <div style={{ width: 110, textAlign: "right", color: t.suave }}>{brl(Number(i.valorUnitario) || 0)}</div>
                <div style={{ width: 120, textAlign: "right", fontWeight: 700 }}>{brl((Number(i.quantidade) || 0) * (Number(i.valorUnitario) || 0))}</div>
              </div>
            ))}
          </div>

          {/* TOTAIS + CONDIÇÕES */}
          <div style={{ display: "flex", gap: 18, alignItems: "stretch" }}>
            <div style={{ flex: 1, border: `1px solid ${t.linha}`, borderRadius: t.raio, padding: "14px 18px", fontSize: 12.5, lineHeight: 1.7 }}>
              <div style={{ fontSize: 10.5, letterSpacing: 2, fontWeight: 700, color: t.destaque, marginBottom: 4 }}>CONDIÇÕES</div>
              <div>
                <b>Pagamento:</b> {o.pagamento || "a combinar"}
              </div>
              <div>
                <b>Prazo de entrega:</b> {o.prazoDias ? `${o.prazoDias} dias após a aprovação` : "a combinar"}
              </div>
              <div>
                <b>Validade:</b> {o.validadeDias || 15} dias ({validade})
              </div>
              {e.pix && (
                <div>
                  <b>PIX:</b> {e.pix}
                </div>
              )}
            </div>
            <div style={{ width: 290, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ border: `1px solid ${t.linha}`, borderRadius: t.raio, padding: "12px 18px", fontSize: 13, lineHeight: 1.9 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: t.suave }}>Subtotal</span>
                  <span>{brl(tt.subtotal)}</span>
                </div>
                {tt.desconto > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: t.suave }}>Desconto{o.desconto.tipo === "%" ? ` (${o.desconto.valor}%)` : ""}</span>
                    <span>− {brl(tt.desconto)}</span>
                  </div>
                )}
                {tt.adicional > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: t.suave }}>{o.adicional.nome || "Adicional"}</span>
                    <span>{brl(tt.adicional)}</span>
                  </div>
                )}
              </div>
              <div style={{ background: t.totalFundo, color: t.totalTexto, borderRadius: t.raio, padding: minimal ? "10px 0" : "16px 18px", borderTop: minimal ? `2px solid ${t.texto}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, letterSpacing: 2, fontWeight: 700 }}>TOTAL</span>
                <span style={{ fontFamily: t.titulo, fontSize: vibrante ? 30 : 26, fontWeight: 800 }}>{brl(tt.total)}</span>
              </div>
            </div>
          </div>

          {o.observacoes && (
            <div style={{ borderLeft: `3px solid ${t.destaque}`, background: o.template === "premium" ? "#17181d" : clarear(t.destaque === "#111111" ? "#888888" : t.destaque, 0.07), padding: "12px 16px", borderRadius: Math.min(t.raio, 8), fontSize: 12.5, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              <div style={{ fontSize: 10.5, letterSpacing: 2, fontWeight: 700, color: t.destaque, marginBottom: 3 }}>OBSERVAÇÕES</div>
              {o.observacoes}
            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* ASSINATURA */}
          <div style={{ display: "flex", gap: 40, paddingTop: 10 }}>
            {[e.nome || "Marcenaria", o.cliente.nome || "Cliente"].map((n, k) => (
              <div key={k} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ borderTop: `1px solid ${t.suave}`, paddingTop: 6, fontSize: 11.5, color: t.suave }}>{k === 0 ? `${n} · responsável` : `${n} · de acordo`}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", fontSize: 10.5, color: t.suave, letterSpacing: 0.5 }}>Orçamento gerado com o App do Marceneiro</div>
        </div>
      </div>
    </div>
  );
});
