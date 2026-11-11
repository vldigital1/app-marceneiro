// Prefixo da subpasta onde o site está publicado ("" na raiz do domínio, "/projeto" numa subpasta).
// <Link> do Next já aplica sozinho; use withBase() em <a>, <img> e caminhos de arquivos.
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? process.env.BASE_PATH ?? "").replace(/\/$/, "");

export const withBase = (path: string) => `${BASE_PATH}${path}`;
