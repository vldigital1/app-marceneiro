<?php
// PDFs e vistas técnicas dos projetos exclusivos — só com acesso liberado.
require __DIR__ . '/_lib.php';
exigir_origem();
$tipo = (string) ($_GET['tipo'] ?? '');
$id = (string) ($_GET['id'] ?? '');
$v = (string) ($_GET['v'] ?? '');
if (!id_valido($id) || !in_array($tipo, ['pdf', 'render'], true) || ($tipo === 'render' && !in_array($v, ['explodida', 'vistas'], true))) {
    http_response_code(400);
    exit;
}
if (!liberado()) {
    http_response_code(401);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Conteúdo bloqueado. Digite a senha de desbloqueio no app.';
    exit;
}
$arquivo = $tipo === 'pdf' ? DADOS . '/pdf/' . $id . '.pdf' : DADOS . '/render/' . $id . '/' . $v . '.svg';
if (!is_file($arquivo)) {
    http_response_code(404);
    exit;
}
if ($tipo === 'pdf') {
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="' . $id . '.pdf"');
} else {
    header('Content-Type: image/svg+xml');
}
header('Content-Length: ' . (string) filesize($arquivo));
readfile($arquivo);
