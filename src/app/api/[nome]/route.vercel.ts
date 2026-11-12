// API de desbloqueio para a VERCEL (mesma lógica de server/api/*.php da Hostinger).
// Só entra no build quando VERCEL=1 (ver pageExtensions em next.config.ts).
// Configuração por variáveis de ambiente no painel da Vercel:
//   SENHAS (ou SENHA) → senha(s) de desbloqueio, separadas por vírgula
//   SEGREDO (opcional) → texto aleatório longo (24+ caracteres) que assina o cookie
//   DIAS     → validade do desbloqueio em dias (padrão 365)
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE = "adm_acesso";
const DADOS = join(process.cwd(), "dados-protegidos");
// SENHAS (ou SENHA): senha(s) de desbloqueio, separadas por vírgula.
const SENHAS = (process.env.SENHAS ?? process.env.SENHA ?? "").split(",").map((s) => s.trim()).filter(Boolean);
// SEGREDO é opcional: sem ele, a chave de assinatura é derivada da própria senha (que é secreta).
// Quem não tem a senha não consegue forjar o acesso; trocar a senha invalida os acessos antigos.
const SEGREDO =
  process.env.SEGREDO && process.env.SEGREDO.length >= 24
    ? process.env.SEGREDO
    : SENHAS.length
      ? createHash("sha256").update(`app-do-marceneiro|${SENHAS.join(",")}`).digest("hex")
      : "";
const DIAS = Math.max(1, Number(process.env.DIAS ?? 365) || 365);
const DOMINIOS = (process.env.NEXT_PUBLIC_DOMINIOS ?? "").split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
const tentativas = new Map<string, { n: number; t: number }>();
const usoIA = new Map<string, number[]>();

const b64u = (b: Buffer | string) => Buffer.from(b).toString("base64url");
const hmac = (txt: string) => createHmac("sha256", SEGREDO).update(txt);
const igual = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const marca = (s: string) => hmac(s.toUpperCase()).digest("hex").slice(0, 20);
const idOk = (s: string) => /^[a-z0-9][a-z0-9-]{0,120}$/.test(s);

