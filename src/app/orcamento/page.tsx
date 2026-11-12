import type { Metadata } from "next";
import { OrcamentoApp } from "@/components/orcamento/OrcamentoApp";

export const metadata: Metadata = { title: "Orçamentos com IA", description: "Gere orçamentos profissionais para seus clientes: fale o pedido, a IA preenche, escolha o modelo e envie em PDF ou imagem." };

export default function OrcamentoPage() {
  return <OrcamentoApp />;
}
