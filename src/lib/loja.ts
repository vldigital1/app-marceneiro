// Versão para lojas de apps (Google Play): NEXT_PUBLIC_LOJA=1 no build.
// Sem PIX, sem preço e sem botão de compra — quem já tem acesso só digita a senha.
export const LOJA = process.env.NEXT_PUBLIC_LOJA === "1";

// Lançamento na loja: NEXT_PUBLIC_LANCAMENTO=1 libera tudo para todos (sem senha) por tempo limitado.
// Para voltar a bloquear, apague a variável na Vercel e faça Redeploy.
export const LANCAMENTO = LOJA && process.env.NEXT_PUBLIC_LANCAMENTO === "1";

// Endereço do app na Google Play (botão "Avaliar")
export const PACOTE_PLAY = "online.appmarceneiro.app";
export const LINK_PLAY = `https://play.google.com/store/apps/details?id=${PACOTE_PLAY}`;
