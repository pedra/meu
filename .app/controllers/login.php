<?php
//Verifica a variável POST "data".
if(isset($_POST['data']) && $_POST['data'] != ''){
    //decodificando os dados recebidos.
    $rec = json_decode($_POST['data']);
    //se não contiver os elementos necessários, sai.
    if(!isset($rec->tk) || !isset($rec->key)) exit();
    //Pegando os dados no Banco de Dados.
    Q::db()->query('SELECT * FROM user WHERE TOKEN = :tk AND STATUS = 1', [':tk'=>$rec->tk]);
    $r = Q::db()->result();
    //Se o TOKEN não existir, sai.
    if($r === false) exit();
    $r = $r[0];
    //retirando AKEY para não expor no javascript/web.
    $key = $r->AKEY;
    unset($r->AKEY, $r->ID);

    //Decodifica
    Lib\Aes::size(256);
    $dec = Lib\Aes::dec($rec->key, $key);
    //Se a chave não for identica, sai.
    if($dec != $key) exit();
    //Envia os dados do usuário encriptado com a KEY do BD.
    exit(Lib\Aes::enc(json_encode($r), $key));
}
//Se não for enviado "dados", vai para a Capa.
Q::go();