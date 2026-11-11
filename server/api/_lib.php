<?php
// Núcleo do backend do App do Marceneiro (Hostinger / PHP 7.4+).
// A senha é conferida aqui; o navegador só recebe um cookie assinado (HttpOnly).
declare(strict_types=1);

$CFG = require __DIR__ . '/_config.php';

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store, private');
header('X-Robots-Tag: noindex, nofollow');

const COOKIE = 'adm_acesso';
const DADOS = __DIR__ . '/_dados';

function responder(array $dados, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** Só aceita chamadas vindas dos domínios do app (impede outro site de usar esta API). */
function exigir_origem(): void
{
    global $CFG;
    foreach (['HTTP_ORIGIN', 'HTTP_REFERER'] as $h) {
        if (!empty($_SERVER[$h])) {
            $host = strtolower((string) parse_url((string) $_SERVER[$h], PHP_URL_HOST));
            if (!in_array($host, $CFG['dominios'], true)) {
                responder(['ok' => false, 'erro' => 'Origem não autorizada.'], 403);
            }
            return;
        }
    }
}

function b64u(string $s): string
{
    return rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
}

function b64u_dec(string $s): string
{
    return (string) base64_decode(strtr($s, '-_', '+/'));
}

function https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
}

/** Marca da senha dentro do token: trocar a senha invalida todos os acessos antigos. */
function marca(string $senha): string
{
    global $CFG;
    return substr(hash_hmac('sha256', strtoupper($senha), $CFG['segredo']), 0, 20);
}

function definir_cookie(string $valor, int $expira): void
{
    global $CFG;
    setcookie(COOKIE, $valor, [
        'expires' => $expira,
        'path' => ($CFG['base'] ?? '') . '/',
        'secure' => https(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function emitir_acesso(string $senha): void
{
    global $CFG;
    $exp = time() + 86400 * (int) $CFG['dias'];
    $payload = b64u((string) json_encode(['m' => marca($senha), 'e' => $exp]));
    $sig = b64u(hash_hmac('sha256', $payload, $CFG['segredo'], true));
    definir_cookie($payload . '.' . $sig, $exp);
}

function liberado(): bool
{
    global $CFG;
    $c = (string) ($_COOKIE[COOKIE] ?? '');
    if ($c === '' || substr_count($c, '.') !== 1) {
        return false;
    }
    [$payload, $sig] = explode('.', $c);
    if (!hash_equals(b64u(hash_hmac('sha256', $payload, $CFG['segredo'], true)), $sig)) {
        return false;
    }
    $d = json_decode(b64u_dec($payload), true);
    if (!is_array($d) || (int) ($d['e'] ?? 0) < time()) {
        return false;
    }
    foreach ($CFG['senhas'] as $s) {
        if (hash_equals(marca((string) $s), (string) ($d['m'] ?? ''))) {
            return true;
        }
    }
    return false;
}

function senha_valida(string $tentativa): ?string
{
    global $CFG;
    $t = strtoupper(trim($tentativa));
    foreach ($CFG['senhas'] as $s) {
        if ($t !== '' && hash_equals(strtoupper((string) $s), $t)) {
            return (string) $s;
        }
    }
    return null;
}

/** Limite de tentativas por IP: 8 erros a cada 15 minutos. */
function arquivo_tentativas(): string
{
    $dir = DADOS . '/_tentativas';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    return $dir . '/' . sha1((string) ($_SERVER['REMOTE_ADDR'] ?? '?')) . '.json';
}

function bloqueado_por_tentativas(): bool
{
    $f = arquivo_tentativas();
    $d = is_file($f) ? json_decode((string) file_get_contents($f), true) : null;
    return is_array($d) && ($d['n'] ?? 0) >= 8 && time() - ($d['t'] ?? 0) < 900;
}

function registrar_erro(): void
{
    $f = arquivo_tentativas();
    $d = is_file($f) ? json_decode((string) file_get_contents($f), true) : null;
    if (!is_array($d) || time() - ($d['t'] ?? 0) >= 900) {
        $d = ['n' => 0, 't' => time()];
    }
    $d['n']++;
    @file_put_contents($f, json_encode($d), LOCK_EX);
}

function limpar_erros(): void
{
    @unlink(arquivo_tentativas());
}

function id_valido(string $id): bool
{
    return (bool) preg_match('/^[a-z0-9][a-z0-9-]{0,120}$/', $id);
}
