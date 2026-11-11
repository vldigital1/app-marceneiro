// Depois do `next build`: compacta out/ em hostinger-upload.zip.
// O conteúdo fica na raiz do zip — extraia direto dentro de public_html.
import { copyFileSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { zipSync, type Zippable } from "fflate";

const out = join(process.cwd(), "out");
if (!existsSync(join(out, "index.html"))) {
  console.error("out/index.html não encontrado — rode `next build` primeiro.");
  process.exit(1);
}

// O Next 16 exporta os arquivos de prefetch em subpastas (__next.projetos/$d$slug/__PAGE__.txt),
// mas o navegador pede o nome achatado (__next.projetos.$d$slug.__PAGE__.txt). Criamos as cópias
// achatadas para a hospedagem estática servir sem 404.
let flattened = 0;
const flatten = (dir: string) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isDirectory()) continue;
    if (name.startsWith("__next.")) {
      const walkSeg = (d: string) => {
        for (const n of readdirSync(d)) {
          const f = join(d, n);
          if (statSync(f).isDirectory()) walkSeg(f);
          else {
            const flat = join(dirname(full), relative(dirname(full), f).split(sep).join("."));
            if (!existsSync(flat)) {
              copyFileSync(f, flat);
              flattened++;
            }
          }
        }
      };
      walkSeg(full);
    } else flatten(full);
  }
};
flatten(out);
console.log(`Arquivos de prefetch achatados: ${flattened}`);

// .htaccess com o caminho da publicação (raiz ou subpasta)
const base = (process.env.BASE_PATH ?? "").replace(/\/$/, "");
// domínios autorizados (mesma lista do config-servidor.json) para a proteção contra hotlink
const dominiosRegex = (JSON.parse(readFileSync(join(process.cwd(), "config-servidor.json"), "utf8")).dominios as string[]).map((d) => d.replace(/[.]/g, "[.]")).join("|");
writeFileSync(
  join(out, ".htaccess"),
  `# Hostinger / Apache — site estático exportado pelo Next.js${base ? ` (publicado em ${base}/)` : ""}
Options -MultiViews -Indexes
DirectoryIndex index.html
ErrorDocument 404 ${base}/404.html

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase ${base}/
  # arquivos internos da API (senhas, segredo, conteúdo exclusivo) nunca saem direto
  RewriteRule (^|/)api/_ - [F,L]
  # robôs que baixam sites inteiros para clonar
  RewriteCond %{HTTP_USER_AGENT} (HTTrack|WebCopier|Offline[ ]Explorer|SiteSucker|WebZIP|Teleport|WebStripper|WebReaper|Website[ ]Downloader|wget|curl|python-requests|python-urllib|scrapy|Go-http-client|libwww|HeadlessChrome|PhantomJS) [NC]
  RewriteRule .* - [F,L]
  # imagens, renders e PDFs não podem ser exibidos por outros sites
  RewriteCond %{HTTP_REFERER} !^$
  RewriteCond %{HTTP_REFERER} !^https?://(${dominiosRegex})(:[0-9]+)?/ [NC]
  RewriteRule [.](svg|png|jpe?g|webp|pdf)$ - [F,NC,L]
  # força HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  # /catalogo -> /catalogo/ (as páginas ficam em pasta/index.html)
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_URI} !/$
  RewriteCond %{REQUEST_FILENAME}/ -d
  RewriteRule ^(.*)$ ${base}/$1/ [L,R=301]
</IfModule>

<IfModule mod_headers.c>
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set Content-Security-Policy "frame-ancestors 'self'"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "same-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
  <FilesMatch "\\.(js|css|woff2|png|jpg|jpeg|webp|svg)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.html$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
  <FilesMatch "\\.pdf$">
    Header set Content-Disposition "attachment"
  </FilesMatch>
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
</IfModule>
`,
  "utf8",
);

const files: Zippable = {};
const walk = (dir: string) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    // caminhos com "/" (padrão zip) para extrair certo no Linux da Hostinger
    else files[relative(out, full).split("\\").join("/")] = [readFileSync(full), { level: /\.(png|jpe?g|webp|woff2|pdf)$/i.test(name) ? 0 : 6 }];
  }
};
walk(out);
const zipName = base ? `hostinger-upload-${base.replace(/^\//, "").replace(/\//g, "-")}.zip` : "hostinger-upload.zip";
writeFileSync(join(process.cwd(), zipName), zipSync(files));
console.log(`\nPronto: ${zipName} com ${Object.keys(files).length} arquivos — publicar em ${base || "a raiz do domínio"}.`);

// Plano de corte sozinho: um zip só com o index.html independente
const plano = readFileSync(join(process.cwd(), "standalone", "plano-de-corte", "index.html"));
writeFileSync(join(process.cwd(), "plano-de-corte.zip"), zipSync({ "index.html": [plano, { level: 6 }] }));
console.log("Pronto: plano-de-corte.zip (index.html independente do plano de corte).");
