# App do Marceneiro

Next.js 16 + Tailwind 4 + Framer Motion, exportado como site estático + uma API pequena em PHP (pasta `api/`) para a senha de desbloqueio. Roda em hospedagem comum da Hostinger.

- 335 projetos (175 livres, 160 exclusivos) com 3D, lista de corte, plano de corte e PDF
- Projetos sob medida (`/configurador`): 12 móveis com medidas, cores, portas, prateleiras, colunas, 3D girável, corte por material e ferragens
- Aulas (`/aulas`): 7 módulos com checagem rápida e pontos do dia
- Vídeos (`/videos`): player próprio (só play/pausa e volume)
- Plano de corte também como página independente (`plano-de-corte.zip`)

## Publicar na Hostinger

1. `npm install` (só na primeira vez)
2. Na subpasta /projeto: `npm run build:projeto` · na raiz do domínio: `npm run build`
3. Envie o `hostinger-upload-<pasta>.zip` para a pasta certa no Gerenciador de Arquivos, clique em **Extrair** e apague o zip.

O pacote já leva o `.htaccess` (proteção, cabeçalhos, bloqueio de copiadores) e a pasta `api/`.

## Publicar na Vercel

1. Repositório do GitHub **privado** (o código tem o conteúdo exclusivo).
2. Vercel → Add New → Project → importe o repositório (o `vercel.json` já define o build).
3. Em Settings → Environment Variables, crie:
   - `SENHAS` — a senha de desbloqueio (várias: separe por vírgula)
   - `SEGREDO` — um texto aleatório com 24+ caracteres (não compartilhe)
   - `DOMINIOS` — seus domínios, ex.: `appdomarceneiro.com.br,www.appdomarceneiro.com.br` (o endereço `.vercel.app` entra sozinho)
   - `DIAS` — opcional, validade do desbloqueio (padrão 365)
4. Deploy. Trocar `SENHAS` + Redeploy encerra os acessos com a senha antiga.

Na Vercel a API é `src/app/api/[nome]/route.vercel.ts` e os dados exclusivos ficam em `dados-protegidos/` (fora da pasta pública).

## Senha de desbloqueio (PIX → WhatsApp)

- O primeiro build cria o `config-servidor.json` (fica fora do Git) com a senha, o segredo do cookie e os domínios autorizados.
- A automação do WhatsApp deve enviar uma das `senhas` dessa lista depois que o PIX cair.
- Para trocar a senha: edite `senhas` e gere o build de novo, **ou** edite direto `api/_config.php` no servidor. Trocar a senha encerra o acesso de quem usava a antiga. Dá para manter várias senhas ao mesmo tempo.
- Maiúsculas/minúsculas não importam. Depois de 8 tentativas erradas, o IP espera 15 minutos.
- `dominios`: só esses endereços abrem o app (o resto vê "Cópia não autorizada"). Tire `localhost` antes do build final se quiser.

## Testar no computador

`npm run build:projeto` e depois `node scripts/servidor-local.mjs` → http://localhost:4174/projeto/ (imita a API PHP).
Para testar com outra senha sem mexer na real: `node scripts/servidor-local.mjs --config outro.json --porta 4175`.

## Onde editar

| O quê | Arquivo |
|---|---|
| Chave PIX, favorecido, WhatsApp, FAQ | `src/content/oferta.ts` |
| Nome do app | `src/lib/site.ts` |
| Vídeos do seu canal | `src/content/videos.ts` |
| Aulas e perguntas | `src/content/curso/` (livres: `modulos-livres.ts`, bloqueadas: `modulos-exclusivos.ts`) |
| Móveis sob medida | `src/lib/configurador.ts` |
| Projetos | `src/data/` (`gen/` para os gerados) — exclusivos = intermediário e avançado (`isLocked` em `src/data/index.ts`) |
| Posts do blog | `src/data/posts.ts` |

## O que a proteção faz (e o limite)

O conteúdo bloqueado (texto das aulas exclusivas, montagem e lista de corte dos projetos exclusivos, PDFs e vistas técnicas) **não existe** no HTML/JS público: fica em `api/_dados/`, que o servidor nega, e só sai pela API para quem tem o cookie assinado. Botão direito, atalhos de código, iframes e copiadores conhecidos (HTTrack etc.) são bloqueados. O que aparece na tela de quem pagou sempre pode ser fotografado ou digitado — nenhum site impede isso por completo.
