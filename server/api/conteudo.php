<?php
// Entrega projetos, aulas e vídeos exclusivos — só com acesso liberado.
require __DIR__ . '/_lib.php';
exigir_origem();
$tipo = (string) ($_GET['tipo'] ?? '');
$id = (string) ($_GET['id'] ?? '');
if (!in_array($tipo, ['projeto', 'aula', 'video'], true) || !id_valido($id)) {
    responder(['erro' => 'Pedido inválido.'], 400);
}
if (!liberado()) {
    responder(['erro' => 'Conteúdo bloqueado.'], 401);
}
$arquivo = DADOS . '/' . $tipo . '/' . $id . '.json';
if (!is_file($arquivo)) {
    responder(['erro' => 'Não encontrado.'], 404);
}
header('Content-Type: application/json; charset=utf-8');
readfile($arquivo);
