<?php

//Se "data" existir...
if(isset($_POST['data'])) {

    $rec = json_decode($_POST['data']);

    if(isset($rec->file) && isset($rec->tk)){

        //Pegando os dados no Banco de Dados.
        Q::db()->query('SELECT AKEY FROM user WHERE TOKEN = :tk AND STATUS = 1', [':tk'=>$rec->tk]);
        $r = Q::db()->result();
        //Se o TOKEN não existir, sai.
        if($r === false) exit(1);

        //Decodifica
        Lib\Aes::size(256);
        $dec = Lib\Aes::dec($rec->file, $r[0]->AKEY);
        //Se a chave não for identica, sai.
        if(!$dec) exit(2);


        $dir = Q::upload().$rec->tk.'/';
        if(!is_dir($dir)){
            mkdir($dir, 0777, true);
            chmod($dir, 0777);
        }

        $can = new Lib\Can;
        $name = str_shuffle($can->encode((microtime(true)*100000)/2).$can->encode((microtime(true)*100000)/3));

        file_put_contents($dir.$name, base64_decode($dec));
        exit(json_encode(['name'=>$name]));
    }

    if(isset($rec->tk) && isset($rec->type) && $rec->type == 'get'){

        $dir = Q::upload().$rec->tk.'/';

        if(file_exists($dir.$rec->name)){

            //Pegando os dados no Banco de Dados.
            Q::db()->query('SELECT AKEY FROM user WHERE TOKEN = :tk AND STATUS = 1', [':tk'=>$rec->tk]);
            $r = Q::db()->result();
            //Se o TOKEN não existir, sai.
            if($r === false) exit(3);

            $f = base64_encode(file_get_contents($dir.$rec->name));

            //Codifica com AKEY do usuário (TK)
            Lib\Aes::size(256);
            $f = Lib\Aes::enc($f, $r[0]->AKEY);

            exit(json_encode(array_merge(get_object_vars($rec), ['name'=>$rec->name, 'file'=>$f])));
        }
    }
}

//Se não, vai para a Capa
Q::go();