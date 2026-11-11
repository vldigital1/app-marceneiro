// Servidor local para testar o app completo (site + API de desbloqueio) sem PHP.
// Reproduz a mesma lógica de server/api/*.php: senha, cookie assinado e conteúdo protegido.
//   node scripts/servidor-local.mjs            → http://localhost:4174/<base>/
// Usa a pasta out/ do último build e o config-servidor.json.
import { createHmac, timingSafeEqual } from "node:crypto";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, "out");
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
// --config outro.json  → usa outra configuração (ex.: senha só de teste); --porta 4175
const PORTA = Number(arg("--porta") ?? process.env.PORT ?? 4174);
const cfg = JSON.parse(readFileSync(arg("--config") ?? join(ROOT, "config-servidor.json"), "utf8"));
const php = readFileSync(join(OUT, "api", "_config.php"), "utf8");
const BASE = (php.match(/'base' => '([^']*)'/) ?? [, ""])[1];
const DADOS = join(OUT, "api", "_dados");
const COOKIE = "adm_acesso";
const tentativas = new Map();

const TIPOS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".pdf": "application/pdf", ".json": "application/json", ".txt": "text/plain; charset=utf-8", ".woff2": "font/woff2", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".webmanifest": "application/manifest+json" };

const b64u = (b) => Buffer.from(b).toString("base64url");
const hmac = (txt, raw = false) => {
  const h = createHmac("sha256", cfg.segredo).update(txt);
  return raw ? h.digest() : h.digest("hex");
};
const igual = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const marca = (s) => hmac(String(s).toUpperCase()).slice(0, 20);

function cookies(req) {
  return Object.fromEntries((req.headers.cookie ?? "").split(/;\s*/).filter(Boolean).map((c) => [c.slice(0, c.indexOf("=")), decodeURIComponent(c.slice(c.indexOf("=") + 1))]));
}
function liberado(req) {
  const c = cookies(req)[COOKIE] ?? "";
  const [payload, sig] = c.split(".");
  if (!payload || !sig || !igual(b64u(hmac(payload, true)), sig)) return false;
  try {
    const d = JSON.parse(Buffer.from(payload, "base64url").toString());
    return d.e > Date.now() / 1000 && cfg.senhas.some((s) => igual(marca(s), String(d.m)));
  } catch {
    return false;
  }
}
function json(res, status, dados, extra = {}) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra });
  res.end(JSON.stringify(dados));
}
function origemOk(req) {
  const h = req.headers.origin ?? req.headers.referer;
  if (!h) return true;
  try {
    return cfg.dominios.includes(new URL(h).hostname.toLowerCase());
  } catch {
    return false;
  }
}
const idOk = (s) => /^[a-z0-9][a-z0-9-]{0,120}$/.test(s);

