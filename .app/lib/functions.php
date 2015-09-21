<?php
//Check if file exists - return real path of file or false
function _file_exists($file){
    if(file_exists($file)) return $file;
    if(file_exists(ROOT.$file)) return ROOT.$file;
    if(file_exists(RPHAR.$file)) return RPHAR.$file;
    $xfile = str_replace(ROOT, RPHAR, $file);
    if(file_exists($xfile)) return $xfile;
    return false;
}

//Print mixed data and exit
function e($v) { exit(p($v)); }
function p($v, $echo = false) {
    $tmp = '<pre>' . print_r($v, true) . '</pre>';
    if ($echo) echo $tmp;
    else return $tmp;
}

//Nome do MÊS em português
function _mes($n = 1){
    $m=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    if($n < 1 || $n > 12) $n = 1;
    return $m[$n-1];
}

//DIA da semana
function _dia($n){
    $d = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
    if($n < 0 || $n > 6) $n = 0;
    return $d[$n];
}


//Download de arquivo em modo PHAR (interno)
function download($reqst = '') {

    //checando a existencia do arquivo solicitado
    $reqst = _file_exists($reqst);
    if($reqst == false) return false;

    //gerando header apropriado
    include ROOT . 'php/config/mimetypes.php';
    $ext = end((explode('.', $reqst)));
    if (!isset($_mimes[$ext])) $mime = 'text/plain';
    else $mime = (is_array($_mimes[$ext])) ? $_mimes[$ext][0] : $_mimes[$ext];

    //get file
    $dt = file_get_contents($reqst);

    //download
    ob_end_clean();
    ob_start('ob_gzhandler');

    header('Vary: Accept-Language, Accept-Encoding');
    header('Content-Type: ' . $mime);
    header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
    header('Last-Modified: ' . gmdate('D, d M Y H:i:s', filemtime($reqst)) . ' GMT');
    header('Cache-Control: must_revalidate, public, max-age=31536000');
    header('Content-Length: ' . strlen($dt));
    header('x-Server: Qzumba.com');
    header('ETAG: '.md5($reqst));
    exit($dt);
}