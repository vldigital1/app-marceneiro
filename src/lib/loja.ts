// Versão para lojas de apps (Google Play): NEXT_PUBLIC_LOJA=1 no build.
// Sem PIX, sem preço e sem botão de compra — quem já tem acesso só digita a senha.
export const LOJA = process.env.NEXT_PUBLIC_LOJA === "1";