const HEAD = { "Cache-Control": "no-store, private", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex, nofollow" };
const json = (dados: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(dados), { status, headers: { ...HEAD, "Content-Type": "application/json; charset=utf-8", ...extra } });

function cookie(valor: string, maxAge: number) {
  return `${COOKIE}=${valor}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

function liberado(req: Request) {
  if (!SEGREDO || !SENHAS.length) return false;
  const c = (req.headers.get("cookie") ?? "").split(/;\s*/).find((x) => x.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1) ?? "";
  const [payload, sig] = c.split(".");
  if (!payload || !sig || !igual(b64u(hmac(payload).digest()), sig)) return false;
  try {
    const d = JSON.parse(Buffer.from(payload, "base64url").toString()) as { m: string; e: number };
    return d.e > Date.now() / 1000 && SENHAS.some((s) => igual(marca(s), String(d.m)));
  } catch {
    return false;
  }
}

function origemOk(req: Request) {
  const h = req.headers.get("origin") ?? req.headers.get("referer");
  if (!h || !DOMINIOS.length) return true;
  try {
    return DOMINIOS.includes(new URL(h).hostname.toLowerCase());
  } catch {
    return false;
  }
}

async function tratar(req: Request, nome: string) {
  if (!origemOk(req)) return json({ ok: false, erro: "Origem não autorizada." }, 403);
  const url = new URL(req.url);

  if (nome === "status.php") return json({ liberado: liberado(req) });
  if (nome === "sair.php") return json({ ok: true }, 200, { "Set-Cookie": cookie("", 0) });

  if (nome === "desbloquear.php") {
    if (req.method !== "POST") return json({ ok: false, erro: "Método não permitido." }, 405);
    if (!SEGREDO || !SENHAS.length) return json({ ok: false, erro: "Servidor sem senha configurada." }, 500);
    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "?";
    const t = tentativas.get(ip);
    if (t && t.n >= 8 && Date.now() - t.t < 900e3) return json({ ok: false, erro: "Muitas tentativas. Aguarde 15 minutos e tente de novo." }, 429);
    let senha = "";
    try {
      senha = String(((await req.json()) as { senha?: string }).senha ?? "").trim().toUpperCase();
    } catch {}
    const ok = SENHAS.find((s) => senha && igual(s.toUpperCase(), senha));
    if (!ok) {
      const cur = t && Date.now() - t.t < 900e3 ? t : { n: 0, t: Date.now() };
      tentativas.set(ip, { n: cur.n + 1, t: cur.t });
      await new Promise((r) => setTimeout(r, 600));
      return json({ ok: false, erro: "Senha incorreta. Confira a senha que chegou no WhatsApp." }, 401);
    }
    tentativas.delete(ip);
    const exp = Math.floor(Date.now() / 1000) + 86400 * DIAS;
    const payload = b64u(JSON.stringify({ m: marca(ok), e: exp }));
    return json({ ok: true }, 200, { "Set-Cookie": cookie(`${payload}.${b64u(hmac(payload).digest())}`, 86400 * DIAS) });
  }

  if (nome === "conteudo.php") {
    const tipo = url.searchParams.get("tipo") ?? "";
    const id = url.searchParams.get("id") ?? "";
    if (!["projeto", "aula", "video"].includes(tipo) || !idOk(id)) return json({ erro: "Pedido inválido." }, 400);
    if (!liberado(req)) return json({ erro: "Conteúdo bloqueado." }, 401);
    const f = join(DADOS, tipo, `${id}.json`);
    if (!existsSync(f)) return json({ erro: "Não encontrado." }, 404);
    return new Response(readFileSync(f), { headers: { ...HEAD, "Content-Type": "application/json; charset=utf-8" } });
  }

  if (nome === "arquivo.php") {
    const tipo = url.searchParams.get("tipo") ?? "";
    const id = url.searchParams.get("id") ?? "";
    const v = url.searchParams.get("v") ?? "";
    if (!idOk(id) || !["pdf", "render"].includes(tipo) || (tipo === "render" && !["explodida", "vistas"].includes(v))) return new Response(null, { status: 400 });
    if (!liberado(req)) return new Response("Conteúdo bloqueado. Digite a senha de desbloqueio no app.", { status: 401, headers: { ...HEAD, "Content-Type": "text/plain; charset=utf-8" } });
    const f = tipo === "pdf" ? join(DADOS, "pdf", `${id}.pdf`) : join(DADOS, "render", id, `${v}.svg`);
    if (!existsSync(f)) return new Response(null, { status: 404 });
    return new Response(readFileSync(f), {
      headers: { ...HEAD, "Content-Type": tipo === "pdf" ? "application/pdf" : "image/svg+xml", ...(tipo === "pdf" ? { "Content-Disposition": `attachment; filename="${id}.pdf"` } : {}) },
    });
  }

  if (nome === "assistente") {
    // assistente de orçamento por voz: só para quem já liberou o app (evita custo com uso anônimo)
    if (req.method !== "POST") return json({ erro: "Método não permitido." }, 405);
    if (!process.env.ANTHROPIC_API_KEY) return json({ erro: "Assistente de IA ainda não configurado.", semIA: true }, 503);
    if (!liberado(req)) return json({ erro: "O assistente de IA faz parte do acesso completo. Digite sua senha de acesso.", bloqueado: true }, 401);
    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "?";
    const agora = Date.now();
    const uso = (usoIA.get(ip) ?? []).filter((t) => agora - t < 3600e3);
    if (uso.length >= 30) return json({ erro: "Muitos pedidos ao assistente nesta hora. Tente de novo mais tarde." }, 429);
    usoIA.set(ip, [...uso, agora]);
    let corpo: { texto?: string; clientes?: string[] } = {};
    try {
      corpo = (await req.json()) as typeof corpo;
    } catch {}
    const texto = String(corpo.texto ?? "").trim().slice(0, 3000);
    if (texto.length < 3) return json({ erro: "Fale ou escreva o que vai no orçamento." }, 400);
    const clientes = Array.isArray(corpo.clientes) ? corpo.clientes.map((c) => String(c).slice(0, 80)) : [];
    try {
      const { interpretarPedido } = await import("@/lib/assistente-ia");
      return json(await interpretarPedido({ texto, clientes }));
    } catch (e) {
      return json({ erro: e instanceof Error ? e.message : "Falha no assistente." }, 502);
    }
  }

  return new Response(null, { status: 404 });
}

type Ctx = { params: Promise<{ nome: string }> };
export async function GET(req: Request, ctx: Ctx) {
  return tratar(req, (await ctx.params).nome);
}
export async function POST(req: Request, ctx: Ctx) {
  return tratar(req, (await ctx.params).nome);
}
