<?php
require __DIR__ . '/_lib.php';
exigir_origem();
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    responder(['ok' => false, 'erro' => 'Método não permitido.'], 405);
}
if (bloqueado_por_tentativas()) {
    responder(['ok' => false, 'erro' => 'Muitas tentativas. Aguarde 15 minutos e tente de novo.'], 429);
}
$corpo = json_decode((string) file_get_contents('php://input'), true);
$senha = senha_valida(is_array($corpo) ? (string) ($corpo['senha'] ?? '') : '');
if ($senha === null) {
    registrar_erro();
    usleep(600000); // atrasa quem tenta adivinhar
    responder(['ok' => false, 'erro' => 'Senha incorreta. Confira a senha que chegou no WhatsApp.'], 401);
}
limpar_erros();
emitir_acesso($senha);
responder(['ok' => true]);
