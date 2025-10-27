<?php
require_once __DIR__ . '../vendor/autoload.php';

$loader = new \Twig\Loader\FilesystemLoader(__DIR__ . '/../templates');
$twig = new \Twig\Environment($loader, [
    'cache' => false,
    'debug' => true,
]);

$path = $_SERVER['REQUEST_URI'];
// strip query
$path = parse_url($path, PHP_URL_PATH);

if ($path === '/' || $path === '/index.php') {
    echo $twig->render('landing.twig');
    exit;
}

if ($path === '/tickets') {
    echo $twig->render('tickets.twig');
    exit;
}

if ($path === '/dashboard') {
    echo $twig->render('dashboard.twig');
    exit;
}

if ($path === '/auth/login') {
    echo $twig->render('auth/login.twig');
    exit;
}

if ($path === '/auth/signup') {
    echo $twig->render('auth/signup.twig');
    exit;
}

// static files under /assets
if (strpos($path, '/assets/') === 0) {
    $file = __DIR__ . $path;
    if (file_exists($file)) {
        $mime = mime_content_type($file);
        header('Content-Type: ' . $mime);
        readfile($file);
        exit;
    }
}

// fallback
header('HTTP/1.1 404 Not Found');
echo $twig->render('404.twig');
