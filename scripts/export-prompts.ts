// Gera docs/prompts-imagens.md com 3 prompts por projeto (produto, ambiente, vista explodida).
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getPosts, getProjects } from "../src/data";

const projects = getProjects();
const lines = [
  "# Prompts de imagem — ilustrações originais",
  "",
  "Gere as imagens no seu gerador e salve em `public/images/projetos/<slug>/` com nomes `1.jpg`, `2.jpg`, `3.jpg`.",
  "No próximo `npm run build` elas entram sozinhas no catálogo, na ficha e na página de vendas (a primeira vira capa).",
  "",
];
for (const p of projects) {
  lines.push(`## ${p.title}`, "", `Pasta: \`public/images/projetos/${p.slug}/\``, "");
  p.imagePrompts.forEach((pr, i) => lines.push(`${i + 1}. ${pr}`, ""));
}
lines.push("---", "", "# Capas do blog", "");
for (const post of getPosts()) lines.push(`- **${post.title}** — ${post.coverPrompt}`, "");

mkdirSync(join(process.cwd(), "docs"), { recursive: true });
writeFileSync(join(process.cwd(), "docs", "prompts-imagens.md"), lines.join("\n"), "utf8");
console.log(`docs/prompts-imagens.md: ${projects.length} projetos × 3 prompts`);
