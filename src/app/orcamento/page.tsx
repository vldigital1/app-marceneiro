import type { Metadata } from "next";
import { OrcamentoApp } from "@/components/orcamento/OrcamentoApp";

export const metadata: Metadata = { title: "Orçamentos", description: "Gere orçamentos profissionais para seus clientes: responda algumas perguntas, escolha o modelo e envie em PDF ou imagem." };

export default function OrcamentoPage() {
  return <OrcamentoApp />;
}