async function api(req, res, nome, url) {
  if (!origemOk(req)) return json(res, 403, { ok: false, erro: "Origem não autorizada." });
  if (nome === "status.php") return json(res, 200, { liberado: liberado(req) });
  if (nome === "sair.php") return json(res, 200, { ok: true }, { "Set-Cookie": `${COOKIE}=; Path=${BASE}/; Max-Age=0; HttpOnly; SameSite=Lax` });
  if (nome === "desbloquear.php") {
    if (req.method !== "POST") return json(res, 405, { ok: false, erro: "Método não permitido." });
    const ip = req.socket.remoteAddress;
    const t = tentativas.get(ip);
    if (t && t.n >= 8 && Date.now() - t.t < 900e3) return json(res, 429, { ok: false, erro: "Muitas tentativas. Aguarde 15 minutos e tente de novo." });
    let body = "";
    for await (const ch of req) body += ch;
    let senha = "";
    try {
      senha = String(JSON.parse(body).senha ?? "").trim().toUpperCase();
    } catch {}
    const ok = cfg.senhas.find((s) => senha && igual(String(s).toUpperCase(), senha));
    if (!ok) {
      const cur = t && Date.now() - t.t < 900e3 ? t : { n: 0, t: Date.now() };
      tentativas.set(ip, { n: cur.n + 1, t: cur.t });
      await new Promise((r) => setTimeout(r, 600));
      return json(res, 401, { ok: false, erro: "Senha incorreta. Confira a senha que chegou no WhatsApp." });
    }
    tentativas.delete(ip);
    const exp = Math.floor(Date.now() / 1000) + 86400 * cfg.diasValidade;
    const payload = b64u(JSON.stringify({ m: marca(ok), e: exp }));
    const sig = b64u(hmac(payload, true));
    return json(res, 200, { ok: true }, { "Set-Cookie": `${COOKIE}=${payload}.${sig}; Path=${BASE}/; Max-Age=${86400 * cfg.diasValidade}; HttpOnly; SameSite=Lax` });
  }
  if (nome === "conteudo.php") {
    const tipo = url.searchParams.get("tipo") ?? "";
    const id = url.searchParams.get("id") ?? "";
    if (!["projeto", "aula", "video"].includes(tipo) || !idOk(id)) return json(res, 400, { erro: "Pedido inválido." });
    if (!liberado(req)) return json(res, 401, { erro: "Conteúdo bloqueado." });
    const f = join(DADOS, tipo, `${id}.json`);
    if (!existsSync(f)) return json(res, 404, { erro: "Não encontrado." });
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
    return createReadStream(f).pipe(res);
  }
  if (nome === "arquivo.php") {
    const tipo = url.searchParams.get("tipo") ?? "";
    const id = url.searchParams.get("id") ?? "";
    const v = url.searchParams.get("v") ?? "";
    if (!idOk(id) || !["pdf", "render"].includes(tipo) || (tipo === "render" && !["explodida", "vistas"].includes(v))) return (res.writeHead(400), res.end());
    if (!liberado(req)) return (res.writeHead(401, { "Content-Type": "text/plain; charset=utf-8" }), res.end("Conteúdo bloqueado. Digite a senha de desbloqueio no app."));
    const f = tipo === "pdf" ? join(DADOS, "pdf", `${id}.pdf`) : join(DADOS, "render", id, `${v}.svg`);
    if (!existsSync(f)) return (res.writeHead(404), res.end());
    res.writeHead(200, { "Content-Type": tipo === "pdf" ? "application/pdf" : "image/svg+xml", ...(tipo === "pdf" ? { "Content-Disposition": `attachment; filename="${id}.pdf"` } : {}) });
    return createReadStream(f).pipe(res);
  }
  res.writeHead(404);
  res.end();
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  let path = decodeURIComponent(url.pathname);
  if (BASE && path === "/") return (res.writeHead(302, { Location: `${BASE}/` }), res.end());
  if (BASE) {
    if (!path.startsWith(`${BASE}/`) && path !== BASE) return (res.writeHead(404), res.end("Fora do app"));
    path = path.slice(BASE.length) || "/";
  }
  if (/^\/api\/_/.test(path) || path.includes("/api/_dados")) return (res.writeHead(403), res.end("Proibido")); // _config.php, _lib.php, _dados/
  if (path.startsWith("/api/")) return api(req, res, path.slice(5), url);
  let f = normalize(join(OUT, path));
  if (!f.startsWith(OUT)) return (res.writeHead(403), res.end());
  if (existsSync(f) && statSync(f).isDirectory()) {
    if (!path.endsWith("/")) return (res.writeHead(301, { Location: `${BASE}${path}/${url.search}` }), res.end());
    f = join(f, "index.html");
  }
  if (!existsSync(f)) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    return existsSync(join(OUT, "404.html")) ? createReadStream(join(OUT, "404.html")).pipe(res) : res.end("404");
  }
  res.writeHead(200, { "Content-Type": TIPOS[extname(f)] ?? "application/octet-stream" });
  createReadStream(f).pipe(res);
}).listen(PORTA, () => console.log(`App do Marceneiro rodando em http://localhost:${PORTA}${BASE}/`));
