// config-servidor.json — senha(s) de desbloqueio, segredo de assinatura e domínios autorizados.
// Criado automaticamente no primeiro build. NUNCA vai para o GitHub (.gitignore).
import { randomBytes, randomInt } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type ConfigServidor = {
  /** senhas aceitas (a automação do WhatsApp envia uma delas). Trocar = invalidar acessos antigos. */
  senhas: string[];
  /** chave secreta que assina o cookie de acesso. Não compartilhe. */
  segredo: string;
  /** domínios onde o app pode funcionar (o resto vê "cópia não autorizada"). */
  dominios: string[];
  /** quantos dias o desbloqueio vale no aparelho */
  diasValidade: number;
};

const ARQ = join(process.cwd(), "config-servidor.json");
const ALFA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem 0/O/1/I para não confundir no WhatsApp

export const gerarSenha = () => `MARC-${Array.from({ length: 4 }, () => ALFA[randomInt(ALFA.length)]).join("")}-${Array.from({ length: 4 }, () => ALFA[randomInt(ALFA.length)]).join("")}`;

export function lerConfig(): ConfigServidor {
  if (!existsSync(ARQ)) {
    const nova: ConfigServidor = {
      senhas: [gerarSenha()],
      segredo: randomBytes(32).toString("base64url"),
      dominios: ["appmarceneiro.online", "www.appmarceneiro.online", "diariodagestacao.online", "www.diariodagestacao.online", "localhost", "127.0.0.1"],
      diasValidade: 365,
    };
    writeFileSync(ARQ, JSON.stringify(nova, null, 2) + "\n", "utf8");
    console.log("config-servidor.json criado com uma senha nova de desbloqueio.");
  }
  const c = JSON.parse(readFileSync(ARQ, "utf8")) as ConfigServidor;
  if (!c.senhas?.length || !c.segredo || c.segredo.length < 24) throw new Error("config-servidor.json inválido: precisa de pelo menos uma senha e de um segredo com 24+ caracteres.");
  c.dominios = c.dominios.map((d) => d.toLowerCase().trim());
  return c;
}

/** _config.php lido pela API PHP na Hostinger */
export function configPhp(c: ConfigServidor, base: string) {
  const s = (v: string) => `'${v.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
  return `<?php
// Gerado no build a partir de config-servidor.json — edite lá e gere de novo,
// ou edite aqui direto no servidor (Gerenciador de Arquivos da Hostinger).
return [
    'senhas' => [${c.senhas.map(s).join(", ")}],
    'segredo' => ${s(c.segredo)},
    'dominios' => [${c.dominios.map(s).join(", ")}],
    'dias' => ${Math.max(1, Math.round(c.diasValidade))},
    'base' => ${s(base)},
];
`;
}
