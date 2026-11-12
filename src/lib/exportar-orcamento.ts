"use client";

// Exporta a folha do orçamento (o mesmo HTML da tela) como PNG ou PDF A4, e compartilha no celular.
import { A4_ALTURA, A4_LARGURA } from "@/components/orcamento/Modelos";

async function png(no: HTMLElement): Promise<string> {
  const { toPng } = await import("html-to-image");
  // skipFonts: os modelos usam fontes do sistema; evita baixar as fontes da página
  return toPng(no, { pixelRatio: 2, cacheBust: true, skipFonts: true, width: A4_LARGURA, height: no.scrollHeight, style: { transform: "none", margin: "0" } });
}

function dataUrlParaBlob(url: string) {
  const [cab, b64] = url.split(",");
  const tipo = cab.match(/:(.*?);/)?.[1] ?? "application/octet-stream";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: tipo });
}

export async function gerarImagem(no: HTMLElement): Promise<Blob> {
  return dataUrlParaBlob(await png(no));
}

export async function gerarPdf(no: HTMLElement): Promise<Blob> {
  const url = await png(no);
  const { jsPDF } = await import("jspdf");
  const altura = Math.max(A4_ALTURA, no.scrollHeight);
  const pdf = new jsPDF({ unit: "px", format: [A4_LARGURA, A4_ALTURA], orientation: "portrait", hotfixes: ["px_scaling"], compress: true });
  const paginas = Math.ceil(altura / A4_ALTURA - 0.02);
  for (let p = 0; p < paginas; p++) {
    if (p) pdf.addPage([A4_LARGURA, A4_ALTURA], "portrait");
    // a mesma imagem deslocada para cima em cada página: o PDF corta o que sobra
    pdf.addImage(url, "PNG", 0, -p * A4_ALTURA, A4_LARGURA, altura, undefined, "FAST");
  }
  return pdf.output("blob");
}

export function baixar(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Compartilha pelo menu do celular (WhatsApp, e-mail…). Devolve false se o aparelho não permite. */
export async function compartilhar(blob: Blob, nome: string, texto: string): Promise<boolean> {
  const arquivo = new File([blob], nome, { type: blob.type });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [arquivo] })) {
    try {
      await nav.share({ files: [arquivo], text: texto, title: nome });
      return true;
    } catch (e) {
      // cancelado pela pessoa: não é erro
      if (e instanceof DOMException && e.name === "AbortError") return true;
    }
  }
  return false;
}
