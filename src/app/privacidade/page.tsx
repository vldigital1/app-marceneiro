import type { Metadata } from "next";
import { pix } from "@/content/oferta";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Política de privacidade", description: `Como o ${site.name} trata os seus dados.` };

const ATUALIZADA = "12 de novembro de 2026";

export default function PrivacidadePage() {
  const zap = pix.whatsapp ? `+${pix.whatsapp.slice(0, 2)} (${pix.whatsapp.slice(2, 4)}) ${pix.whatsapp.slice(4, 9)}-${pix.whatsapp.slice(9)}` : "";
  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="text-4xl">Política de privacidade</h1>
      <p className="mt-2 text-sm text-bark-500">Última atualização: {ATUALIZADA}</p>

      <div className="prose-post mt-6">
        <p>
          Esta política explica como o <strong>{site.name}</strong> (aplicativo e site appmarceneiro.online), mantido por {pix.favorecido}, CNPJ {pix.chaveFormatada}, trata
          as informações de quem usa o app, conforme a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).
        </p>

        <h2>1. Não pedimos cadastro</h2>
        <p>O app funciona sem conta e sem login. Não pedimos seu nome, e-mail, telefone, documento ou localização para usar o app.</p>

        <h2>2. O que fica salvo no seu aparelho</h2>
        <p>Para o app lembrar o que você fez, algumas informações ficam guardadas <strong>somente no seu próprio aparelho</strong> (armazenamento local do navegador):</p>
        <ul>
          <li>projetos favoritos, projetos que você está fazendo e o checklist de montagem;</li>
          <li>móveis montados no Sob medida e salvos com o nome do cliente que você digitou;</li>
          <li>progresso e pontos das aulas;</li>
          <li>a sua escolha de ativar ou não o sininho de novidades.</li>
        </ul>
        <p>Essas informações não são enviadas para nós. Você pode apagá-las a qualquer momento limpando os dados do navegador ou desinstalando o app.</p>

        <h2>3. Orçamentos e clientes</h2>
        <p>
          Os dados que você cadastra no gerador de orçamentos — nome, logo e contatos da sua marcenaria, e nome, telefone, e-mail e endereço dos seus clientes — ficam salvos{" "}
          <strong>somente no seu aparelho</strong>. Eles só saem dele quando você mesmo exporta ou envia um orçamento (PDF ou imagem) pelo WhatsApp ou outro app. Você é
          responsável por ter autorização dos seus clientes para guardar esses contatos.
        </p>

        <h2>4. Assistente de IA</h2>
        <p>
          Quando você usa o assistente de IA, o texto do seu pedido (o que você falou, transcrito pelo reconhecimento de voz do próprio aparelho, ou o que digitou) e os nomes
          dos clientes cadastrados são enviados ao nosso servidor e processados pela Anthropic (fornecedora do modelo de IA Claude) apenas para montar o orçamento. Não
          enviamos o áudio. O reconhecimento de voz é feito pelo serviço de voz do seu navegador ou sistema (por exemplo, o Google no Android), conforme a política dele.
        </p>

        <h2>5. Senha de acesso</h2>
        <p>
          Quando você digita a senha de acesso, ela é conferida no nosso servidor e o app grava um cookie de acesso no seu aparelho, assinado digitalmente, só para lembrar que o
          conteúdo está liberado. Esse cookie não contém dados pessoais e expira automaticamente.
        </p>

        <h2>6. Hospedagem e segurança</h2>
        <p>
          O app é hospedado por provedores de nuvem que, como qualquer servidor da internet, registram dados técnicos das conexões (como endereço IP, data e hora e tipo de
          navegador) para segurança e funcionamento. Usamos esses registros apenas para proteger o serviço, por exemplo contra tentativas repetidas de senha.
        </p>

        <h2>7. Vídeos do YouTube</h2>
        <p>
          Os vídeos são exibidos pelo player do YouTube, um serviço do Google. Ao assistir, o YouTube pode tratar dados conforme a{" "}
          <a href="https://policies.google.com/privacy?hl=pt-BR" target="_blank" rel="noopener noreferrer">
            Política de Privacidade do Google
          </a>
          .
        </p>

        <h2>8. Notificações</h2>
        <p>Se você ativar o sininho, o app pede permissão do aparelho para mostrar avisos de projetos novos. Você pode desativar a qualquer momento no app ou nas configurações do celular.</p>

        <h2>9. O que não fazemos</h2>
        <ul>
          <li>Não exibimos anúncios.</li>
          <li>Não vendemos nem compartilhamos dados com terceiros para publicidade.</li>
          <li>Não coletamos dados de crianças. O app é destinado a maiores de 18 anos.</li>
        </ul>

        <h2>10. Seus direitos</h2>
        <p>
          Você pode pedir informações, correção ou exclusão de dados a qualquer momento. Como não guardamos cadastro, na maioria dos casos basta limpar os dados do app no
          seu aparelho.
        </p>

        <h2>11. Contato</h2>
        <p>Dúvidas sobre esta política ou sobre os seus dados: {zap ? <>WhatsApp {zap}</> : "pelo contato informado na loja de aplicativos"}.</p>

        <p>Esta política pode ser atualizada. A data da última versão fica no topo desta página.</p>
      </div>
    </div>
  );
}
