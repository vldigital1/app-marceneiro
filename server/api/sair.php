<?php
require __DIR__ . '/_lib.php';
exigir_origem();
definir_cookie('', time() - 3600);
responder(['ok' => true]);
