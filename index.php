<?php

//Defaults
error_reporting(E_ALL ^ E_STRICT);
setlocale (LC_ALL, 'pt_BR');
date_default_timezone_set('America/Sao_Paulo');

include '.app/lib/functions.php';

//Constants
//define('URL', 'http://54.149.118.130/');
define('QMODE', 'dev'); // options: dev & pro
define('ROOT', str_replace('\\', '/', strpos(__DIR__, 'phar://') !== false
                    ? dirname(str_replace('phar://', '', __DIR__)).'/'
                    : __DIR__.'/'));

define('RPHAR', (strpos(ROOT, 'phar://') !== false) ? ROOT : false);

//AUTOLOAD
set_include_path(ROOT.PATH_SEPARATOR.get_include_path());
spl_autoload_register(function($class) {
    $class = '.app/' . str_replace('\\', '/', trim(strtolower($class), '\\')) . '.php';
    return (($file = _file_exists($class)) !== false ? require_once $file : false);
});

//Mount the Q static dock
class_alias('Lib\Q', 'Q');
Q::mount();

Q::db(new Lib\Db(['dsn'=>'mysql:host=localhost;dbname=meujor','user'=>'meujor','passw'=>'********']));

// Pegando dados de ACESSO do cliente
Q::db()->query('INSERT INTO access (REQUEST,REMOTE,AGENT,ACCEPT,ENCODING,LANGUAGE,IDATE)
                            VALUES (:req,:rem,:age,:acc,:enc,:lan,:idate)',
                            [':req'=>$_SERVER['REQUEST_URI'],
                             ':rem'=>$_SERVER['REMOTE_ADDR'],
                             ':age'=>$_SERVER['HTTP_USER_AGENT'],
                             ':acc'=>$_SERVER['HTTP_ACCEPT'],
                             ':enc'=>$_SERVER['HTTP_ACCEPT_ENCODING'],
                             ':lan'=>$_SERVER['HTTP_ACCEPT_LANGUAGE'],
                             ':idate'=>date('Y-m-d H:I:s')]);

//Router
switch(Q::rqst(0)){
    case 'user':        Q::ctrl('user');        break;
    case 'pub':         Q::ctrl('article');     break;
    case 'edit':        Q::ctrl('edit');        break;
    case 'sendmail':    Q::ctrl('sendmail');    break;
    case 'login':       Q::ctrl('login');       break;
    case 'upfile':      Q::ctrl('upfile');      break;
    default:            Q::ctrl('capa');        break;
}
